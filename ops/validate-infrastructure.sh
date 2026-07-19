#!/usr/bin/env bash
set -euo pipefail

readonly OPS_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

scripts=(
  "$OPS_ROOT/deploy/ci-deploy.sh"
  "$OPS_ROOT/deploy/deploy.sh"
  "$OPS_ROOT/deploy/install-nginx.sh"
  "$OPS_ROOT/deploy/publish-backend-environment.sh"
  "$OPS_ROOT/deploy/rollback.sh"
  "$OPS_ROOT/deploy/root-helper.sh"
  "$OPS_ROOT/backup/mongodb-backup.sh"
)

for script in "${scripts[@]}"; do
  bash -n "$script"
done

nginx_files=(
  "$OPS_ROOT/nginx/serhatsoruklu-acme.conf.template"
  "$OPS_ROOT/nginx/serhatsoruklu.conf.template"
)

for config in "${nginx_files[@]}"; do
  ! grep -Eq 'default_server|/srv/chatpdm|/var/www/coupyn|/var/www/coupyn-staging' "$config"
  grep -Fq 'serhatsoruklu-cloudflare-origin-only.conf' "$config"
  grep -Fq 'autoindex off' "$config"
done

grep -Fq '127.0.0.1:4102' "$OPS_ROOT/nginx/serhatsoruklu.conf.template"
grep -Fq '127.0.0.1:4302' "$OPS_ROOT/nginx/serhatsoruklu.conf.template"
! grep -Fq 'listen 4102' "$OPS_ROOT/nginx/serhatsoruklu.conf.template"
! grep -Fq 'listen 4302' "$OPS_ROOT/nginx/serhatsoruklu.conf.template"

ipv4_count=$(grep -Ec '^allow ([0-9]{1,3}\.){3}[0-9]{1,3}/[0-9]+;$' "$OPS_ROOT/nginx/serhatsoruklu-cloudflare-origin-only.conf")
ipv6_count=$(grep -Ec '^allow [0-9a-f:]+/[0-9]+;$' "$OPS_ROOT/nginx/serhatsoruklu-cloudflare-origin-only.conf")
[[ "$ipv4_count" -eq 15 && "$ipv6_count" -eq 7 ]]
[[ "$(tail -n 1 "$OPS_ROOT/nginx/serhatsoruklu-cloudflare-origin-only.conf")" == 'deny all;' ]]

for unit in "$OPS_ROOT/systemd/serhatsoruklu-frontend.service" "$OPS_ROOT/systemd/serhatsoruklu-backend.service"; do
  grep -Fq 'User=serhatsoruklu' "$unit"
  grep -Fq 'Group=serhatsoruklu' "$unit"
  grep -Fq 'ProtectSystem=strict' "$unit"
  grep -Fq 'NoNewPrivileges=true' "$unit"
  grep -Fq 'InaccessiblePaths=/srv/chatpdm /var/www/coupyn /var/www/coupyn-staging /home/deploy /home/chatpdmops' "$unit"
done

grep -Fq '127.0.0.1' "$OPS_ROOT/runtime/force-loopback.cjs"
grep -Fq 'MONGODB_BACKUP_URI' "$OPS_ROOT/backup/mongodb-backup.sh"
grep -Fq 'BACKUP_S3_URI' "$OPS_ROOT/backup/mongodb-backup.sh"
grep -Fq 'validate_runtime_environment' "$OPS_ROOT/deploy/root-helper.sh"
grep -Fq 'validate_backup_environment' "$OPS_ROOT/deploy/root-helper.sh"
grep -Fq 'SSH_ORIGINAL_COMMAND' "$OPS_ROOT/deploy/ci-deploy.sh"
grep -Fq 'origin/main' "$OPS_ROOT/deploy/ci-deploy.sh"
grep -Fq 'serhatsoruklu-deploy-helper' "$OPS_ROOT/deploy/ci-deploy.sh"
grep -Fq 'install-backend-environment' "$OPS_ROOT/deploy/ci-deploy.sh"
grep -Fq 'install_backend_environment' "$OPS_ROOT/deploy/root-helper.sh"
grep -Fq 'SERHATSORUKLU_BACKEND_ENV' "$OPS_ROOT/deploy/publish-backend-environment.sh"
grep -Fq 'coupyn|chatpdm' "$OPS_ROOT/deploy/publish-backend-environment.sh"

printf 'infrastructure validation passed\n'
