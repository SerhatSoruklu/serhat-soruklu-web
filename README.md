# Serhat Soruklu Web

Personal platform, writing hub, and systems engineering portfolio of Serhat Soruklu.

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

## Development Conventions

Global frontend theme, layout, and responsive rules are documented in `AGENTS.md`. Primary content gutters should default to `20px` left and right spacing. Theme utilities live in `frontend/src/styles/theme.css`, and reusable layout utilities live in `frontend/src/styles/responsive-layout.css`.

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
