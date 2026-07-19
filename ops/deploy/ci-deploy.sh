#!/usr/bin/env bash
set -euo pipefail

umask 0027
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export GIT_TERMINAL_PROMPT=0

readonly DEPLOY_ROOT=/srv/serhatsoruklu
readonly REPOSITORY_DIR=/srv/serhatsoruklu/repo
readonly RELEASES_DIR=/srv/serhatsoruklu/releases
readonly DEPLOY_HELPER=/usr/local/sbin/serhatsoruklu-deploy-helper

die() {
  printf 'ci-deploy: %s\n' "$*" >&2
  exit 1
}

[[ "$(id -un)" == serhatsoruklu-deploy ]] \
  || die 'run this command as serhatsoruklu-deploy'
[[ "${SSH_ORIGINAL_COMMAND:-}" =~ ^deploy\ ([0-9a-f]{40})$ ]] \
  || die 'the forced SSH command must be deploy followed by one full Git SHA'
readonly REQUESTED_SHA=${BASH_REMATCH[1]}

[[ -d "$REPOSITORY_DIR/.git" && -d "$RELEASES_DIR" ]] \
  || die 'the isolated deployment paths are missing'
[[ -x "$DEPLOY_HELPER" ]] || die 'the root-owned deployment helper is unavailable'

exec 9>"$RELEASES_DIR/.ci-deploy.lock"
flock -n 9 || die 'another production deployment is already running'

git -C "$REPOSITORY_DIR" fetch --prune origin main
main_sha=$(git -C "$REPOSITORY_DIR" rev-parse --verify 'origin/main^{commit}')
[[ "$main_sha" == "$REQUESTED_SHA" ]] \
  || die 'requested SHA is not the current GitHub origin/main SHA'

install -d -m 0700 "$HOME/.runtime"
runtime_environment=$(mktemp "$HOME/.runtime/backend.env.XXXXXXXX")
release_script=$(mktemp)
deployment_output=$(mktemp)
cleanup() {
  rm -f -- "$runtime_environment" "$release_script" "$deployment_output"
}
trap cleanup EXIT

dd bs=65537 count=1 status=none > "$runtime_environment"
[[ -s "$runtime_environment" ]] || die 'the production backend environment is empty'
(( $(stat -c '%s' "$runtime_environment") <= 65536 )) \
  || die 'the production backend environment exceeds 64 KiB'
grep -Iq . "$runtime_environment" || die 'the production backend environment is not text'
chmod 0600 "$runtime_environment"

git -C "$REPOSITORY_DIR" show "$REQUESTED_SHA:ops/deploy/deploy.sh" \
  > "$release_script"
chmod 0700 "$release_script"

"$release_script" "$REQUESTED_SHA" | tee "$deployment_output"
mapfile -t release_paths < <(sed -n 's/^release_dir=//p' "$deployment_output")
[[ ${#release_paths[@]} -eq 1 ]] \
  || die 'release build did not emit exactly one release path'
readonly RELEASE_DIR=${release_paths[0]}
[[ "$RELEASE_DIR" =~ ^/srv/serhatsoruklu/releases/[0-9]{8}T[0-9]{6}Z-[0-9a-f]{12}$ ]] \
  || die 'release build emitted an invalid release path'

sudo -n "$DEPLOY_HELPER" install-backend-environment "$runtime_environment"
sudo -n "$DEPLOY_HELPER" activate-release "$RELEASE_DIR"
sudo -n "$DEPLOY_HELPER" install-nginx-tls serhatsoruklu.com

[[ "$(readlink -f "$DEPLOY_ROOT/current")" == "$RELEASE_DIR" ]] \
  || die 'current release link does not match the promoted release'
curl --noproxy '*' --fail --silent --show-error --max-time 8 \
  http://127.0.0.1:4102/healthz >/dev/null
curl --noproxy '*' --fail --silent --show-error --max-time 8 \
  http://127.0.0.1:4302/api/health >/dev/null

printf 'deployed_sha=%s\n' "$REQUESTED_SHA"
printf 'deployed_release=%s\n' "$RELEASE_DIR"
