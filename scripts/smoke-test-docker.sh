#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${ROOT_DIR}/docker/compose.yml"
KEEP_STACK="${RFL_KEEP_STACK:-0}"

report_port_conflict() {
  echo "Port 9090 is already in use. Stop the conflicting process or container before running the RoboROS smoke test."

  if docker ps --format 'table {{.Names}}\t{{.Ports}}' | grep -E '(^NAMES|9090->9090/tcp)' >/dev/null 2>&1; then
    echo
    docker ps --format 'table {{.Names}}\t{{.Ports}}' | grep -E '(^NAMES|9090->9090/tcp)' || true
  fi

  if command -v lsof >/dev/null 2>&1; then
    echo
    lsof -nP -iTCP:9090 -sTCP:LISTEN || true
  fi
}

ensure_port_available() {
  if docker compose -f "${COMPOSE_FILE}" ps --status running -q demo-rosbridge >/dev/null 2>&1; then
    return 0
  fi

  if docker ps --format '{{.Ports}}' | grep -q '9090->9090/tcp'; then
    report_port_conflict
    exit 1
  fi

  if command -v lsof >/dev/null 2>&1 && lsof -nP -iTCP:9090 -sTCP:LISTEN >/dev/null 2>&1; then
    report_port_conflict
    exit 1
  fi
}

wait_for_port() {
  local host="$1"
  local port="$2"
  local attempts="${3:-45}"

  for ((attempt=1; attempt<=attempts; attempt+=1)); do
    if (echo > "/dev/tcp/${host}/${port}") >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done

  return 1
}

cleanup() {
  if [[ "${KEEP_STACK}" == "1" ]]; then
    return
  fi

  docker compose -f "${COMPOSE_FILE}" down --remove-orphans >/dev/null 2>&1 || true
}

trap cleanup EXIT

echo "Building and starting the Robot Flow Labs Docker demo..."
ensure_port_available
docker compose -f "${COMPOSE_FILE}" up -d --build demo-rosbridge

if ! wait_for_port "127.0.0.1" "9090" "60"; then
  echo
  echo "rosbridge failed to come up on ws://127.0.0.1:9090"
  docker compose -f "${COMPOSE_FILE}" logs --tail 160 demo-rosbridge
  exit 1
fi

echo
echo "Building RoboROS workspace..."
pnpm --dir "${ROOT_DIR}" build

echo
echo "Running MCP smoke test against the Docker demo..."
node "${ROOT_DIR}/scripts/smoke-test-docker.mjs"
