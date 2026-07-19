#!/usr/bin/env bash
set -euo pipefail

umask 0027

readonly DEPLOY_ROOT=/srv/serhatsoruklu
readonly REPOSITORY_DIR=/srv/serhatsoruklu/repo
readonly RELEASES_DIR=/srv/serhatsoruklu/releases
readonly EXPECTED_ORIGIN=https://github.com/SerhatSoruklu/serhat-soruklu-web.git

die() {
  printf 'deploy: %s\n' "$*" >&2
  exit 1
}

[[ $# -eq 1 ]] || die 'usage: deploy.sh <40-character-git-sha>'
readonly REQUESTED_SHA=$1
[[ "$REQUESTED_SHA" =~ ^[0-9a-f]{40}$ ]] || die 'the release SHA must contain exactly 40 lowercase hexadecimal characters'
[[ "$(id -un)" == serhatsoruklu-deploy ]] || die 'run this script as serhatsoruklu-deploy'
[[ -d "$DEPLOY_ROOT" && -d "$RELEASES_DIR" ]] || die 'the isolated deployment paths are missing'

available_kib=$(awk '/^MemAvailable:/ { print $2 }' /proc/meminfo)
(( available_kib >= 2097152 )) || die 'less than 2 GiB of memory is available'
available_blocks=$(df -Pk "$RELEASES_DIR" | awk 'NR == 2 { print $4 }')
(( available_blocks >= 10485760 )) || die 'less than 10 GiB of disk space is available'
cpu_count=$(getconf _NPROCESSORS_ONLN)
read -r load_one _ < /proc/loadavg
awk -v load_value="$load_one" -v cpus="$cpu_count" 'BEGIN { exit !(load_value < cpus * 1.5) }' || die 'one-minute load is above the release safety threshold'

if [[ ! -d "$REPOSITORY_DIR/.git" ]]; then
  [[ -z "$(find "$REPOSITORY_DIR" -mindepth 1 -maxdepth 1 -print -quit)" ]] || die 'repository directory is not empty'
  git clone --no-checkout --origin origin "$EXPECTED_ORIGIN" "$REPOSITORY_DIR"
fi

actual_origin=$(git -C "$REPOSITORY_DIR" remote get-url origin)
[[ "$actual_origin" == "$EXPECTED_ORIGIN" ]] || die 'repository origin does not match the approved GitHub repository'

git -C "$REPOSITORY_DIR" fetch --prune origin main
main_sha=$(git -C "$REPOSITORY_DIR" rev-parse --verify 'origin/main^{commit}')
[[ "$main_sha" == "$REQUESTED_SHA" ]] || die 'requested SHA is not the current GitHub origin/main SHA'

if git -C "$REPOSITORY_DIR" ls-tree -r --name-only "$REQUESTED_SHA" \
  | awk -F/ '$NF == ".env" || $NF ~ /^\.env\.(local|production|development|staging)$/ { found=1 } END { exit !found }'; then
  die 'a deployable environment file is committed in the release tree'
fi

for lockfile in package-lock.json frontend/package-lock.json backend/package-lock.json; do
  git -C "$REPOSITORY_DIR" cat-file -e "$REQUESTED_SHA:$lockfile" \
    || die "required lockfile is absent: $lockfile"
done

timestamp=$(date -u +%Y%m%dT%H%M%SZ)
readonly RELEASE_DIR="$RELEASES_DIR/${timestamp}-${REQUESTED_SHA:0:12}"
[[ ! -e "$RELEASE_DIR" ]] || die 'release directory already exists'

cleanup_failed_release() {
  if [[ -d "$RELEASE_DIR" ]] && [[ ! -L "$DEPLOY_ROOT/current" || "$(readlink -f "$DEPLOY_ROOT/current")" != "$RELEASE_DIR" ]]; then
    git -C "$REPOSITORY_DIR" worktree remove --force "$RELEASE_DIR" >/dev/null 2>&1 || true
  fi
}
trap cleanup_failed_release ERR

git -C "$REPOSITORY_DIR" worktree add --detach "$RELEASE_DIR" "$REQUESTED_SHA"
[[ -z "$(git -C "$RELEASE_DIR" status --porcelain=v1 --untracked-files=all)" ]] \
  || die 'detached release checkout is dirty before installation'
[[ "$(git -C "$RELEASE_DIR" rev-parse HEAD)" == "$REQUESTED_SHA" ]] || die 'detached release SHA mismatch'

cd "$RELEASE_DIR"

run_low_priority() {
  nice -n 10 ionice -c 2 -n 7 "$@"
}

run_low_priority npm ci --ignore-scripts
run_low_priority npm run install:projects
run_low_priority npm run lint
run_low_priority npm run check
run_low_priority npm test
run_low_priority npm run audit:production

# Build last so the promoted artifact is the output of the final production build.
run_low_priority npm run build:production
run_low_priority npm run assert:production
run_low_priority npm run smoke:production

if find frontend/dist/frontend -type f -name '*.map' -print -quit | grep -q .; then
  die 'production source map detected'
fi
if rg -l --fixed-strings 'http://localhost' frontend/dist/frontend/browser >/dev/null \
  || rg -l --fixed-strings 'http://127.0.0.1' frontend/dist/frontend/browser >/dev/null; then
  die 'localhost reference detected in browser output'
fi

artifact_manifest=$(mktemp)
find frontend/dist/frontend -type f -print0 \
  | sort -z \
  | xargs -0 sha256sum > "$artifact_manifest"
git ls-files -z backend \
  | while IFS= read -r -d '' path; do sha256sum "$path"; done \
  >> "$artifact_manifest"
sha256sum "$artifact_manifest" | awk '{ print $1 }' > .artifact.sha256
rm -f "$artifact_manifest"
chmod 0640 .artifact.sha256

[[ -z "$(git status --porcelain=v1 --untracked-files=no)" ]] || die 'tracked release files changed during validation'

trap - ERR
printf 'release_dir=%s\n' "$RELEASE_DIR"
printf 'release_sha=%s\n' "$REQUESTED_SHA"
printf 'artifact_sha256=%s\n' "$(<.artifact.sha256)"
printf 'next=sudo -n /usr/local/sbin/serhatsoruklu-deploy-helper activate-release %s\n' "$RELEASE_DIR"
