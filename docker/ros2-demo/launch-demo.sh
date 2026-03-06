#!/usr/bin/env bash
set -euo pipefail

set +u
source /opt/ros/jazzy/setup.bash
set -u

cleanup() {
  for pid in "${DEMO_PID:-}" "${ROSAPI_PID:-}" "${ROSBRIDGE_PID:-}"; do
    if [[ -n "${pid}" ]]; then
      kill "${pid}" 2>/dev/null || true
    fi
  done
  wait || true
}

trap cleanup EXIT INT TERM

echo "[RoboROS demo] starting Robot Flow Labs ROS2 demo node"
python3 /opt/roboros/robotflow_demo_node.py &
DEMO_PID=$!

echo "[RoboROS demo] starting rosapi"
ros2 run rosapi rosapi_node &
ROSAPI_PID=$!

echo "[RoboROS demo] starting rosbridge on 0.0.0.0:9090"
ros2 run rosbridge_server rosbridge_websocket --ros-args -p port:=9090 -p address:=0.0.0.0 &
ROSBRIDGE_PID=$!

wait -n "${DEMO_PID}" "${ROSAPI_PID}" "${ROSBRIDGE_PID}"
