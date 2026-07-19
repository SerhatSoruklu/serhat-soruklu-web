# MongoDB restore procedure

Use a temporary database first; never restore over the live database as the
first validation step.

1. Disable application writes by stopping only the two `serhatsoruklu-*`
   services during an approved maintenance window.
2. Download one archive and its checksum from the dedicated
   `BACKUP_S3_URI` prefix into `/var/backups/serhatsoruklu/restore`.
3. Verify the checksum with `sha256sum --check` and the stream with `gzip -t`.
4. Create a root-only MongoDB tools YAML file under
   `/run/serhatsoruklu-backup` containing the dedicated restore URI as `uri:`.
5. Restore into a new temporary database name with `mongorestore --config`,
   `--archive`, `--gzip`, and `--nsFrom=serhatsoruklu.*` plus an explicit
   `--nsTo=serhatsoruklu_restore_test.*` mapping.
6. Validate collection counts and representative indexes without printing
   document contents, then drop only `serhatsoruklu_restore_test`.
7. Remove the temporary YAML file and restart only the two Serhat services.

A live restore requires a separately approved change window, a new pre-restore
backup, an explicit target database, and post-restore local/public health checks.
