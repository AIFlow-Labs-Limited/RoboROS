---
name: cursor-robotics
description: Use when Cursor is operating against RoboROS through MCP, debugging the live Docker demo, or developing robotics workflows with the RoboROS runtime and adapter packages.
---

# Cursor Robotics

Use this skill for RoboROS control and debugging from Cursor.

Read `skills/roboros-operator/SKILL.md` first for the shared operating workflow.

## Cursor Setup

1. Start the demo with `pnpm demo`.
2. Build RoboROS with `pnpm build`.
3. Point Cursor MCP at `examples/integrations/cursor-mcp.example.json`.
4. Start every live session with `robot_get_overview`.

## Cursor Debug Flow

1. `pnpm demo:ps`
2. `pnpm demo:logs`
3. `robot_get_overview`
4. `ros2_list_topics`
5. `ros2_list_services`
6. `robot_camera_snapshot`

## Rules

- Prefer RoboROS MCP tools over direct rosbridge calls.
- Do not move a robot before checking health, capabilities, and camera state.
- Keep runtime changes in `packages/runtime-core` and host-specific behavior in thin adapters only.
