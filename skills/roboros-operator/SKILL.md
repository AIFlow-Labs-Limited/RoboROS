---
name: roboros-operator
description: Use when any agent needs to operate, inspect, or debug RoboROS against the live Docker demo or a rosbridge-backed robot. Covers startup, Docker inspection, MCP-first control, demo topics and services, and safe debugging order.
---

# RoboROS Operator

Use this skill for any live RoboROS session, regardless of host agent.

## Start

1. Run `bash scripts/doctor.sh`.
2. Start the demo with `pnpm demo`.
3. Inspect Docker with `pnpm demo:ps`, `pnpm demo:logs`, or `pnpm demo:shell`.
4. Build with `pnpm build`.
5. Start the MCP server with `pnpm dev:mcp`.

## Demo Contract

- rosbridge: `ws://127.0.0.1:9090`
- heartbeat topic: `/robotflow/demo/heartbeat`
- camera topic: `/robotflow/demo/camera/image_raw/compressed`
- cmd echo topic: `/robotflow/demo/cmd_vel_echo`
- demo service: `/robotflow/demo/add_two_ints`

## MCP Order

1. `robot_get_overview`
2. `ros2_list_topics`
3. `ros2_list_services`
4. `robot_camera_snapshot`
5. `ros2_call_service`
6. `ros2_publish` only after observation and capability checks

## Debug Order

1. `bash scripts/doctor.sh`
2. `pnpm demo:logs`
3. `pnpm smoke:docker`
4. If port `9090` is busy, stop the conflicting process or container first.
5. Use `pnpm demo:shell` for container-level inspection.

## Guardrails

- Prefer MCP tools over raw rosbridge experiments.
- Treat `/cmd_vel` as safety-sensitive.
- Use absolute topic and service names when you mean global paths.
- Keep LeRobot work in `packages/bridge-lerobot` and its manifests.
