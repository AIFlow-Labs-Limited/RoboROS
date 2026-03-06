# RoboROS Agent Guide

## Purpose

RoboROS is the Robot Flow Labs open-source robotics runtime. Any capable agent (Claude, Cursor, Codex, custom) can inspect robot capabilities, read state, issue safe actions, consume camera streams, and export LeRobot episodes through one stable interface.

## Start here

```bash
# 1. Verify environment
bash scripts/doctor.sh

# 2. Boot demo (Docker rosbridge + ROS2 demo node)
pnpm demo

# 3. Build all packages
pnpm build

# 4. Pick your interface:
pnpm dev:mcp          # MCP adapter (stdio) for Claude Code, Cursor, etc.
pnpm dev:web          # Dashboard web + REST API at http://127.0.0.1:3210
```

## Three integration paths

### Path 1: MCP (recommended for AI agents)

The MCP adapter exposes 9 tools and 3 resources over stdio.

**Setup for Claude Code** - add to your project or user MCP config:

```json
{
  "mcpServers": {
    "roboros": {
      "command": "node",
      "args": ["packages/adapter-mcp/dist/index.js"],
      "cwd": "/path/to/RoboROS"
    }
  }
}
```

**Setup for Cursor** - add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "roboros": {
      "command": "node",
      "args": ["packages/adapter-mcp/dist/index.js"],
      "cwd": "/path/to/RoboROS"
    }
  }
}
```

**MCP tools:**

| Tool | Input | Description |
|------|-------|-------------|
| `robots_list` | (none) | List connected robots |
| `robot_get_overview` | (none) | Health + capabilities + services snapshot |
| `robot_get_capabilities` | (none) | Topic inventory and affordance flags |
| `ros2_list_topics` | (none) | All reachable ROS2 topics |
| `ros2_list_services` | (none) | All reachable ROS2 services |
| `ros2_publish` | `{topic, type, message}` | Publish with safety checks |
| `ros2_call_service` | `{service, type?, args?}` | Call service, return response |
| `ros2_subscribe_once` | `{topic, type?, timeoutMs?}` | Read next message on topic |
| `robot_camera_snapshot` | `{topic?}` | Capture camera frame (base64 image) |

**MCP resources:**

| URI | Content |
|-----|---------|
| `robot://health` | Connection state |
| `robot://overview` | Full runtime snapshot |
| `robot://capabilities` | Discovery flags and topics |

### Path 2: REST API (for scripts, dashboards, non-MCP agents)

Start the web server with `pnpm dev:web`, then use HTTP at `http://127.0.0.1:3210`.

**Read operations:**

```bash
GET /api/health              # Connection state
GET /api/overview            # Full runtime snapshot
GET /api/topics              # ROS2 topic list
GET /api/services            # ROS2 service list
GET /api/camera              # Camera snapshot (base64)
GET /api/demo/ps             # Docker container status
GET /api/demo/logs?tail=24   # Docker logs
```

**Write operations:**

```bash
POST /api/publish            # {topic, type, message}
POST /api/service            # {service, type, args}
POST /api/subscribe-once     # {topic, type, timeoutMs}
POST /api/lerobot/export-demo  # (no body) → export episode
```

### Path 3: Dashboard web UI (visual inspection)

Open `http://127.0.0.1:3210` in a browser. The dashboard provides:

- Live runtime overview with scrollable JSON
- Camera feed with auto-refresh
- Docker container status
- ROS2 topic and service inventory
- Drive pad for motion commands (`/cmd_vel`)
- Service call test (add_two_ints)
- LeRobot episode export
- Docker log tail

The UI follows the Robot Flow Labs industrial cyberpunk design system (see `skills/robot-flow-style/SKILL.md`).

## Operating order (all agents)

Every session must follow this sequence:

