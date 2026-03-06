# RoboROS Claude Guide

## Mission

Operate and extend RoboROS through the MCP adapter, REST API, and dashboard web interface.

## Quick start

```bash
# 1. Check environment
bash scripts/doctor.sh

# 2. Boot the demo (Docker rosbridge + ROS2 demo node)
pnpm demo

# 3. Build all packages
pnpm build

# 4. Start the MCP adapter (stdio, for Claude Code)
pnpm dev:mcp

# 5. Start the dashboard web UI
pnpm dev:web          # → http://127.0.0.1:3210
```

## MCP server setup

Add this to your Claude Code MCP config to connect the RoboROS MCP adapter:

```json
{
  "mcpServers": {
    "roboros": {
      "command": "node",
      "args": ["packages/adapter-mcp/dist/index.js"],
      "cwd": "<path-to-RoboROS-repo>"
    }
  }
}
```

The adapter requires the demo to be running (`pnpm demo`).

### MCP tools available

| Tool | Description |
|------|-------------|
| `robots_list` | List connected robots |
| `robot_get_overview` | Full runtime snapshot: health + capabilities + services |
| `robot_get_capabilities` | Topic inventory and robot affordances |
| `ros2_list_topics` | All reachable ROS2 topics |
| `ros2_list_services` | All reachable ROS2 services |
| `ros2_publish` | Publish a message (e.g. `/cmd_vel`) with safety checks |
| `ros2_call_service` | Call a ROS2 service and return response |
| `ros2_subscribe_once` | Read next message from a topic |
| `robot_camera_snapshot` | Capture a camera frame (returns base64 image) |

### MCP resources

| URI | Description |
|-----|-------------|
| `robot://health` | Connection state and transport info |
| `robot://overview` | Agent-friendly overview (health + capabilities + services) |
| `robot://capabilities` | Capability flags, topics, and affordances |

## Dashboard REST API

When the web server is running (`pnpm dev:web`), all operations are also available via HTTP at `http://127.0.0.1:3210`:

### Read endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Connection state |
| GET | `/api/overview` | Full runtime snapshot |
| GET | `/api/topics` | ROS2 topic list |
| GET | `/api/services` | ROS2 service list |
| GET | `/api/camera` | Camera snapshot (base64) |
| GET | `/api/demo/ps` | Docker compose status |
| GET | `/api/demo/logs?tail=N&since=5m` | Docker container logs |

### Write endpoints

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/api/publish` | `{topic, type, message}` | Publish ROS2 message |
| POST | `/api/service` | `{service, type, args}` | Call ROS2 service |
| POST | `/api/subscribe-once` | `{topic, type, timeoutMs}` | Read next message |
| POST | `/api/lerobot/export-demo` | (none) | Export LeRobot episode |

### Example: headless curl workflow

```bash
# 1. Check health
curl -s http://127.0.0.1:3210/api/health | jq

# 2. List topics
curl -s http://127.0.0.1:3210/api/topics | jq '.topics[].name'

# 3. Read heartbeat
curl -s -X POST http://127.0.0.1:3210/api/subscribe-once \
  -H "Content-Type: application/json" \
  -d '{"topic":"/robotflow/demo/heartbeat","type":"std_msgs/msg/String","timeoutMs":4000}' | jq

# 4. Send stop command
curl -s -X POST http://127.0.0.1:3210/api/publish \
  -H "Content-Type: application/json" \
  -d '{"topic":"/cmd_vel","type":"geometry_msgs/msg/Twist","message":{"linear":{"x":0,"y":0,"z":0},"angular":{"x":0,"y":0,"z":0}}}' | jq

# 5. Call add_two_ints service
curl -s -X POST http://127.0.0.1:3210/api/service \
  -H "Content-Type: application/json" \
  -d '{"service":"/robotflow/demo/add_two_ints","type":"example_interfaces/srv/AddTwoInts","args":{"a":7,"b":13}}' | jq

# 6. Export a LeRobot demo episode
curl -s -X POST http://127.0.0.1:3210/api/lerobot/export-demo | jq
```

## Operating order

Every session should follow this sequence:

1. **Verify** - `bash scripts/doctor.sh`
2. **Boot demo** - `pnpm demo` (or confirm already running with `pnpm demo:ps`)
3. **Inspect health** - `robot_get_overview` (MCP) or `GET /api/overview` (REST)
4. **Discover** - `ros2_list_topics` + `ros2_list_services`
5. **Observe** - `robot_camera_snapshot` and `ros2_subscribe_once` on heartbeat
6. **Act** - `ros2_publish` for motion, `ros2_call_service` for services
7. **Record** - `POST /api/lerobot/export-demo` to create LeRobot episodes

## Safety rules

- Always call `robot_get_overview` before issuing motion commands
- Never bypass runtime safety checks
- Prefer reversible, observable steps when testing against a live robot
- Use the stop command (`/cmd_vel` with zero velocities) before ending sessions
- Keep safety logic in runtime code, not in prompts

## Skills

| Skill | Path | Purpose |
|-------|------|---------|
| `roboros-operator` | `.claude/skills/roboros-operator/SKILL.md` | Operating RoboROS, debugging demo, exporting episodes |
| `robot-flow-style` | `.claude/skills/robot-flow-style/SKILL.md` | Dashboard UI design system (industrial cyberpunk) |

## Key paths

| Path | Purpose |
|------|---------|
| `packages/runtime-core` | Host-neutral runtime (rosbridge transport) |
| `packages/adapter-mcp` | MCP server adapter (9 tools, 3 resources) |
| `packages/bridge-lerobot` | LeRobot episode creation and export |
| `packages/dashboard-web` | Web UI + REST API server |
| `docker/compose.yml` | Demo rosbridge container |
| `artifacts/lerobot/` | Exported LeRobot episodes |
| `ARCHITECTURE.md` | Universal architecture document |

## Package scripts

| Script | Description |
|--------|-------------|
| `pnpm build` | Build all packages |
| `pnpm demo` | Start Docker demo (rosbridge + ROS2 node) |
| `pnpm demo:ps` | Show Docker container status |
| `pnpm demo:logs` | Tail Docker logs |
| `pnpm demo:down` | Stop Docker demo |
| `pnpm dev:mcp` | Start MCP adapter (stdio) |
| `pnpm dev:web` | Start dashboard web server |

## Architecture principle

Keep host-specific logic out of `packages/runtime-core`. The runtime is the neutral center; MCP, REST, and the dashboard are thin adapters.
