<div align="center">

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   ██████╗  ██████╗ ██████╗  ██████╗ ██████╗  ██████╗ ███████╗               ║
║   ██╔══██╗██╔═══██╗██╔══██╗██╔═══██╗██╔══██╗██╔═══██╗██╔════╝               ║
║   ██████╔╝██║   ██║██████╔╝██║   ██║██████╔╝██║   ██║███████╗               ║
║   ██╔══██╗██║   ██║██╔══██╗██║   ██║██╔══██╗██║   ██║╚════██║               ║
║   ██║  ██║╚██████╔╝██████╔╝╚██████╔╝██║  ██║╚██████╔╝███████║               ║
║   ╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝               ║
║                                                                              ║
║   ROBOT FLOW LABS // OPEN ROBOTICS RUNTIME                                   ║
║   ─────────────────────────────────────────                                  ║
║   MCP-NATIVE · ROS2-FIRST · LEROBOT-READY · AGENT-AGNOSTIC                  ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║   TRANSPORT: ROSBRIDGE     ROBOT: CONNECTED     CAMERA: ACTIVE               ║
║   TOPICS: 8                SERVICES: 51         SAFETY: ENFORCED             ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║   ┌─ NORTHBOUND ──────────────────────────────────────────────────────┐      ║
║   │  CLAUDE CODE · CURSOR · CODEX · CUSTOM AGENTS · DASHBOARD WEB    │      ║
║   └───────────────────────────┬───────────────────────────────────────┘      ║
║                               │                                              ║
║                     ┌─────────┴─────────┐                                    ║
║                     │    MCP SERVER      │                                    ║
║                     │   9 TOOLS          │                                    ║
║                     │   3 RESOURCES      │                                    ║
║                     └─────────┬─────────┘                                    ║
║                               │                                              ║
║                     ┌─────────┴─────────┐                                    ║
║                     │   REST / WS API    │                                    ║
║                     │   :3210 DASHBOARD  │                                    ║
║                     └─────────┬─────────┘                                    ║
║                               │                                              ║
║              ┌────────────────┼────────────────┐                             ║
║              │                │                │                              ║
║   ┌──────────┴──┐  ┌─────────┴──────┐  ┌──────┴──────┐                      ║
║   │ RUNTIME CORE│  │ SAFETY ENGINE  │  │ LEROBOT     │                      ║
║   │ rosbridge   │  │ speed limits   │  │ episodes    │                      ║
║   │ discovery   │  │ boundaries     │  │ datasets    │                      ║
║   │ capabilities│  │ estop          │  │ training    │                      ║
║   └──────────┬──┘  └────────────────┘  └─────────────┘                      ║
║              │                                                               ║
║   ┌──────────┴──────────────────────────────────────────┐                    ║
║   │  SOUTHBOUND: ROS2 · ZENOH · WEBRTC · VENDOR APIs    │                    ║
║   └─────────────────────────────────────────────────────┘                    ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

</div>

<p align="center">
  <a href="https://robotflowlabs.com/"><img alt="Robot Flow Labs" src="https://img.shields.io/badge/Robot_Flow_Labs-FF3B00?style=for-the-badge&labelColor=111111"></a>
  <img alt="MCP Native" src="https://img.shields.io/badge/MCP-native-F3F3F3?style=for-the-badge&labelColor=111111&color=F3F3F3">
  <img alt="ROS2 Ready" src="https://img.shields.io/badge/ROS2-ready-FF3B00?style=for-the-badge&labelColor=111111">
  <img alt="LeRobot Ready" src="https://img.shields.io/badge/LeRobot-ready-F3F3F3?style=for-the-badge&labelColor=111111&color=F3F3F3">
  <img alt="License Apache-2.0" src="https://img.shields.io/badge/License-Apache_2.0-FF3B00?style=for-the-badge&labelColor=111111">
</p>

---

> **One runtime. Any agent. Any robot.**
>
> RoboROS is the open robotics runtime for Robot Flow Labs. Claude Code, Cursor, Codex, custom agents, dashboards, automation systems — all talk to the same stable contract. No one-off plugins. One neutral runtime, many thin adapters.

---

## Quick Start

```bash
pnpm install                  # install dependencies
pnpm demo                     # boot Docker rosbridge + ROS2 demo node
pnpm build                    # build all packages
pnpm dev:mcp                  # start MCP adapter (stdio)
pnpm dev:web                  # start dashboard web → http://127.0.0.1:3210
```

