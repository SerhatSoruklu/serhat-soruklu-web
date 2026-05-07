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

Use `backend/.env.example` as the safe template.
