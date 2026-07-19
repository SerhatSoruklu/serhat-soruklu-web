#!/usr/bin/env bash
set -euo pipefail

[[ $# -eq 1 ]] || { printf 'usage: install-nginx.sh <acme|tls>\n' >&2; exit 1; }

case "$1" in
  acme)
    exec sudo -n /usr/local/sbin/serhatsoruklu-deploy-helper install-nginx-acme
    ;;
  tls)
    exec sudo -n /usr/local/sbin/serhatsoruklu-deploy-helper install-nginx-tls serhatsoruklu.com
    ;;
  *)
    printf 'usage: install-nginx.sh <acme|tls>\n' >&2
    exit 1
    ;;
esac
