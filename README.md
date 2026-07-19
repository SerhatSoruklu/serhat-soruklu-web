<!-- markdownlint-disable MD013 -->

# Serhat Soruklu Web

Personal platform, writing hub, and systems architecture portfolio of Serhat Soruklu.

## Structure

```text
serhatsoruklu/
  frontend/   Angular SSR, TypeScript
  backend/    Node.js, Express, JavaScript
```

## Local Development

From the project root:

```bash
cd ~/code/serhatsoruklu
npm ci --ignore-scripts
npm run install:projects
npm run dev
```

`npm run dev` starts both services in one terminal:

- `[frontend]` Angular SSR dev server with live reload
- `[backend]` Express server through nodemon

Default local URLs:

- Frontend: `http://localhost:4200`
- Backend health check: `http://localhost:3000/api/health`

## Build

```bash
npm run build:production
```

This creates the optimized Angular SSR artifact in `frontend/dist/frontend`.
`npm run check` performs a no-emit Angular compiler check and cannot replace
that production artifact with a development build.

## Frontend Playwright E2E

Playwright is installed as a frontend-local dev dependency for responsive, visual, route, console, and regression checks.

Install browser binaries once after dependencies are installed:

```bash
npm --prefix frontend run e2e:install
```

Run the Chromium e2e suite against the Angular dev server on the reserved test port `4201`:

```bash
npm --prefix frontend run e2e
```

Useful local variants:

```bash
npm --prefix frontend run e2e:headed
npm --prefix frontend run e2e:ui
npm --prefix frontend run e2e:report
```

The Playwright config lives in `frontend/playwright.config.ts`, and tests live in `frontend/tests/e2e/`. Playwright starts `npm run dev:ssr -- --host 127.0.0.1 --port 4201`, so it does not collide with the normal `localhost:4200` development server.

Generated reports, traces, screenshots, videos, and browser-cache artifacts are ignored by Git. The main artifact locations are:

- `frontend/test-results/`
- `frontend/playwright-report/`
- `frontend/blob-report/`
- `frontend/.playwright/`

## Development Conventions

Global frontend theme, layout, and responsive rules are documented in `AGENTS.md`. Primary content gutters should default to `20px` left and right spacing. Theme utilities live in `frontend/src/styles/theme.css`, and reusable layout utilities live in `frontend/src/styles/responsive-layout.css`.

## Typography

SerhatSoruklu.com uses a two-font system:

- `Sora` for the logo name, page headings, and primary interface text. It gives the site a modern, authoritative systems-builder tone without the editorial/bookish feel of a serif.
- `Space Mono` for technical labels such as `SYSTEMS ARCHITECT`, nav text, eyebrows, and compact metadata. This keeps the precise robot-like technical signal.

The font files are self-hosted in `frontend/public/assets/fonts/` and declared in `frontend/src/styles/fonts.css`. Do not reintroduce remote display-font imports for the core brand typography.

## Brand Voice And Writing Direction

This guidance applies only to `serhatsoruklu.com`. It is not Coupyn, ChatPDM, or corporate SaaS marketing.

Copy, headlines, labels, and microcopy should feel emotionally powerful, intelligent, modern, respected, cinematic, ambitious, founder-level, technically elite, architect-level, calm, confident, future-facing, culturally relevant, and memorable. The emotional target is simple: this person builds serious things.

The site should read like the work of a real systems builder, a respected internet architect, and a modern founder/operator building meaningful infrastructure. It should not feel like a generic developer portfolio.

Prefer language around building systems, shaping infrastructure, engineering scale, architecting platforms, empowering discovery, designing trust, long-term systems, precision, resilience, execution, signal, momentum, intelligence, modern internet infrastructure, digital architecture, scalable foundations, engineered experiences, systems thinking, high-performance work, crafted details, refined execution, and systems built for longevity.

Encourage strong headlines, emotionally resonant statements, subtle cinematic energy, premium technical authority, concise impactful copy, modern founder language, and tasteful ambition. The wording should sound cool without trying too hard.

