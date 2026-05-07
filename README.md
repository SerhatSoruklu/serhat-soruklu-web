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
npm install
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
npm run build
```

This builds the Angular SSR frontend.

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

## CI

GitHub Actions runs lightweight checks for the Angular frontend and Express backend on pushes and pull requests to `main`.

Local equivalents:

```bash
npm --prefix frontend ci
npm --prefix frontend run build
npm --prefix backend ci
node --check backend/server.js
```

CodeQL runs without extra secrets. SonarQube runs as an optional check when the required GitHub Actions secrets are configured:

- `SONAR_TOKEN`
- `SONAR_HOST_URL`
- `SONAR_ORGANIZATION`
- `SONAR_PROJECT_KEY`

## Environment Files

Real environment files are ignored by Git:

- `.env`
- `.env.production`
- `backend/.env`
- `backend/.env.production`

Local ignored backend env files may include placeholder keys for reference, but GitHub Actions secrets are the source of truth for CI. Do not commit real tokens, licenses, or production secrets.
