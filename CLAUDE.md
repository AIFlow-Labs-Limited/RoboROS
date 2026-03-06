# RoboROS Claude Guide

## Mission

Operate and extend RoboROS through the MCP adapter and host-neutral runtime.

## Preferred workflow

1. Verify environment with `bash scripts/doctor.sh`
2. Start the demo with `pnpm demo` and inspect it with `pnpm demo:ps` or `pnpm demo:logs`
3. Read `skills/roboros-operator/SKILL.md`
4. Read `ARCHITECTURE.md`
5. Use MCP resources and tools before inventing local workflows
6. Keep host-specific logic out of `packages/runtime-core`

## Safety

- Always inspect health and capabilities first
- Never bypass runtime safety checks for robot motion
- Prefer reversible, observable steps when testing against a live robot or demo
