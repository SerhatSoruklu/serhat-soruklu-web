#!/usr/bin/env bash
set -euo pipefail

umask 0027

readonly ROOT=/srv/serhatsoruklu
readonly RELEASES=/srv/serhatsoruklu/releases
readonly CURRENT=/srv/serhatsoruklu/current
readonly SITE_AVAILABLE=/etc/nginx/sites-available/serhatsoruklu.conf
readonly SITE_ENABLED=/etc/nginx/sites-enabled/serhatsoruklu.conf
readonly ORIGIN_SNIPPET=/etc/nginx/snippets/serhatsoruklu-cloudflare-origin-only.conf
readonly BACKUP_ROOT=/var/backups/serhatsoruklu/nginx
readonly FRONTEND_UNIT=/etc/systemd/system/serhatsoruklu-frontend.service
readonly BACKEND_UNIT=/etc/systemd/system/serhatsoruklu-backend.service
readonly BACKUP_UNIT=/etc/systemd/system/serhatsoruklu-mongodb-backup.service
readonly BACKUP_TIMER=/etc/systemd/system/serhatsoruklu-mongodb-backup.timer
readonly BACKUP_SCRIPT=/usr/local/sbin/serhatsoruklu-mongodb-backup
readonly FRONTEND_ENV=/etc/serhatsoruklu/frontend.env
readonly BACKEND_ENV=/etc/serhatsoruklu/backend.env
readonly BACKUP_ENV=/etc/serhatsoruklu/backup.env
readonly ACME_ROOT=/var/lib/serhatsoruklu/acme

die() {
  printf 'serhatsoruklu-helper: %s\n' "$*" >&2
  exit 1
}

[[ $EUID -eq 0 ]] || die 'root privileges are required'

