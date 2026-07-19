#!/usr/bin/env bash
set -euo pipefail

[[ $# -eq 1 || $# -eq 2 ]] || {
  printf 'usage: rollback.sh </srv/serhatsoruklu/releases/release> [nginx-transaction-directory]\n' >&2
  exit 1
}

release=$1
nginx_transaction=${2:--}
exec sudo -n /usr/local/sbin/serhatsoruklu-deploy-helper rollback "$release" "$nginx_transaction"
