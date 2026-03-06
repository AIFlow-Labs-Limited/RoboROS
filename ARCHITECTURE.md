# RoboROS Universal Architecture

## Positioning

RoboROS should be the open robotics execution and learning fabric for Robot Flow Labs.

It should not be centered on OpenClaw, Claude, Codex, Cursor, or any single host.

Those hosts are clients.

The product center is:

- a universal robot control plane
- a universal agent integration plane
- a universal robot-learning data plane

## Product statement

RoboROS is an open-source Robot Flow Labs platform that lets any capable agent or application:

- inspect robot capabilities
- read robot state
- issue safe robot actions
- consume camera and sensor streams
- record demonstrations and episodes
- connect to LeRobot-compatible datasets and training pipelines

## Architecture goals

1. Any agent can use it.
2. No single-agent lock-in.
3. Live robotics and robot-learning workflows share one platform.
4. Safety is outside the LLM, not delegated to prompts.
5. The public interface is stable even if adapters change.

## Core principle

MCP is the primary northbound interface.

Why:

- Claude Code officially supports MCP.
- Cursor editor and CLI officially support MCP.
- OpenAI models and tooling increasingly support MCP-capable workflows and connectors.

But MCP is not enough by itself. RoboROS also needs fallback interfaces for non-MCP consumers.

## Universal platform shape

```text
                     Northbound Interfaces

  Claude Code      Cursor        Codex / OpenAI        Other agents/apps
       |              |                |                     |
       |              |                |                     |
       +--------------+----------------+---------------------+
                              |
                         MCP Server
                              |
                      REST / WS / SDK Layer
                              |
                   RoboROS Orchestrator Runtime
          +-------------------+-------------------+
          |                   |                   |
      Safety Engine      Capability Graph     Job Runtime
          |                   |                   |
          +-------------------+-------------------+
                              |
                     Southbound Connectors
          +-------------------+-------------------+
          |                   |                   |
        ROS2             LeRobot Bridge      Vendor/Custom
   rosbridge/zenoh         datasets, IO      APIs, serial,
    local/webrtc          teleop, replay      CAN, gRPC
                              |
                    Data / Training Plane
                  episodes, logs, datasets,
                  evaluation, policy hooks
```

## The three planes

### 1. Agent plane

The agent plane is how Claude, Codex, Cursor, or any other agent interacts with RoboROS.

Expose:

- MCP tools
- MCP prompts
- MCP resources
- REST API
- WebSocket event stream
- TypeScript SDK
- Python SDK

Do not expose host-specific runtime assumptions here.

### 2. Control plane

The control plane is the live robotics runtime.

Responsibilities:

- transport lifecycle
- robot/session registry
- capability discovery
- command execution
- state querying
- action streaming
- camera/image handling
- policy enforcement
- emergency stop
- audit logging

### 3. Data and learning plane

The data plane is where Robot Flow Labs becomes bigger than “ROS tools for chat”.

Responsibilities:

- record demonstrations
- store episodes
- convert to LeRobotDataset v3
- replay and evaluation
- training job hooks
- dataset metadata and search
- model/policy registry

This is where LeRobot belongs.

## Northbound interfaces

### MCP server

This is the default integration interface.

Expose tools like:

- `robots_list`
- `robot_get_capabilities`
- `ros2_list_topics`
- `ros2_publish`
- `ros2_subscribe_once`
- `ros2_service_call`
- `ros2_action_goal`
- `robot_camera_snapshot`
- `robot_depth_sample`
- `robot_estop`
- `dataset_record_episode`
- `dataset_list`
- `dataset_export_lerobot`

Expose prompts like:

- `robot_diagnose`
- `robot_safe_move`
- `record_demonstration`
- `follow_me_start`

Expose resources like:

- robot capability manifests
- live topic inventory
- recent event log
- dataset manifest

### REST and WebSocket API

Needed for:

- non-MCP agents
- mobile apps
- dashboards
- browser UIs
- automation systems

REST is for commands and configuration.

WebSocket is for:

- tool event streaming
- action feedback
- robot status
- camera metadata
- telemetry updates

### SDKs

Ship:

- `@robotflowlabs/rob​​oros-sdk`
- `robotflowlabs-roboros` Python SDK

These wrap REST/WebSocket and mirror MCP semantics.

## Agent-specific integration layer

These are thin wrappers, not the source of truth.

### Claude Code

Support via:

- MCP server
- project `CLAUDE.md`
- project slash commands in `.claude/commands/`
- optional specialized subagents

### Cursor

Support via:

- MCP server in `.cursor/mcp.json`
- project rules in `.cursor/rules/`
- optional `AGENTS.md`

### Codex / OpenAI workflows

Support via:

- MCP-first where available
- repository `AGENTS.md`
- `SKILL.md` guidance bundles for local/dev workflows
- SDK and API fallback for clients that use the OpenAI API without MCP

## Southbound connectors

### ROS2 connector family

Keep support for:

- rosbridge
- local DDS
- WebRTC bridge
- Zenoh

These should live behind one stable runtime interface.

