---
name: codex-robotics
description: Use when Codex is working on RoboROS, running the RoboROS MCP adapter, debugging ROS2 and Docker connectivity, or controlling a robot through the RoboROS MCP contract.
---

# Codex Robotics

Use this skill when the task involves RoboROS development or robot control from Codex.

Read `skills/roboros-operator/SKILL.md` first for the shared operating workflow.

## Workflow

1. Run `bash scripts/doctor.sh` to verify Node, pnpm, Docker, and rosbridge.
2. Use `pnpm demo`, `pnpm demo:ps`, and `pnpm demo:logs` to work against the live Docker demo.
3. Prefer the MCP adapter over ad hoc shell scripts for robot actions.
4. Start the MCP server with `pnpm dev:mcp` or build first and run the generated `dist/index.js`.
5. Use `robot_get_overview` before assuming topics, services, or camera sources.
6. Treat motion commands as safety-sensitive. Respect the configured linear and angular limits.

## Environment

- `RFL_ROSBRIDGE_URL`
- `RFL_ROBOT_NAME`
- `RFL_ROBOT_NAMESPACE`
- `RFL_CAMERA_TOPIC`

## Rules

- Never assume a robot is safe to move without checking capabilities and current transport health.
- Use `robot_camera_snapshot` or `ros2_subscribe_once` for observation before issuing action commands.
- For a full live check, use `ros2_list_topics`, `ros2_list_services`, and `ros2_call_service`.
- If the user asks for dataset or imitation-learning workflows, route through the LeRobot bridge package and episode manifests rather than inventing custom formats.
