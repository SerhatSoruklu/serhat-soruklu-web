# Backend operations

Install from the repository root with the lockfile-respecting release workflow,
then start this service with:

```bash
npm --prefix backend run start:production
```

That command sets production mode before dotenv selects `.env.production`.
The ignored local `.env.production` is the canonical final runtime form; do
not commit it or any other runtime environment file. Production uses
`/etc/serhatsoruklu/backend.env`, with secrets injected only on the host.

## Health and readiness

- `GET /api/health` is a lightweight liveness probe. It remains available when
  contact delivery is unready.
- `GET /api/ready` reports whether contact SMTP configuration is valid and, in
  production by default, whether the transport passed its one bounded startup
  verification. Verification is cached and is not repeated on probe requests.

The process remains alive but unready when SMTP verification fails. Logs and
probe responses contain reason codes only, never provider errors, recipients,
credentials, or secret values. A configuration or network correction requires
a process restart so startup verification can run again.

No readiness check sends a message. Live delivery must be validated separately
and only with explicit approval.

## Contact delivery contract

Clients should send one stable `Idempotency-Key` header per form submission and
may send the same value as `submissionId` in the JSON body. The key must remain
stable for retries of unchanged content. A legacy client without a key receives
a deterministic identifier derived from the normalized payload.

The API returns:

- `200 CONTACT_DELIVERED` when both the internal message and confirmation were
  delivered.
- `202 PARTIAL_DELIVERY` when the internal message was delivered but the
  confirmation failed. Clients must treat the submission as received rather
  than prompting the user to resubmit.
- `202 CONTACT_DELIVERY_UNKNOWN` when the provider may have accepted the
  internal message without returning its final acknowledgement. This state is
  terminal for the idempotency TTL; clients must not resubmit automatically.
- `502 CONTACT_DELIVERY_FAILED` when the internal message was not delivered.
- `503 CONTACT_DELIVERY_NOT_CONFIGURED` when SMTP delivery is unavailable at the
  configuration level.
- `409 IDEMPOTENCY_CONFLICT` when a key is reused with different content.

A partial-delivery retry skips the already delivered internal message and
retries only the confirmation. All endpoint attempts count toward the per-IP
rate limit, including validation, delivery failure, and partial delivery.

Duplicate state and rate limits are bounded in-memory stores. This is suitable
for the current single-process runtime. Multiple workers or multiple backend
instances require a shared TTL store (for example Redis) to enforce these
controls across processes. Restarting the process clears in-memory state.

Each sequential SMTP send uses Nodemailer's connection, greeting, and
socket-inactivity limits. They default to five seconds and are capped at six
seconds. Delivery deliberately has no uncancellable outer `Promise.race`:
the idempotency record stays in flight until the SMTP transport settles, so a
client retry cannot begin a duplicate internal send. The frontend allows a
45-second end-to-end window for the two small sequential messages and network
margin.

If the SMTP provider may have accepted DATA but its final acknowledgement is
missing, the API returns `202 CONTACT_DELIVERY_UNKNOWN`. That state is terminal
for the submission's TTL and is replayed without another send. Failures known
to occur before DATA (for example authentication, DNS, connection refusal, or
envelope rejection) remain explicit `502 CONTACT_DELIVERY_FAILED` results and
may be retried with the same idempotency key.

## Reverse proxy and shutdown

`TRUST_PROXY` accepts a bounded numeric hop count; `true` maps to one hop. Keep
it aligned with the actual nginx or platform proxy topology. Production CORS
defaults explicitly allow the apex and `www` HTTPS origins. `CORS_ORIGINS` is
the canonical comma-separated override; the older `CORS_ORIGIN` name remains
accepted for compatibility.

`SIGTERM` and `SIGINT` stop new HTTP work, close idle connections, disconnect
MongoDB when connected, and use a bounded forced-close deadline. The edge proxy
remains responsible for public TLS and canonical HTTP-to-HTTPS redirects.
