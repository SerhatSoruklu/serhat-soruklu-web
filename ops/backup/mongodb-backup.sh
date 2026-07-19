#!/usr/bin/env bash
set -euo pipefail

umask 0077

readonly DATABASE=serhatsoruklu
readonly BACKUP_DIR=/var/backups/serhatsoruklu/mongodb
readonly RUNTIME_DIR=/run/serhatsoruklu-backup

die() {
  printf 'serhatsoruklu-backup: %s\n' "$*" >&2
  exit 1
}

required=(MONGODB_BACKUP_URI BACKUP_S3_URI BACKUP_RETENTION_DAYS AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_DEFAULT_REGION)
for name in "${required[@]}"; do
  [[ -n "${!name:-}" ]] || die "required variable is absent: $name"
done

[[ "$MONGODB_BACKUP_URI" == mongodb://serhatsoruklu_backup:*@127.0.0.1:27017/serhatsoruklu\?* ]] \
  || die 'MongoDB backup URI is not scoped to the dedicated local identity/database'
[[ "$MONGODB_BACKUP_URI" == *'authSource=serhatsoruklu'* ]] || die 'MongoDB authSource is not isolated'
[[ "$BACKUP_S3_URI" =~ ^s3://[a-zA-Z0-9._-]+/.+serhatsoruklu/?$ ]] \
  || die 'BACKUP_S3_URI must be a dedicated SerhatSoruklu prefix'
[[ "$BACKUP_RETENTION_DAYS" =~ ^[0-9]+$ ]] \
  && (( BACKUP_RETENTION_DAYS >= 7 && BACKUP_RETENTION_DAYS <= 365 )) \
  || die 'BACKUP_RETENTION_DAYS must be from 7 to 365'

install -d -o root -g serhatsoruklu -m 0750 -- "$BACKUP_DIR"
install -d -o root -g root -m 0700 -- "$RUNTIME_DIR"

timestamp=$(date -u +%Y%m%dT%H%M%SZ)
artifact="$BACKUP_DIR/${DATABASE}-${timestamp}.archive.gz"
checksum="${artifact}.sha256"
config=$(mktemp "$RUNTIME_DIR/mongodump.XXXXXX.yml")
trap 'rm -f -- "$config"' EXIT
printf 'uri: "%s"\n' "$MONGODB_BACKUP_URI" > "$config"
chmod 0600 "$config"

nice -n 15 ionice -c 2 -n 7 \
  /usr/bin/mongodump --config="$config" --db="$DATABASE" --archive="$artifact" --gzip --numParallelCollections=1

[[ -s "$artifact" ]] || die 'mongodump produced an empty artifact'
gzip -t -- "$artifact"
sha256sum "$artifact" > "$checksum"
chmod 0640 "$artifact" "$checksum"
chown root:serhatsoruklu "$artifact" "$checksum"

object_name=$(basename "$artifact")
/usr/local/bin/aws s3 cp "$artifact" "${BACKUP_S3_URI%/}/$object_name" --only-show-errors
/usr/local/bin/aws s3 cp "$checksum" "${BACKUP_S3_URI%/}/${object_name}.sha256" --only-show-errors

find "$BACKUP_DIR" -maxdepth 1 -type f \
  \( -name 'serhatsoruklu-*.archive.gz' -o -name 'serhatsoruklu-*.archive.gz.sha256' \) \
  -mtime "+$BACKUP_RETENTION_DAYS" -delete

printf 'serhatsoruklu-backup: completed artifact=%s\n' "$object_name"