1. **Verify** - `robot_get_overview` or `GET /api/overview`
2. **Discover** - `ros2_list_topics` + `ros2_list_services`
3. **Observe** - `robot_camera_snapshot` + `ros2_subscribe_once` on heartbeat
4. **Act** - `ros2_publish` for motion, `ros2_call_service` for services
5. **Record** - `POST /api/lerobot/export-demo` to create LeRobot episodes

## Key rules

- Always inspect health and capabilities before issuing motion commands
- Never bypass runtime safety checks for robot motion
- Prefer the MCP adapter or REST API over direct rosbridge shell experiments
- Do not hardcode topics if runtime discovery can provide them
- Query capabilities flags (`motion`, `cameras`, `navigation`, etc.) to determine what the robot supports
- Use the stop command (`/cmd_vel` with zero velocities) before ending sessions
- Treat LeRobot as the dataset/training bridge, not something to re-invent ad hoc

## Headless smoke test

Agents can verify the full stack without a browser:

```bash
# Health check
curl -s http://127.0.0.1:3210/api/health | jq '.connected'
# → true

# Topic discovery
curl -s http://127.0.0.1:3210/api/topics | jq '.topics | length'
# → 8

# Heartbeat
curl -s -X POST http://127.0.0.1:3210/api/subscribe-once \
  -H "Content-Type: application/json" \
  -d '{"topic":"/robotflow/demo/heartbeat","type":"std_msgs/msg/String","timeoutMs":4000}' \
  | jq '.message.data'

# Camera
curl -s http://127.0.0.1:3210/api/camera | jq '{topic, mimeType, dataLength: (.data | length)}'

# Service call
curl -s -X POST http://127.0.0.1:3210/api/service \
  -H "Content-Type: application/json" \
  -d '{"service":"/robotflow/demo/add_two_ints","type":"example_interfaces/srv/AddTwoInts","args":{"a":7,"b":13}}' \
  | jq '.values.sum'
# → 20

# Motion publish (stop)
curl -s -X POST http://127.0.0.1:3210/api/publish \
  -H "Content-Type: application/json" \
  -d '{"topic":"/cmd_vel","type":"geometry_msgs/msg/Twist","message":{"linear":{"x":0,"y":0,"z":0},"angular":{"x":0,"y":0,"z":0}}}' \
  | jq

# LeRobot export
curl -s -X POST http://127.0.0.1:3210/api/lerobot/export-demo | jq '.outputDir'

# Docker status
curl -s http://127.0.0.1:3210/api/demo/ps | jq -r '.text' | head -3
```

## Package architecture

```
packages/
├── runtime-core     # Host-neutral runtime (transport, discovery, safety)
├── adapter-mcp      # MCP server (9 tools, 3 resources, stdio transport)
├── bridge-lerobot   # LeRobot episode creation and export
└── dashboard-web    # Web UI + Express REST API server
```

## Important paths

| Path | Purpose |
|------|---------|
| `packages/runtime-core` | Core runtime (do not add host-specific logic here) |
| `packages/adapter-mcp` | MCP adapter (Claude Code, Cursor) |
| `packages/bridge-lerobot` | LeRobot episode recording and export |
| `packages/dashboard-web` | Dashboard web UI + REST API |
| `docker/compose.yml` | Demo Docker stack |
| `artifacts/lerobot/` | Exported LeRobot episodes |
| `skills/` | Agent skill bundles (operator, design, robotics) |
| `ARCHITECTURE.md` | Full architecture document |
| `CLAUDE.md` | Claude Code specific guide |

## Skills reference

| Skill | Location | Purpose |
|-------|----------|---------|
| `roboros-operator` | `skills/roboros-operator/SKILL.md` | Operating the runtime and demo |
| `robot-flow-style` | `.claude/skills/robot-flow-style/SKILL.md` | Dashboard UI design system |
| `claude-robotics` | `skills/claude-robotics/SKILL.md` | Claude-specific robotics patterns |
| `codex-robotics` | `skills/codex-robotics/SKILL.md` | Codex-specific robotics patterns |
| `cursor-robotics` | `skills/cursor-robotics/SKILL.md` | Cursor-specific robotics patterns |