validate_release() {
  local requested=$1 resolved
  [[ "$requested" == "$RELEASES"/* ]] || die 'release is outside the exact release root'
  [[ ! -L "$requested" && -d "$requested" ]] || die 'release must be a real directory'
  resolved=$(realpath -e -- "$requested")
  [[ "$resolved" == "$requested" && "$resolved" =~ ^/srv/serhatsoruklu/releases/[0-9]{8}T[0-9]{6}Z-[0-9a-f]{12}$ ]] \
    || die 'release path is not canonical or does not match the release naming policy'
  [[ -f "$resolved/.artifact.sha256" ]] || die 'release artifact checksum is absent'
  [[ -f "$resolved/ops/systemd/serhatsoruklu-frontend.service" ]] || die 'frontend unit source is absent'
  [[ -f "$resolved/ops/systemd/serhatsoruklu-backend.service" ]] || die 'backend unit source is absent'
  printf '%s\n' "$resolved"
}

current_release() {
  [[ -L "$CURRENT" ]] || return 1
  realpath -e -- "$CURRENT"
}

validate_environment_file() {
  local path=$1 expected_mode=$2 metadata
  [[ -f "$path" && ! -L "$path" ]] || die "environment file is absent or not a regular file: $path"
  metadata=$(stat -c '%U:%G %a' "$path")
  [[ "$metadata" == "root:serhatsoruklu $expected_mode" ]] \
    || die "environment file ownership/mode is invalid: $path"
}

load_environment() {
  local path=$1 output_name=$2 line name value
  local -n output=$output_name
  output=()
  while IFS= read -r line || [[ -n "$line" ]]; do
    line=${line%$'\r'}
    [[ -z "$line" || "$line" == \#* ]] && continue
    [[ "$line" =~ ^([A-Z][A-Z0-9_]*)=(.*)$ ]] || die "invalid environment entry in $path"
    name=${BASH_REMATCH[1]}
    value=${BASH_REMATCH[2]}
    [[ ! -v "output[$name]" ]] || die "duplicate environment variable in $path: $name"
    if [[ ${#value} -ge 2 && "${value:0:1}" == "'" && "${value: -1}" == "'" ]]; then
      value=${value:1:${#value}-2}
    elif [[ ${#value} -ge 2 && "${value:0:1}" == '"' && "${value: -1}" == '"' ]]; then
      value=${value:1:${#value}-2}
    fi
    output["$name"]=$value
  done < "$path"
}

validate_runtime_environment() {
  local name value
  local -a required=()
  local -A frontend=() backend=()
  validate_environment_file "$FRONTEND_ENV" 640
  validate_environment_file "$BACKEND_ENV" 640
  load_environment "$FRONTEND_ENV" frontend
  load_environment "$BACKEND_ENV" backend

  required=(NODE_ENV PORT FRONTEND_HOST FRONTEND_CANONICAL_HOST FRONTEND_ENABLE_HSTS FRONTEND_ENFORCE_HTTPS FRONTEND_SHUTDOWN_TIMEOUT_MS FRONTEND_TRUST_PROXY)
  for name in "${required[@]}"; do [[ -n "${frontend[$name]:-}" ]] || die "missing frontend variable: $name"; done
  [[ "${frontend[NODE_ENV]}" == production && "${frontend[PORT]}" == 4102 && "${frontend[FRONTEND_HOST]}" == 127.0.0.1 ]] || die 'frontend runtime binding is invalid'
  [[ "${frontend[FRONTEND_CANONICAL_HOST]}" == serhatsoruklu.com && "${frontend[FRONTEND_TRUST_PROXY]}" == loopback ]] || die 'frontend host/proxy configuration is invalid'
  [[ "${frontend[FRONTEND_ENABLE_HSTS]}" == true && "${frontend[FRONTEND_ENFORCE_HTTPS]}" == true ]] || die 'frontend HTTPS configuration is invalid'

  required=(NODE_ENV PORT CORS_ORIGINS TRUST_PROXY MONGODB_URI SMTP_HOST SMTP_PORT SMTP_SECURE SMTP_REQUIRE_TLS SMTP_NAME SMTP_TLS_REJECT_UNAUTHORIZED SERHAT_SITE_URL CONTACT_MAIL_TIMEOUT_MS CONTACT_RATE_LIMIT_WINDOW_MS CONTACT_RATE_LIMIT_MAX CONTACT_IDEMPOTENCY_TTL_MS CONTACT_IDEMPOTENCY_MAX_ENTRIES SMTP_VERIFY_ON_START SMTP_VERIFY_TIMEOUT_MS STATIC_RATE_LIMIT_WINDOW_MS STATIC_RATE_LIMIT_MAX SHUTDOWN_TIMEOUT_MS)
  for name in "${required[@]}"; do [[ -n "${backend[$name]:-}" ]] || die "missing backend variable: $name"; done
  for name in SMTP_USER SMTP_PASS CONTACT_INTERNAL_TO CONTACT_REPLY_TO; do
    [[ -v "backend[$name]" ]] || die "missing backend variable: $name"
  done
  [[ "${backend[NODE_ENV]}" == production && "${backend[PORT]}" == 4302 && "${backend[TRUST_PROXY]}" == 1 ]] || die 'backend runtime binding/proxy configuration is invalid'
  [[ "${backend[CORS_ORIGINS]}" == 'https://serhatsoruklu.com,https://www.serhatsoruklu.com' ]] || die 'backend CORS configuration is invalid'
  [[ "${backend[SERHAT_SITE_URL]}" == https://serhatsoruklu.com ]] || die 'backend public site URL is invalid'
  [[ "${backend[MONGODB_URI]}" == mongodb://serhatsoruklu_app:*@127.0.0.1:27017/serhatsoruklu\?* ]] || die 'backend MongoDB URI is not isolated'
  [[ "${backend[MONGODB_URI]}" == *'authSource=serhatsoruklu'* ]] || die 'backend MongoDB authSource is not isolated'
  if [[ -n "${backend[SMTP_USER]}${backend[SMTP_PASS]}${backend[CONTACT_INTERNAL_TO]}${backend[CONTACT_REPLY_TO]}" ]]; then
    for name in SMTP_USER SMTP_PASS CONTACT_INTERNAL_TO CONTACT_REPLY_TO; do
      [[ -n "${backend[$name]}" ]] || die 'backend contact delivery must be fully configured or fully disabled'
    done
    for value in "${backend[SMTP_USER]}" "${backend[CONTACT_INTERNAL_TO]}" "${backend[CONTACT_REPLY_TO]}"; do
      [[ "$value" == *@*.* && "$value" != *','* && "$value" != *';'* ]] || die 'backend email identity is not a single mailbox'
    done
    for value in "${backend[SMTP_HOST]}" "${backend[SMTP_NAME]}" "${backend[SMTP_USER]}" "${backend[SMTP_PASS]}" "${backend[CONTACT_INTERNAL_TO]}" "${backend[CONTACT_REPLY_TO]}"; do
      [[ ! "${value,,}" =~ (replace|placeholder|example\.com|coupyn|chatpdm) ]] || die 'backend environment contains a placeholder or protected-platform identity'
    done
  else
    [[ "${backend[SMTP_VERIFY_ON_START]}" == false ]] || die 'disabled contact delivery requires SMTP_VERIFY_ON_START=false'
  fi
  printf 'runtime_environment=valid\n'
}

contact_delivery_enabled() {
  local -A backend=()
  load_environment "$BACKEND_ENV" backend
  [[ -n "${backend[SMTP_USER]:-}" && -n "${backend[SMTP_PASS]:-}" \
    && -n "${backend[CONTACT_INTERNAL_TO]:-}" && -n "${backend[CONTACT_REPLY_TO]:-}" ]]
}

validate_backup_environment() {
  local name retention
  local -a required=()
  local -A backup=()
  validate_environment_file "$BACKUP_ENV" 600
  load_environment "$BACKUP_ENV" backup
  required=(MONGODB_BACKUP_URI BACKUP_S3_URI BACKUP_RETENTION_DAYS AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_DEFAULT_REGION)
  for name in "${required[@]}"; do [[ -n "${backup[$name]:-}" ]] || die "missing backup variable: $name"; done
  [[ "${backup[MONGODB_BACKUP_URI]}" == mongodb://serhatsoruklu_backup:*@127.0.0.1:27017/serhatsoruklu\?* ]] || die 'backup MongoDB URI is not isolated'
  [[ "${backup[MONGODB_BACKUP_URI]}" == *'authSource=serhatsoruklu'* ]] || die 'backup MongoDB authSource is not isolated'
  [[ "${backup[BACKUP_S3_URI]}" =~ ^s3://[a-zA-Z0-9._-]+/.+serhatsoruklu/?$ ]] || die 'backup object prefix is not dedicated'
  retention=${backup[BACKUP_RETENTION_DAYS]}
  [[ "$retention" =~ ^[0-9]+$ ]] && (( retention >= 7 && retention <= 365 )) || die 'backup retention is invalid'
  printf 'backup_environment=valid\n'
}

local_health() {
  curl --noproxy '*' --fail --silent --show-error --max-time 5 http://127.0.0.1:4102/healthz >/dev/null
  curl --noproxy '*' --fail --silent --show-error --max-time 5 http://127.0.0.1:4302/api/health >/dev/null
  if contact_delivery_enabled; then
    curl --noproxy '*' --fail --silent --show-error --max-time 8 http://127.0.0.1:4302/api/ready >/dev/null
  fi
}

assert_port_free_when_inactive() {
  local service=$1 port=$2
  if ! systemctl is-active --quiet "$service" \
    && ss -ltnH | awk -v expected=":$port" '$4 ~ expected "$" { found=1 } END { exit !found }'; then
    die "port $port already has a listener while $service is inactive"
  fi
}

assert_loopback_bindings() {
  local output
  output=$(ss -ltnH)
  grep -Eq '127\.0\.0\.1:4102[[:space:]]' <<<"$output" || return 1
  grep -Eq '127\.0\.0\.1:4302[[:space:]]' <<<"$output" || return 1
  ! grep -Eq '(^|[[:space:]])(0\.0\.0\.0|\*|\[::\]|:::):?(4102|4302)[[:space:]]' <<<"$output" \
    || return 1
}

wait_for_local_health() {
  local attempt
  for attempt in {1..30}; do
    if local_health && assert_loopback_bindings; then
      return 0
    fi
    sleep 1
  done
  return 1
}

wait_for_local_tls() {
  local api_health_path=/api/health attempt
  contact_delivery_enabled && api_health_path=/api/ready
  for attempt in {1..30}; do
    if curl --noproxy '*' --fail --silent --show-error --max-time 8 \
      --resolve serhatsoruklu.com:443:127.0.0.1 \
      https://serhatsoruklu.com/healthz >/dev/null \
      && curl --noproxy '*' --fail --silent --show-error --max-time 8 \
        --resolve api.serhatsoruklu.com:443:127.0.0.1 \
        "https://api.serhatsoruklu.com${api_health_path}" >/dev/null; then
      return 0
    fi
    sleep 1
  done
  return 1
}

install_unit_file() {
  local source=$1 target=$2 candidate
  candidate="${target}.candidate.$$"
  install -o root -g root -m 0644 -- "$source" "$candidate"
  mv -fT -- "$candidate" "$target"
}

activate_release() {
  [[ $# -eq 1 ]] || die 'activate-release requires exactly one release path'
  local release previous='' temporary_link="${CURRENT}.candidate.$$"
  release=$(validate_release "$1")
  previous=$(current_release || true)
  validate_runtime_environment

  assert_port_free_when_inactive serhatsoruklu-frontend.service 4102
  assert_port_free_when_inactive serhatsoruklu-backend.service 4302

  install_unit_file "$release/ops/systemd/serhatsoruklu-frontend.service" "$FRONTEND_UNIT"
  install_unit_file "$release/ops/systemd/serhatsoruklu-backend.service" "$BACKEND_UNIT"
  ln -s -- "$release" "$temporary_link"
  mv -fT -- "$temporary_link" "$CURRENT"

  if ! systemd-analyze verify "$FRONTEND_UNIT" "$BACKEND_UNIT" \
    || ! systemctl daemon-reload \
    || ! systemctl enable --now serhatsoruklu-frontend.service serhatsoruklu-backend.service \
    || ! systemctl restart serhatsoruklu-frontend.service serhatsoruklu-backend.service \
    || ! wait_for_local_health; then
    if [[ -n "$previous" && -d "$previous" ]]; then
      install_unit_file "$previous/ops/systemd/serhatsoruklu-frontend.service" "$FRONTEND_UNIT"
      install_unit_file "$previous/ops/systemd/serhatsoruklu-backend.service" "$BACKEND_UNIT"
      ln -s -- "$previous" "$temporary_link"
      mv -fT -- "$temporary_link" "$CURRENT"
      systemctl daemon-reload || true
      systemctl restart serhatsoruklu-frontend.service serhatsoruklu-backend.service || true
      local_health || true
    else
      systemctl disable --now serhatsoruklu-frontend.service serhatsoruklu-backend.service || true
      if [[ -L "$CURRENT" && "$(realpath -e -- "$CURRENT")" == "$release" ]]; then
        unlink -- "$CURRENT"
      fi
    fi
    die 'release activation failed; the prior current release was restored when available'
  fi

  printf 'active_release=%s\n' "$release"
  printf 'artifact_sha256=%s\n' "$(<"$release/.artifact.sha256")"
}

new_nginx_transaction() {
  local stamp transaction
  stamp=$(date -u +%Y%m%dT%H%M%SZ)
  transaction="$BACKUP_ROOT/$stamp"
  [[ ! -e "$transaction" ]] || die 'nginx transaction directory already exists'
  install -d -o root -g serhatsoruklu -m 0750 -- "$BACKUP_ROOT" "$transaction"
  if [[ -f "$SITE_AVAILABLE" ]]; then
    install -o root -g root -m 0644 -- "$SITE_AVAILABLE" "$transaction/site.conf"
  else
    : > "$transaction/site.absent"
  fi
  if [[ -f "$ORIGIN_SNIPPET" ]]; then
    install -o root -g root -m 0644 -- "$ORIGIN_SNIPPET" "$transaction/snippet.conf"
  else
    : > "$transaction/snippet.absent"
  fi
  printf '%s\n' "$transaction"
}

restore_nginx() {
  local transaction=$1
  [[ "$transaction" =~ ^/var/backups/serhatsoruklu/nginx/[0-9]{8}T[0-9]{6}Z$ && -d "$transaction" ]] \
    || die 'invalid nginx transaction path'
  if [[ -f "$transaction/site.conf" ]]; then
    install -o root -g root -m 0644 -- "$transaction/site.conf" "$SITE_AVAILABLE"
    ln -sfn -- "$SITE_AVAILABLE" "$SITE_ENABLED"
  elif [[ -f "$transaction/site.absent" ]]; then
    [[ ! -L "$SITE_ENABLED" || "$(readlink -- "$SITE_ENABLED")" == "$SITE_AVAILABLE" ]] \
      || die 'refusing to remove an unexpected enabled-site link'
    rm -f -- "$SITE_ENABLED" "$SITE_AVAILABLE"
  else
    die 'nginx transaction has no site state'
  fi

  if [[ -f "$transaction/snippet.conf" ]]; then
    install -o root -g root -m 0644 -- "$transaction/snippet.conf" "$ORIGIN_SNIPPET"
  elif [[ -f "$transaction/snippet.absent" ]]; then
    rm -f -- "$ORIGIN_SNIPPET"
  else
    die 'nginx transaction has no snippet state'
  fi
}

validate_nginx_source() {
  local source=$1
  [[ -f "$source" ]] || die 'nginx source file is absent'
  ! grep -Eq 'default_server|/srv/chatpdm|/var/www/coupyn|/var/www/coupyn-staging' "$source" \
    || die 'nginx candidate contains a forbidden directive or path'
  grep -q '127.0.0.1:4102' "$source" || [[ "$source" == *-acme.conf.template ]] \
    || die 'frontend upstream is absent'
  grep -q '127.0.0.1:4302' "$source" || [[ "$source" == *-acme.conf.template ]] \
    || die 'backend upstream is absent'
}

install_nginx() {
  local mode=$1 cert_name=${2:-} release source transaction site_candidate snippet_candidate
  release=$(validate_release "$(current_release)")
  local_health

  case "$mode" in
    acme)
      source="$release/ops/nginx/serhatsoruklu-acme.conf.template"
      ;;
    tls)
      [[ "$cert_name" =~ ^[a-z0-9.-]+$ ]] || die 'invalid certificate name'
      [[ -r "/etc/letsencrypt/live/$cert_name/fullchain.pem" && -r "/etc/letsencrypt/live/$cert_name/privkey.pem" ]] \
        || die 'certificate files are unavailable'
      source="$release/ops/nginx/serhatsoruklu.conf.template"
      ;;
    *) die 'invalid nginx installation mode' ;;
  esac
  validate_nginx_source "$source"
  transaction=$(new_nginx_transaction)
  site_candidate="${SITE_AVAILABLE}.candidate.$$"
  snippet_candidate="${ORIGIN_SNIPPET}.candidate.$$"

  if [[ "$mode" == tls ]]; then
    sed \
      -e "s/__CERTIFICATE_NAME__/$cert_name/g" \
      -e "s#/srv/serhatsoruklu/shared/acme#$ACME_ROOT#g" \
      -e 's/listen 443 ssl http2;/listen 443 ssl;/g' \
      -e 's/listen \[::\]:443 ssl http2;/listen [::]:443 ssl;/g' \
      "$source" > "$site_candidate"
    ! grep -q '__CERTIFICATE_NAME__' "$site_candidate" || die 'unresolved certificate placeholder'
  else
    sed "s#/srv/serhatsoruklu/shared/acme#$ACME_ROOT#g" "$source" > "$site_candidate"
  fi
  install -o root -g root -m 0644 -- "$release/ops/nginx/serhatsoruklu-cloudflare-origin-only.conf" "$snippet_candidate"
  chown root:root "$site_candidate" "$snippet_candidate"
  chmod 0644 "$site_candidate" "$snippet_candidate"
  mv -fT -- "$snippet_candidate" "$ORIGIN_SNIPPET"
  mv -fT -- "$site_candidate" "$SITE_AVAILABLE"

  if [[ -L "$SITE_ENABLED" && "$(readlink -- "$SITE_ENABLED")" != "$SITE_AVAILABLE" ]]; then
    restore_nginx "$transaction"
    die 'enabled-site link points somewhere unexpected'
  fi
  ln -sfn -- "$SITE_AVAILABLE" "$SITE_ENABLED"

  if ! /usr/sbin/nginx -t || ! local_health || ! systemctl reload nginx || ! systemctl is-active --quiet nginx; then
    restore_nginx "$transaction"
    /usr/sbin/nginx -t || die 'restored nginx configuration is invalid'
    systemctl reload nginx || die 'failed to gracefully reload restored nginx configuration'
    die 'nginx activation failed and the previous Serhat configuration was restored'
  fi

  if [[ "$mode" == tls ]]; then
    wait_for_local_tls \
      || { restore_nginx "$transaction"; /usr/sbin/nginx -t; systemctl reload nginx; die 'local TLS checks failed'; }
  fi
  printf 'nginx_transaction=%s\n' "$transaction"
}

obtain_certificate() {
  [[ $# -eq 0 ]] || die 'obtain-certificate accepts no arguments'
  [[ -f "$SITE_AVAILABLE" && -L "$SITE_ENABLED" ]] || die 'ACME nginx configuration is not active'
  install -d -o root -g www-data -m 0750 -- "$ACME_ROOT" "$ACME_ROOT/.well-known" "$ACME_ROOT/.well-known/acme-challenge"
  certbot certonly --webroot --webroot-path "$ACME_ROOT" \
    --cert-name serhatsoruklu.com \
    --domain serhatsoruklu.com \
    --domain www.serhatsoruklu.com \
    --domain api.serhatsoruklu.com \
    --non-interactive --agree-tos --keep-until-expiring --no-eff-email
  local san
  san=$(openssl x509 -in /etc/letsencrypt/live/serhatsoruklu.com/fullchain.pem -noout -ext subjectAltName)
  for name in serhatsoruklu.com www.serhatsoruklu.com api.serhatsoruklu.com; do
    grep -Fq "DNS:$name" <<<"$san" || die "certificate does not cover $name"
  done
  printf 'certificate_name=serhatsoruklu.com\n'
}

install_backup() {
  [[ $# -eq 0 ]] || die 'install-backup accepts no arguments'
  local release
  release=$(validate_release "$(current_release)")
  validate_backup_environment
  install_unit_file "$release/ops/backup/serhatsoruklu-mongodb-backup.service" "$BACKUP_UNIT"
  install_unit_file "$release/ops/backup/serhatsoruklu-mongodb-backup.timer" "$BACKUP_TIMER"
  install -o root -g root -m 0750 -- "$release/ops/backup/mongodb-backup.sh" "$BACKUP_SCRIPT"
  systemd-analyze verify "$BACKUP_UNIT" "$BACKUP_TIMER"
  systemctl daemon-reload
  systemctl enable --now serhatsoruklu-mongodb-backup.timer
  printf 'backup_timer=enabled\n'
}

rollback() {
  [[ $# -eq 2 ]] || die 'rollback requires a release and nginx transaction path or -'
  local release transaction=$2 temporary_link="${CURRENT}.rollback.$$"
  release=$(validate_release "$1")
  ln -s -- "$release" "$temporary_link"
  mv -fT -- "$temporary_link" "$CURRENT"
  systemctl restart serhatsoruklu-frontend.service serhatsoruklu-backend.service
  local_health
  assert_loopback_bindings
  if [[ "$transaction" != - ]]; then
    restore_nginx "$transaction"
    /usr/sbin/nginx -t
    systemctl reload nginx
    systemctl is-active --quiet nginx
  fi
  printf 'rolled_back_release=%s\n' "$release"
}

[[ $# -ge 1 ]] || die 'a command is required'
command=$1
shift

case "$command" in
  activate-release) activate_release "$@" ;;
  validate-environment) [[ $# -eq 1 ]] || die 'validate-environment requires runtime or backup'; case "$1" in runtime) validate_runtime_environment ;; backup) validate_backup_environment ;; *) die 'invalid environment scope' ;; esac ;;
  install-nginx-acme) [[ $# -eq 0 ]] || die 'install-nginx-acme accepts no arguments'; install_nginx acme ;;
  obtain-certificate) obtain_certificate "$@" ;;
  install-nginx-tls) [[ $# -eq 1 ]] || die 'install-nginx-tls requires one certificate name'; install_nginx tls "$1" ;;
  install-backup) install_backup "$@" ;;
  rollback) rollback "$@" ;;
  *) die 'unsupported command' ;;
esac
