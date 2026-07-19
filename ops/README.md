# Isolated production operations

These files deploy only SerhatSoruklu.com under `/srv/serhatsoruklu`. They do
not own any host-wide configuration or any other application path.

## Release flow

After `CI` succeeds for a push to `main`, the GitHub-hosted production workflow
connects with a dedicated forced-command SSH key and promotes that exact verified
SHA. No self-hosted runner is installed on the production server. The forced
command accepts only `deploy <40-character-git-sha>`, verifies that the SHA is
the current `origin/main`, serializes deployments, builds a clean immutable
release, activates only the two Serhat systemd services, and refreshes only the
Serhat nginx configuration.

The root-owned deploy helper remains a separately reviewed security boundary;
GitHub Actions cannot replace it. Its narrow sudo policy and the dedicated
`serhatsoruklu-deploy` account must not be shared with another application.

For initial provisioning or manual recovery:

1. Run `ops/deploy/deploy.sh <full-main-sha>` as
   `serhatsoruklu-deploy`. It creates a clean detached worktree, performs
   locked installs and the production gates, and emits the release path and
   artifact checksum. It does not switch `current`.
2. Install the reviewed `ops/deploy/root-helper.sh` once as root at
   `/usr/local/sbin/serhatsoruklu-deploy-helper`, owned by root and mode `0755`.
3. Activate the emitted release with the exact helper command. Activation
   atomically switches `current`, installs only the two Serhat units, checks
   both ports, and rolls back the symlink if service health fails.
4. Run `ops/deploy/install-nginx.sh acme`, obtain the exact three-name SAN
   certificate with the helper, and then run `ops/deploy/install-nginx.sh tls`.

The root helper accepts only enumerated commands and validates every supplied
release or rollback path. Nginx changes are transactionally backed up beneath
`/var/backups/serhatsoruklu/nginx`, tested, health-checked, and activated with a
graceful reload. A failed activation restores only the prior Serhat files.

## Environment files

Root creates `/etc/serhatsoruklu/frontend.env`, `backend.env`, and `backup.env`.
The service files read them directly; no environment file is stored in a
release. Validate presence and ownership without logging values.

Production environment changes deliberately do not travel through GitHub.
Edit `/etc/serhatsoruklu/backend.env` on the host, validate it with the
root-owned helper, and restart `serhatsoruklu-backend.service`. The site uses
systemd, not PM2.

The frontend file provides production mode, port `4102`, host `127.0.0.1`, the
canonical host, HTTPS/HSTS enablement, loopback proxy trust, and a bounded
shutdown timeout. The backend file uses port `4302`, production CORS/site
values, the dedicated MongoDB URI, and dedicated SMTP/contact settings. The
runtime preload is an infrastructure guard that forces the backend's numeric
listener onto IPv4 loopback.

The backup file provides the dedicated read-only MongoDB URI, a dedicated S3
prefix containing `serhatsoruklu`, dedicated object-store credentials/region,
and a local retention period from 7 to 365 days. Remote retention is enforced
by the object-store lifecycle policy for that prefix; local artifacts follow
`BACKUP_RETENTION_DAYS`.

## Rollback

Call `ops/deploy/rollback.sh` with an explicit prior release path and,
optionally, an exact nginx transaction directory. It switches only `current`,
restarts only the two Serhat services, tests local health/bindings, restores
only the recorded Serhat nginx state when requested, validates nginx, and uses
a graceful reload.

MongoDB restore validation is documented in `ops/backup/RESTORE.md`.
