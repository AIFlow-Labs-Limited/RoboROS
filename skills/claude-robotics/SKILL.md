---
name: claude-robotics
description: Use when Claude Code is operating against RoboROS through MCP, needs guidance for safe robot actions, or is extending the RoboROS platform and LeRobot bridge.
---

# Claude Robotics

Use this skill for RoboROS control, diagnostics, and platform work from Claude Code.

## Preferred path

1. Connect through the RoboROS MCP server.
2. Read `robot://health` and `robot://capabilities` before issuing motion commands.
3. Prefer structured tool calls over shell-based rosbridge experiments.
4. Keep safety outside prompt text. Runtime policy is the source of truth.

## Common tasks

- inspect available ROS2 topics
- publish velocity or command messages
- capture camera frames
- verify rosbridge connectivity
- prepare LeRobot-compatible episode manifests

## Guardrails

- Do not bypass RoboROS safety checks for convenience.
- Do not hardcode topic names if `robot_get_capabilities` can discover them.
- When building new host integrations, keep the runtime host-neutral and put host specifics in thin adapters.