Public-facing copy must still feel human. Most non-technical readers will not consciously analyze terms like "systems architecture" or "digital foundations"; they respond to vibe, confidence, clarity, aesthetic consistency, emotional tone, and whether the work feels real or fake. The copy should create calm intelligence, seriousness, ambition, competence, and a little mystery without becoming cold.

Use this balance for public website copy:

- 70% clean intelligent authority
- 20% human presence
- 10% cinematic ambition

Do not let every sentence sound like abstract infrastructure language. If the copy becomes too dense, it will read as corporate, robotic, emotionally distant, or like AI-generated tech-bro marketing. Strong technical language should be contrasted with short, grounded lines that breathe.

Prefer short sentences, strong rhythm, minimal copy, emotionally grounded statements, real proof, and restrained confidence. Good public copy should work for technical and non-technical audiences at the same time.

Examples:

- Avoid: "Architecting scalable digital infrastructure for resilient future-facing ecosystems."
- Prefer: "Building systems designed to last."
- Avoid: "Engineering high-performance trust architectures."
- Prefer: "I like building things that survive pressure."
- Prefer: "Built from scratch. Designed to scale. Still evolving."

Avoid generic SaaS buzzwords, fake AI-company language, excessive corporate jargon, cringe productivity language, startup spam, cheesy motivational quotes, childish hype, nerdy filler text, overexplaining, and generic portfolio copy. Do not use phrases like "disrupting the industry", "synergy", or similar hollow marketing language.

The writing should match the visual identity: dark theme first, black and gold premium aesthetic, restrained luxury, modern systems architecture, calm authority, and minimal architecture. Text should feel at home in a premium architecture studio, a next-generation systems lab, a founder documentary intro, or a modern engineering publication.

## Git And Deployment

Do not push to GitHub, push to `main`, deploy, merge pull requests, or run deploy-related scripts after every local change. Commit, push, PR, merge, or deployment actions should happen only when explicitly requested.

Recognized explicit publish commands include:

- `push to GitHub`
- `push and deploy`
- `yeet deploy`
- `full live merge yeet`

In this repo, `deploy` in those phrases means publish the requested code changes to GitHub only. It does not mean production hosting, server deployment, Docker, PM2, Vercel, or infrastructure changes unless that target is explicitly named.

The normal publish flow is: inspect the diff, stage intended files only, run `npm run lint`, `npm run build`, and `npm run check` when those scripts exist, commit, push to GitHub, then open/review/merge a PR when the requested flow calls for it and checks are clean. Commit messages and PR titles/descriptions must be unique and specific to the actual change. PR descriptions should explain what changed, why it changed, how it was validated, and any remaining risk. Do not push known-broken code unless explicitly overridden.

## Branch Protection and Merge Rules

The default branch is protected by the active GitHub ruleset `main-production-protection`. The ruleset targets the default branch only.

All changes must go through pull requests before they reach `main`. Required approvals are currently set to `0` because this is a solo-founder repository, but pull request conversation resolution is required before merging. Squash and rebase merges are allowed. Merge commits are disabled.

The ruleset blocks force pushes and branch deletions on `main`. It also requires selected status checks to pass before merge, including CodeQL code scanning results and SonarCloud code quality results for errors. CodeQL and SonarCloud findings must be fixed cleanly, not bypassed or disabled. Failing required checks are expected to block merging until the branch is repaired and checks complete successfully.

Branches do not need to be up to date with `main` before merging, and status checks on branch creation are not required. Deployment should happen only from a clean `main` after the pull request has merged and required checks are green.

Codex workflow for this repository:

1. Create or use a feature branch.
2. Make the requested changes.
3. Run local checks.
4. Push the branch.
5. Open or update the pull request.
6. Inspect all GitHub checks.
7. Fix failing checks.
8. Resolve all pull request conversations.
9. Merge only when the ruleset allows it.
10. Deploy from `main`.
11. Report the final deployed commit and CI status.

## CI

The release-candidate workflow uses locked installs and gates lint, no-emit type
and syntax checks, frontend and backend unit tests, production dependency
audits, Playwright, the final production build, compiled-output assertions, and
a production SSR smoke test. The final build is the last gate that writes to
`frontend/dist/frontend`, and the workflow uploads an artifact named for the
Git commit SHA.

