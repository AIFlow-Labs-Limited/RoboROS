#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${ROOT_DIR}/docker/compose.yml"

echo "RoboROS doctor // Robot Flow Labs"
echo

echo "[1/5] Workspace"
echo "root: ${ROOT_DIR}"
echo

echo "[2/5] Node toolchain"
node --version
pnpm --version
echo

echo "[3/5] Docker"
docker info >/dev/null
docker compose version
echo

echo "[4/5] Demo stack"
if docker compose -f "${COMPOSE_FILE}" ps >/dev/null 2>&1; then
  docker compose -f "${COMPOSE_FILE}" ps
else
  echo "compose file: ${COMPOSE_FILE}"
fi
echo

echo "[5/5] rosbridge"
if (echo > /dev/tcp/127.0.0.1/9090) >/dev/null 2>&1; then
  echo "rosbridge: reachable on ws://127.0.0.1:9090"
else
  echo "rosbridge: not reachable on ws://127.0.0.1:9090"
  echo "start it with: bash scripts/run-demo.sh"
fi
