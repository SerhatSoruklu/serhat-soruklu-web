# Serhat Soruklu Web

Personal platform, writing hub, and systems engineering portfolio of Serhat Soruklu.

## Structure

```text
serhatsoruklu/
  frontend/   Angular, TypeScript
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

- `[frontend]` Angular dev server with live reload
- `[backend]` Express server through nodemon

Default local URLs:

- Frontend: `http://localhost:4200`
- Backend health check: `http://localhost:3000/api/health`

## Build

```bash
npm run build
```

This builds the Angular frontend.

## Development Conventions

Global frontend theme, layout, and responsive rules are documented in `AGENTS.md`. Primary content gutters should default to `20px` left and right spacing. Theme utilities live in `frontend/src/styles/theme.css`, and reusable layout utilities live in `frontend/src/styles/responsive-layout.css`.

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

## Basic Deploy Script

```bash
npm run deploy
```

The deploy script is intentionally lightweight for now. It installs dependencies and builds the frontend. It does not add GitHub Actions, Docker, PM2, Turbo, Nx, or any deployment runner.

## Environment Files

Real environment files are ignored by Git:

- `.env`
- `.env.production`
- `backend/.env`
- `backend/.env.production`

Local ignored backend env files may include placeholder keys for reference, but GitHub Actions secrets are the source of truth for CI. Do not commit real tokens, licenses, or production secrets.