Local equivalents:

```bash
npm ci --ignore-scripts
npm run install:projects
npm --prefix frontend run e2e:install
npm run validate:release
```

CodeQL runs without extra secrets. SonarQube runs as an optional check when the required GitHub Actions secrets are configured:

- `SONAR_TOKEN`
- `SONAR_HOST_URL`
- `SONAR_ORGANIZATION`
- `SONAR_PROJECT_KEY`

## Production Release Workflow

The supported runtime is Node.js `>=22.20.0 <23` with npm
`>=10.9.0 <11`. The repository records npm `10.9.3` as the package manager used
for the validated lockfiles.

Prepare a release candidate from the exact commit that will be deployed:

```bash
npm ci --ignore-scripts
npm run install:projects
npm --prefix frontend run e2e:install
npm run validate:release
```

Alternatively, `npm run deploy` runs that repository-side preparation sequence.
Despite its historical name, the script does not upload files, restart services,
or modify a production host. It stops after producing and validating the local
release candidate.

The deployable frontend artifact is `frontend/dist/frontend`. It must contain
hashed browser bundles, optimized production code, the production API endpoint,
the SSR server entry, no source maps, and no development endpoint. CI verifies
those invariants before uploading the exact frontend artifact together with the
backend runtime source and both application lockfiles. Deploy the artifact from
the intended Git SHA; do not rebuild a different checkout on the server.

Install runtime dependencies from the included lockfiles on the target host:

```bash
npm --prefix frontend ci --omit=dev --ignore-scripts
npm --prefix backend ci --omit=dev --ignore-scripts
```

Start the frontend and backend as separate supervised services:

```bash
npm run start:frontend
npm run start:backend
```

Both commands select production mode internally and work from Linux shells,
Windows PowerShell, and `cmd.exe`; operators do not need to prepend
`NODE_ENV=production`. The frontend defaults to `127.0.0.1:4000`. The backend
defaults to port `3000`. A reverse proxy should route the website to the frontend
SSR service and `/api` traffic on `api.serhatsoruklu.com` to the backend.

Frontend SSR recognizes these runtime variables:

| Variable | Production default | Purpose |
| --- | --- | --- |
| `PORT` | `4000` | Frontend SSR listen port |
| `FRONTEND_HOST` | `127.0.0.1` | Listen address; keep loopback behind a same-host proxy |
| `FRONTEND_CANONICAL_HOST` | `serhatsoruklu.com` | Fixed destination for application HTTPS redirects |
| `FRONTEND_TRUST_PROXY` | `loopback` | Explicit trusted proxy IPs/subnets or Express safe names, comma-separated |
| `FRONTEND_ENFORCE_HTTPS` | `true` | Redirect non-secure production requests with HTTP 308 |
| `FRONTEND_ENABLE_HSTS` | `true` | Emit one-year HSTS in production |
| `FRONTEND_SHUTDOWN_TIMEOUT_MS` | `10000` | Bounded graceful-shutdown deadline |

`FRONTEND_TRUST_PROXY` deliberately rejects unrestricted values such as `true`,
`*`, `0.0.0.0/0`, and `::/0`. The default assumes nginx or another reverse proxy
connects from the same host. For a container or remote proxy, set only its exact
address or subnet. The application never uses a forwarded host to construct a
redirect.

The application provides defence-in-depth HTTPS handling: it trusts forwarded
protocol only from the configured proxy, redirects a non-secure request to the
fixed apex host, and skips the redirect for the loopback health probe at
`/healthz`. The reverse proxy must overwrite, rather than append or pass through,
client-supplied `X-Forwarded-Proto`; it must send `https` after TLS was terminated.
This prevents application redirect loops. The public nginx/Cloudflare layer must
also enforce HTTP-to-HTTPS before traffic reaches the origin and must keep the
frontend and backend listen ports inaccessible from the public Internet. Enable
HSTS only with working HTTPS on the apex and intended subdomains.

Health endpoints:

