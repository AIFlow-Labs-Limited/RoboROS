#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${ROOT_DIR}/docker/compose.yml"

report_port_conflict() {
  echo "Port 9090 is already in use. Stop the conflicting process or container before starting RoboROS."

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

echo "Booting the Robot Flow Labs RoboROS demo stack..."
ensure_port_available
docker compose -f "${COMPOSE_FILE}" up -d --build demo-rosbridge

if ! wait_for_port "127.0.0.1" "9090" "45"; then
  echo
  echo "rosbridge did not become reachable on ws://127.0.0.1:9090"
  docker compose -f "${COMPOSE_FILE}" logs --tail 120 demo-rosbridge
  exit 1
fi

echo
docker compose -f "${COMPOSE_FILE}" ps
echo
echo "Demo ready."
echo "rosbridge: ws://127.0.0.1:9090"
echo "camera: /robotflow/demo/camera/image_raw/compressed"
echo "service: /robotflow/demo/add_two_ints"
echo "next: pnpm --dir \"${ROOT_DIR}\" build && pnpm --dir \"${ROOT_DIR}\" dev:mcp"
