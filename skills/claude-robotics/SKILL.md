---
name: claude-robotics
description: Use when Claude Code is operating against RoboROS through MCP, debugging the live Docker demo, or extending the RoboROS platform and LeRobot bridge.
---

# Claude Robotics

Use this skill for RoboROS control, diagnostics, and platform work from Claude Code.

Read `skills/roboros-operator/SKILL.md` first for the shared operating workflow.

## Preferred path

1. Connect through the RoboROS MCP server.
2. Start live debugging from `pnpm demo`, `pnpm demo:ps`, and `pnpm demo:logs`.
3. Read `robot://overview`, `robot://health`, and `robot://capabilities` before issuing motion commands.
4. Prefer structured tool calls over shell-based rosbridge experiments.
5. Keep safety outside prompt text. Runtime policy is the source of truth.

## Common tasks

- inspect available ROS2 topics
- inspect available ROS2 services
- publish velocity or command messages
- call ROS2 services
- capture camera frames
- verify rosbridge connectivity
- prepare LeRobot-compatible episode manifests

## Guardrails

- Do not bypass RoboROS safety checks for convenience.
- Do not hardcode topic names if `robot_get_capabilities` can discover them.
- When building new host integrations, keep the runtime host-neutral and put host specifics in thin adapters.
