#!/usr/bin/env bash
set -euo pipefail

readonly REPOSITORY=SerhatSoruklu/serhat-soruklu-web
readonly ENVIRONMENT=production
readonly SECRET_NAME=SERHATSORUKLU_BACKEND_ENV
readonly ENV_FILE=${1:-backend/.env.production}
readonly APPROVED_COMPANY_MAILBOX=admin@coupyn.com
readonly APPROVED_SMTP_HOST=smtp.gmail.com
readonly APPROVED_SMTP_NAME=serhatsoruklu.com

die() {
  printf 'publish-backend-environment: %s\n' "$*" >&2
  exit 1
}

[[ -f "$ENV_FILE" && ! -L "$ENV_FILE" ]] \
  || die "environment file is absent or is not a regular file: $ENV_FILE"
command -v gh >/dev/null || die 'GitHub CLI is required'
gh auth status >/dev/null 2>&1 || die 'GitHub CLI is not authenticated'

declare -A environment=()
while IFS= read -r line || [[ -n "$line" ]]; do
  line=${line%$'\r'}
  [[ -z "$line" || "$line" == \#* ]] && continue
  [[ "$line" =~ ^([A-Z][A-Z0-9_]*)=(.*)$ ]] || die 'environment file contains an invalid entry'
  name=${BASH_REMATCH[1]}
  value=${BASH_REMATCH[2]}
  [[ ! -v "environment[$name]" ]] || die "duplicate environment variable: $name"
  environment["$name"]=$value
done < "$ENV_FILE"

required=(
  NODE_ENV PORT CORS_ORIGINS TRUST_PROXY MONGODB_URI SMTP_HOST SMTP_PORT SMTP_SECURE
  SMTP_REQUIRE_TLS SMTP_NAME SMTP_TLS_REJECT_UNAUTHORIZED SERHAT_SITE_URL
  CONTACT_MAIL_TIMEOUT_MS CONTACT_RATE_LIMIT_WINDOW_MS CONTACT_RATE_LIMIT_MAX
  CONTACT_IDEMPOTENCY_TTL_MS CONTACT_IDEMPOTENCY_MAX_ENTRIES SMTP_VERIFY_ON_START
  SMTP_VERIFY_TIMEOUT_MS STATIC_RATE_LIMIT_WINDOW_MS STATIC_RATE_LIMIT_MAX SHUTDOWN_TIMEOUT_MS
)
for name in "${required[@]}"; do
  [[ -n "${environment[$name]:-}" ]] || die "missing required variable: $name"
done
for name in SMTP_USER SMTP_PASS CONTACT_INTERNAL_TO CONTACT_REPLY_TO; do
  [[ -v "environment[$name]" ]] || die "missing contact variable: $name"
done

[[ "${environment[NODE_ENV]}" == production && "${environment[PORT]}" == 4302 ]] \
  || die 'runtime mode or port is not production-safe'
[[ "${environment[TRUST_PROXY]}" == 1 ]] || die 'TRUST_PROXY must be 1'
[[ "${environment[CORS_ORIGINS]}" == 'https://serhatsoruklu.com,https://www.serhatsoruklu.com' ]] \
  || die 'CORS_ORIGINS is not the approved production allowlist'
[[ "${environment[SERHAT_SITE_URL]}" == https://serhatsoruklu.com ]] \
  || die 'SERHAT_SITE_URL is not the production apex'
[[ "${environment[MONGODB_URI]}" == mongodb://serhatsoruklu_app:*@127.0.0.1:27017/serhatsoruklu\?* \
  && "${environment[MONGODB_URI]}" == *'authSource=serhatsoruklu'* ]] \
  || die 'MONGODB_URI is not isolated to the Serhat database user'

if [[ -n "${environment[SMTP_USER]}${environment[SMTP_PASS]}${environment[CONTACT_INTERNAL_TO]}${environment[CONTACT_REPLY_TO]}" ]]; then
  for name in SMTP_USER SMTP_PASS CONTACT_INTERNAL_TO CONTACT_REPLY_TO; do
    [[ -n "${environment[$name]}" ]] || die 'contact delivery must be fully configured or fully disabled'
  done
  for value in "${environment[SMTP_HOST]}" "${environment[SMTP_NAME]}" "${environment[SMTP_USER]}" "${environment[SMTP_PASS]}" "${environment[CONTACT_INTERNAL_TO]}" "${environment[CONTACT_REPLY_TO]}"; do
    [[ ! "${value,,}" =~ (replace|placeholder|example\.com|chatpdm) ]] \
      || die 'contact delivery contains a placeholder or forbidden identity'
  done
  [[ "${environment[SMTP_HOST],,}" == "$APPROVED_SMTP_HOST" \
    && "${environment[SMTP_NAME],,}" == "$APPROVED_SMTP_NAME" \
    && "${environment[SMTP_USER],,}" == "$APPROVED_COMPANY_MAILBOX" \
    && "${environment[CONTACT_INTERNAL_TO],,}" == "$APPROVED_COMPANY_MAILBOX" \
    && "${environment[CONTACT_REPLY_TO],,}" == "$APPROVED_COMPANY_MAILBOX" ]] \
    || die 'contact delivery is not restricted to the approved company mailbox'
  [[ "${environment[SMTP_VERIFY_ON_START]}" == true ]] \
    || die 'enabled contact delivery requires SMTP_VERIFY_ON_START=true'
else
  [[ "${environment[SMTP_VERIFY_ON_START]}" == false ]] \
    || die 'disabled contact delivery requires SMTP_VERIFY_ON_START=false'
fi

gh secret set "$SECRET_NAME" --repo "$REPOSITORY" --env "$ENVIRONMENT" < "$ENV_FILE"
printf 'production_environment_secret=updated\n'
