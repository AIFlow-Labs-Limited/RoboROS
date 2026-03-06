---
name: roboros-operator
description: Cursor mirror of the canonical RoboROS operator skill. Use when Cursor is operating RoboROS, debugging the Docker demo or dashboard, or exporting LeRobot demo episodes.
---

# RoboROS Operator For Cursor

Mirror of the canonical Codex skill at `/Users/ilessio/Development/AIFLOWLABS/deep_learning/AgentROS/components/RoboROS/.codex/skills/roboros-operator/SKILL.md`.

Cursor should use the same contract:

- live demo: `pnpm demo`
- MCP server: `pnpm dev:mcp`
- web dashboard: `pnpm dev:web`
- dashboard URL: `http://127.0.0.1:3210`

Live debug order:

1. `robot_get_overview`
2. `ros2_list_topics`
3. `ros2_list_services`
4. `robot_camera_snapshot`
5. `ros2_call_service`
