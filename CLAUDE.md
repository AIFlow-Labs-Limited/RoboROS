# RoboROS Claude Guide

## Mission

Operate and extend RoboROS through the MCP adapter and host-neutral runtime.

## Preferred workflow

1. Verify environment with `bash scripts/doctor.sh`
2. Read `ARCHITECTURE.md`
3. Use MCP resources and tools before inventing local workflows
4. Keep host-specific logic out of `packages/runtime-core`

## Safety

- Always inspect health and capabilities first
- Never bypass runtime safety checks for robot motion
- Prefer reversible, observable steps when testing against a live robot or demo
