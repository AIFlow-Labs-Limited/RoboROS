# RoboROS Research And Refactor Plan

## Current state

- Upstream sources cloned locally:
  - `components/agenticros`
  - `components/agenticros-skill-followme`
  - `components/RoboROS`
- AgenticROS is not currently universal in practice.
- The repository already separates a reusable ROS core from an OpenClaw host adapter, but the tool and skill layers are still implemented against the OpenClaw plugin API.

## Main findings

### Reusable today

- `components/agenticros/packages/core`
  - transport abstraction
  - config schema
  - topic helpers
  - rosbridge / local / webrtc / zenoh implementations
- `components/agenticros/ros2_ws`
  - ROS messages
  - discovery node
  - robot-side WebRTC agent
  - follow-me ROS behavior

### OpenClaw-bound today

- `components/agenticros/packages/agenticros`
  - plugin entrypoint
  - tool registration
  - commands
  - hooks
  - config persistence in `~/.openclaw/openclaw.json`
  - HTTP routes / teleop
  - skill runtime contract

### Important gaps

- The site markets “multiple AI agents”, but the shipped adapter is OpenClaw-only today.
- `pnpm typecheck` fails as cloned because the workspace typing/build boundary is not clean.
- `docker/Dockerfile.agenticros` is stale and references an older repo layout, so the plugin container does not build.
- The Follow Me skill is an OpenClaw runtime plugin, not a Codex/Claude instruction skill.

## Docker verification

- Docker Desktop is running on this Mac.
- The ROS2 demo image built successfully:
  - `agenticros/ros2:latest`
- The demo stack was started successfully:
  - container `docker-ros2-1`
  - `localhost:9090` is reachable
  - rosbridge started inside the container
- The plugin image does not build until the stale Dockerfile is fixed.

## Recommended target architecture

Build RoboROS as a neutral execution layer plus thin host adapters.

### Layer 1: Shared runtime

Create a host-neutral package for:

- transport lifecycle
- tool business logic
- capability discovery helpers
- safety validation primitives
- image/depth helpers
- config model

This should not know about OpenClaw, Codex, Claude Code, or MCP host wiring.

### Layer 2: Host adapters

- `adapter-openclaw`
  - keeps compatibility with current plugin contract
- `adapter-mcp`
  - exposes the same robot operations as MCP tools/resources/prompts

### Layer 3: Agent guidance

- `skills/codex/`
  - `SKILL.md`
  - helper scripts
  - usage instructions for Codex
- `skills/claude-code/`
  - `SKILL.md` and Claude-oriented guidance
  - slash-command or workflow notes if useful

These are instruction layers only. They should call the MCP server or wrappers, not contain robot control loops.

## Proposed RoboROS repo layout

```text
RoboROS/
├── docs/
│   ├── research/
│   ├── architecture/
│   └── migration/
├── packages/
│   ├── core-runtime/
│   ├── adapter-openclaw/
│   ├── adapter-mcp/
│   ├── shared-tool-definitions/
│   └── sdk-types/
├── skills/
│   ├── codex-robotics/
│   └── claude-robotics/
├── scripts/
│   ├── run-demo.sh
│   ├── smoke-test-mcp.sh
│   └── doctor.sh
└── upstream/
    ├── agenticros/
    └── agenticros-skill-followme/
```

## Refactor phases

### Phase 0: Stabilize upstream extraction

- fix workspace typing/build order
- fix stale Docker plugin image files
- document exact upstream files we are reusing versus replacing

### Phase 1: Extract shared runtime

- move transport manager out of OpenClaw adapter
- move depth helpers out of adapter package
- split tool handlers from host registration wrappers
- introduce neutral result objects for text/json/image payloads

### Phase 2: Build MCP adapter

- expose core ROS tools as MCP tools
- expose capability summary as MCP resource/prompt
- support rosbridge first, then local/webrtc/zenoh
- add smoke tests against the running Docker demo

### Phase 3: Preserve OpenClaw compatibility

- keep an OpenClaw adapter package as a thin wrapper
- keep current OpenClaw skill loader working for backward compatibility
- optionally add a migration bridge from old config to new config shape

### Phase 4: Add Codex and Claude usage layers

- Codex skill with `SKILL.md` plus helper scripts
- Claude Code skill/instructions plus recommended slash commands/workflows
- shared examples for:
  - inspect robot state
  - take camera snapshot
  - publish `cmd_vel`
  - call services
  - start/stop Follow Me

## Immediate next implementation tasks

1. Create the new RoboROS workspace scaffold.
2. Copy only the reusable transport/config code into a new shared runtime package.
3. Extract one tool end to end as proof of architecture:
   - `ros2_list_topics`
   - or `ros2_publish`
4. Stand up an MCP server against the already running Docker rosbridge demo.
5. Add a minimal Codex skill that targets the MCP server.

## Decision

Proceed with a sibling-adapter design, not a direct rename or shallow fork of the current OpenClaw plugin.
