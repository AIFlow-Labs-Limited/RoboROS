# RoboROS Agent Guide

## Purpose

RoboROS is the Robot Flow Labs open-source robotics runtime.

The repo is organized around one neutral runtime and thin host adapters.

## Start here

1. Run `bash scripts/doctor.sh`
2. If needed, boot the demo with `bash scripts/run-demo.sh`
3. Inspect Docker with `pnpm demo:ps` or `pnpm demo:logs`
4. Build with `pnpm build`
5. Start the MCP adapter with `pnpm dev:mcp`
6. Start every live debug session with `robot_get_overview`

## Key rules

- Prefer the MCP adapter over direct rosbridge shell experiments.
- Query health and capabilities before issuing motion commands.
- Keep safety in runtime code, not in prompt text.
- Do not hardcode topics if runtime discovery can provide them.
- Treat LeRobot as the dataset/training bridge, not something to re-invent ad hoc.

## Important paths

- `packages/runtime-core`
- `packages/adapter-mcp`
- `packages/bridge-lerobot`
- `skills/roboros-operator`
- `skills/codex-robotics`
- `skills/claude-robotics`
- `skills/cursor-robotics`
- `ARCHITECTURE.md`
- `RESEARCH_PLAN.md`