- Frontend liveness: `http://127.0.0.1:4000/healthz`
- Backend liveness: `http://127.0.0.1:3000/api/health`
- Backend readiness: `http://127.0.0.1:3000/api/ready`

The frontend and backend handle `SIGTERM` and `SIGINT`, stop accepting new
connections, and use a bounded forced-exit deadline. A service supervisor should
wait for graceful exit before replacing an artifact.

Keep at least one previously verified artifact and its matching environment
configuration. Rollback means stopping the current services gracefully,
restoring that exact artifact and lockfile set, installing only from those
lockfiles, starting both services, and checking liveness/readiness. Do not rebuild
the previous release during an incident.

## Environment Files

Real environment files are ignored by Git:

- `.env`
- `.env.production`
- `backend/.env`
- `backend/.env.production`

The ignored `backend/.env.production` is the canonical final backend runtime
form. Keep sensitive values blank in local working copies and inject them only
through the production host's root-controlled environment file. Do not commit
real tokens, licenses, credentials, or production environment files.

## Contact Email Delivery

The `/api/contact` endpoint requires an authenticated SMTP identity dedicated
to SerhatSoruklu.com. The notification and reply recipients must be real,
monitored mailboxes. They may use another domain when dedicated to this site,
but must not reuse a Coupyn or ChatPDM sender, password, or SMTP identity.

Required backend environment variables:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_REQUIRE_TLS=true
SMTP_NAME=serhatsoruklu.com
SMTP_USER=<dedicated-serhatsoruklu-sender>
SMTP_PASS=<secret>
SERHAT_SITE_URL=https://serhatsoruklu.com
CONTACT_INTERNAL_TO=<real-monitored-recipient>
CONTACT_REPLY_TO=<real-monitored-reply-address>
CONTACT_MAIL_TIMEOUT_MS=5000
CONTACT_RATE_LIMIT_MAX=5
CONTACT_RATE_LIMIT_WINDOW_MS=3600000
CONTACT_IDEMPOTENCY_TTL_MS=900000
CONTACT_IDEMPOTENCY_MAX_ENTRIES=1000
```

Expected flow:

- Internal notification: from the dedicated SerhatSoruklu.com SMTP identity to
  the configured monitored recipient, with `Reply-To` set to the submitter email.
- User confirmation: from the same dedicated SerhatSoruklu.com SMTP identity
  to the submitter, with `Reply-To` set to the configured monitored reply address.
- `SERHAT_SITE_URL` controls email CTA links. It defaults to `https://serhatsoruklu.com` and can be set to `http://localhost:4200` for local email tests.
- `CONTACT_MAIL_TIMEOUT_MS` defaults to 5000 ms and is capped at 6000 ms. It
  configures Nodemailer's connection, greeting, and socket-inactivity limits
  for both sequential sends. Delivery is not wrapped in an uncancellable outer
  timer, so an in-flight idempotent request remains authoritative until the
  SMTP transport settles.
- The browser uses a 45-second request window. This exceeds the planning budget
  for two sequential messages across the capped connection, greeting, and
  socket-inactivity phases, with additional network margin. An unchanged retry
  reuses the same idempotency key.
- A provider error after SMTP DATA may have an unknowable delivery outcome. The
  API returns terminal `202 CONTACT_DELIVERY_UNKNOWN`, retains the idempotency
  record, and tells the browser not to resubmit rather than risking a duplicate
  internal notification.
- Every `/api/contact` attempt counts toward the default limit of 5 requests per
  IP per hour. The maximum and window are configurable through
  `CONTACT_RATE_LIMIT_MAX` and `CONTACT_RATE_LIMIT_WINDOW_MS`.
- Clients send a stable `Idempotency-Key` for retries. The backend keeps a
  bounded in-memory TTL record so the same submission cannot create duplicate
  internal notifications in one process. This cache is not shared across
  processes; `backend/README.md` documents the deployment limit and response
  contract.
- `/api/health` is process liveness. `/api/ready` verifies that required contact
  configuration and the SMTP transporter are ready.
- Do not spoof a SerhatSoruklu.com `From` address unless that exact address has
  authenticated sending configured.
