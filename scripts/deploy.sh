#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[deploy] installing dependencies"
npm install

echo "[deploy] building frontend"
npm run build

echo "[deploy] deploy build complete"
echo "[deploy] backend start command: npm --prefix backend start"
