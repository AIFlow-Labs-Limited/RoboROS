---
name: roboros-operator
description: Canonical RoboROS operator skill for Codex. Use when operating RoboROS, debugging the Docker demo or web dashboard, controlling ROS topics and services, or exporting LeRobot demo episodes.
---

# RoboROS Operator For Codex

This is the canonical RoboROS skill. Mirror this skill into other host folders rather than rewriting behavior from scratch.

## Start Order

1. `pnpm demo`
2. `pnpm build`
3. `pnpm dev:mcp`
4. `pnpm dev:web`

## Visual Surface

- web dashboard: `http://127.0.0.1:3210`
- docker logs: `pnpm demo:logs`
- docker shell: `pnpm demo:shell`

## MCP Order

1. `robot_get_overview`
2. `ros2_list_topics`
3. `ros2_list_services`
4. `robot_camera_snapshot`
5. `ros2_call_service`
6. `ros2_publish` only after observation

## Demo Contract

- rosbridge: `ws://127.0.0.1:9090`
- camera: `/robotflow/demo/camera/image_raw/compressed`
- heartbeat: `/robotflow/demo/heartbeat`
- cmd echo: `/robotflow/demo/cmd_vel_echo`
- demo service: `/robotflow/demo/add_two_ints`

## Web Dashboard Checks

- confirm Docker status renders
- confirm overview renders
- confirm topics and services load
- confirm camera snapshot renders
- confirm `add_two_ints` returns a sum
- confirm drive-pad buttons publish safely
- confirm LeRobot export writes to `artifacts/lerobot`

## Guardrails

- prefer RoboROS over direct rosbridge experiments
- treat motion as safety-sensitive
- keep host specifics outside `packages/runtime-core`
- use `packages/bridge-lerobot` for dataset work