### LeRobot connector family

Add a dedicated LeRobot bridge for:

- dataset recording
- teleoperation metadata capture
- observation/action schema mapping
- exporting episodes to LeRobotDataset v3
- training/evaluation handoff

RoboROS should not try to replace LeRobot.

It should integrate with it.

### Vendor connector family

Add adapters for robots that are not cleanly exposed through ROS2:

- serial/USB robots
- CAN-bus controllers
- manufacturer HTTP/gRPC SDKs
- custom teleop rigs

These adapters normalize into the RoboROS capability graph.

## Internal package architecture

```text
packages/
├── runtime-core
├── safety-engine
├── capability-graph
├── transport-ros2
├── transport-rosbridge
├── transport-zenoh
├── transport-webrtc
├── adapter-mcp
├── adapter-rest
├── adapter-openclaw-legacy
├── bridge-lerobot
├── bridge-vendor
├── sdk-types
├── sdk-ts
└── sdk-py
```

## Runtime contracts

Everything should compile against internal host-neutral contracts.

### Robot runtime

- `connectRobot()`
- `disconnectRobot()`
- `listCapabilities()`
- `executeCommand()`
- `subscribeState()`
- `captureFrame()`
- `emergencyStop()`

### Tool contract

Every tool should have:

- stable id
- schema
- safety class
- streaming/non-streaming mode
- audit metadata
- host adapters

### Capability graph

Represent robots as normalized capabilities:

- motion
- navigation
- manipulation
- cameras
- depth
- audio
- force/torque
- battery/power
- safety
- teleop
- learning/data-recording

Do not infer behavior from topic names alone once discovery exists.

## Safety model

Safety must be runtime-enforced.

Never rely on prompts alone for:

- speed limits
- workspace boundaries
- forbidden commands
- arm collision zones
- deadman/enable switches
- estop

Recommended layers:

- static policy rules
- per-robot capability constraints
- operator role checks
- dry-run validation
- auditable blocked-action results

`estop` must remain callable even when the agent stack is unhealthy.

## LeRobot integration strategy

LeRobot should be a first-class bridge, not an afterthought.

### What RoboROS should do

- capture robot observations/actions during teleop and autonomous runs
- normalize timestamps and camera streams
- persist metadata needed for LeRobotDataset v3
- export or stream episodes to LeRobot-compatible storage
- support replay and offline evaluation

### What LeRobot should continue to own

- dataset specification
- training APIs
- policy learning pipelines
- pretrained model ecosystem

### Practical boundary

RoboROS = online runtime + recording/orchestration layer

LeRobot = dataset/training/model layer

## Open source packaging

Signal this clearly as a Robot Flow Labs open-source project.

### Naming

Use:

- project name: `RoboROS`
- publisher/org branding: `Robot Flow Labs`
- package scope: `@robotflowlabs/*`

### Licensing

Recommended:

- code: Apache-2.0
- docs/examples: MIT or Apache-2.0
- datasets: separate dataset license per release
- trained models: separate model license per release

Apache-2.0 is the better default for this codebase because the upstream base already uses Apache-2.0 and the patent grant is useful in robotics.

### Public messaging

Message it as:

- open robotics runtime
- agent-agnostic
- MCP-native
- ROS2 and LeRobot ready
- works with Claude Code, Cursor, Codex, and custom agents

Do not message it as “OpenClaw without OpenClaw”.

## Migration path from AgenticROS

### Keep

- transport core ideas
- ROS2 workspace pieces
- discovery concepts
- some depth/image logic

### Replace

- host-specific plugin API coupling
- module-global runtime state
- OpenClaw-first skill contract
- stale Docker/plugin packaging

### Preserve temporarily

- an OpenClaw legacy adapter

That lets existing users keep working while RoboROS becomes the main platform.

## Engineering standards for the rebuild

- contract-first schemas
- no module-global mutable runtime state
- typed streaming events
- per-package tests
- mock rosbridge test harness
- dockerized demo CI
- adapter conformance tests
- safety-policy regression tests

## What we should build first

### Milestone 1

- scaffold RoboROS workspace
- extract runtime core
- add MCP adapter
- support rosbridge only
- implement:
  - `robots_list`
  - `robot_get_capabilities`
  - `ros2_list_topics`
  - `ros2_publish`
  - `robot_camera_snapshot`

### Milestone 2

- add Cursor and Claude project integrations
- add Codex skill/instructions
- add REST/WebSocket API
- add safety engine

### Milestone 3

- add LeRobot bridge
- record/export episodes
- dataset manifest browsing
- replay/evaluation hooks

### Milestone 4

- add legacy OpenClaw adapter
- add Zenoh and WebRTC parity
- harden packaging and docs

## Final decision

RoboROS should be rebuilt as:

- an open-source Robot Flow Labs platform
- MCP-native
- agent-agnostic
- ROS2-first but not ROS2-only
- LeRobot-integrated for data and learning

The correct architecture is not “one plugin for every host”.

It is:

- one neutral runtime
- many thin host adapters
- one stable public contract
