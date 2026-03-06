---
name: codex-robotics
description: Use when working on RoboROS, running the RoboROS MCP adapter, debugging ROS2/rosbridge connectivity, or controlling a robot through the RoboROS tool contract from Codex.
---

# Codex Robotics

Use this skill when the task involves RoboROS development or robot control through RoboROS.

## Workflow

1. Run `bash scripts/doctor.sh` to verify Node, pnpm, Docker, and rosbridge.
2. Prefer the MCP adapter over ad hoc shell scripts for robot actions.
3. Start the MCP server with `pnpm dev:mcp` or build first and run the generated `dist/index.js`.
4. Use `robot_get_capabilities` before assuming topics or camera sources.
5. Treat motion commands as safety-sensitive. Respect the configured linear and angular limits.

## Environment

- `RFL_ROSBRIDGE_URL`
- `RFL_ROBOT_NAME`
- `RFL_ROBOT_NAMESPACE`
- `RFL_CAMERA_TOPIC`

## Rules

- Never assume a robot is safe to move without checking capabilities and current transport health.
- Use `robot_camera_snapshot` or `ros2_subscribe_once` for observation before issuing action commands.
- If the user asks for dataset or imitation-learning workflows, route through the LeRobot bridge package and episode manifests rather than inventing custom formats.

