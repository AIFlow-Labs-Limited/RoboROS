---
name: roboros-operator
description: Claude mirror of the canonical RoboROS operator skill. Use when Claude is operating RoboROS, debugging the Docker demo or dashboard, or exporting LeRobot demo episodes.
---

# RoboROS Operator For Claude

Mirror of the canonical Codex skill at `/Users/ilessio/Development/AIFLOWLABS/deep_learning/AgentROS/components/RoboROS/.codex/skills/roboros-operator/SKILL.md`.

Use the same operating order:

1. `pnpm demo`
2. `pnpm build`
3. `pnpm dev:mcp`
4. `pnpm dev:web`

Claude should start from:

1. `robot_get_overview`
2. `ros2_list_topics`
3. `ros2_list_services`
4. `robot_camera_snapshot`

Visual debug surface:

- `http://127.0.0.1:3210`
- `pnpm demo:logs`
- `pnpm demo:shell`
