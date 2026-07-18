#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[release] installing root dependencies from package-lock.json"
npm ci --ignore-scripts

echo "[release] installing frontend and backend dependencies from lockfiles"
npm run install:projects

echo "[release] installing Playwright browsers for browser validation"
npm --prefix frontend run e2e:install -- chromium firefox webkit

echo "[release] running the complete release-candidate gate"
npm run validate:release

echo "[release] repository release candidate is ready for operator review"
echo "[release] frontend artifact: frontend/dist/frontend"
echo "[release] frontend start: npm run start:frontend"
echo "[release] backend start: npm run start:backend"
echo "[release] this script does not publish files or change production services"