```bash
# verify everything works headlessly
curl -s http://127.0.0.1:3210/api/health | jq '.connected'         # → true
curl -s http://127.0.0.1:3210/api/topics | jq '.topics | length'   # → 8
curl -s -X POST http://127.0.0.1:3210/api/service \
  -H "Content-Type: application/json" \
  -d '{"service":"/robotflow/demo/add_two_ints","type":"example_interfaces/srv/AddTwoInts","args":{"a":7,"b":13}}' \
  | jq '.values.sum'                                                # → 20
```

## Three Ways In

### 1. MCP (recommended for AI agents)

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

9 tools: `robots_list` · `robot_get_overview` · `robot_get_capabilities` · `ros2_list_topics` · `ros2_list_services` · `ros2_publish` · `ros2_call_service` · `ros2_subscribe_once` · `robot_camera_snapshot`

3 resources: `robot://health` · `robot://overview` · `robot://capabilities`

### 2. REST API (scripts, dashboards, non-MCP agents)

```
GET  /api/health            GET  /api/overview          GET  /api/topics
GET  /api/services          GET  /api/camera            GET  /api/demo/ps
GET  /api/demo/logs         POST /api/publish           POST /api/service
POST /api/subscribe-once    POST /api/lerobot/export-demo
```

### 3. Dashboard Web UI

Open `http://127.0.0.1:3210` — live runtime overview, camera feed, drive pad, ROS2 graph, Docker logs, LeRobot export. Industrial cyberpunk interface by Robot Flow Labs.

## Packages

| Package | Purpose |
|---------|---------|
| `@robotflowlabs/runtime-core` | Host-neutral runtime, rosbridge transport, discovery, safety |
| `@robotflowlabs/adapter-mcp` | MCP server — 9 tools, 3 resources, stdio transport |
| `@robotflowlabs/bridge-lerobot` | LeRobot episode creation, manifests, dataset export |
| `@robotflowlabs/dashboard-web` | Web UI + Express REST API server |

## Docker Demo

RoboROS ships its own Robot Flow Labs demo stack. No upstream dependency.

```bash
pnpm demo                     # start demo
pnpm demo:ps                  # container status
pnpm demo:logs                # tail logs
pnpm smoke:docker              # full end-to-end validation
pnpm demo:down                # stop
```

Demo exposes: `/robotflow/demo/heartbeat` · `/robotflow/demo/camera/image_raw/compressed` · `/robotflow/demo/cmd_vel_echo` · `/robotflow/demo/add_two_ints`

## Agent Integrations

| Agent | Interface | Skill |
|-------|-----------|-------|
| **Claude Code** | MCP server + `CLAUDE.md` | [`skills/claude-robotics/SKILL.md`](./skills/claude-robotics/SKILL.md) |
| **Cursor** | MCP server + `.cursor/rules/` | [`skills/cursor-robotics/SKILL.md`](./skills/cursor-robotics/SKILL.md) |
| **Codex** | MCP + `AGENTS.md` | [`skills/codex-robotics/SKILL.md`](./skills/codex-robotics/SKILL.md) |
| **Custom** | REST API + SDK | See `AGENTS.md` |

Universal operator skill: [`skills/roboros-operator/SKILL.md`](./skills/roboros-operator/SKILL.md)

## Repo Map

```
RoboROS/
├── packages/
│   ├── runtime-core/        # neutral runtime (no host-specific logic)
│   ├── adapter-mcp/         # MCP server adapter
│   ├── bridge-lerobot/      # LeRobot episode + dataset bridge
│   └── dashboard-web/       # web UI + REST API
├── docker/                  # compose.yml + demo Dockerfile
├── skills/                  # agent skill bundles
├── scripts/                 # doctor, demo, smoke-test
├── artifacts/lerobot/       # exported LeRobot episodes
├── CLAUDE.md                # Claude Code guide
├── AGENTS.md                # universal agent guide
└── ARCHITECTURE.md          # full architecture document
```

## Roadmap

| Phase | Status | Scope |
|-------|--------|-------|
| **1** | DONE | Rosbridge runtime, MCP adapter, discovery, camera, safe publish, dashboard web |
| **2** | NEXT | REST/WS adapters, safety engine, richer capability graph |
| **3** | PLANNED | LeRobot episode recording, replay, evaluation, dataset tooling |
| **4** | PLANNED | Zenoh, WebRTC, local DDS parity, vendor connectors |

## Build Philosophy

- Host-neutral contracts first
- Runtime safety outside prompts — never rely on LLM for speed limits, estop, or boundaries
- Thin adapters instead of host-locked business logic
- MCP-native integration, REST fallback
- LeRobot-compatible data path
- Robot Flow Labs branding and Apache-2.0 open source

---

<p align="center">
  <strong>ROBOT FLOW LABS // ROBOROS // APACHE-2.0</strong><br />
  <em>The code is open. The interface is durable. The platform is fun to operate and serious enough to trust.</em>
</p>
