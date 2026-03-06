#!/usr/bin/env node

import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function getStructuredContent(response) {
  return response?.result?.structuredContent;
}

function listNames(items) {
  return Array.isArray(items) ? items.map((item) => item?.name) : [];
}

async function main() {
  const server = spawn("node", ["packages/adapter-mcp/dist/index.js"], {
    cwd: rootDir,
    env: {
      ...process.env,
      RFL_ROBOT_ID: process.env.RFL_ROBOT_ID ?? "docker-demo",
      RFL_ROBOT_NAME: process.env.RFL_ROBOT_NAME ?? "Robot Flow Labs Demo",
      RFL_ROSBRIDGE_URL: process.env.RFL_ROSBRIDGE_URL ?? "ws://127.0.0.1:9090",
      RFL_CAMERA_TOPIC:
        process.env.RFL_CAMERA_TOPIC ??
        "/robotflow/demo/camera/image_raw/compressed",
    },
    stdio: ["pipe", "pipe", "pipe"],
  });

  const reader = createInterface({ input: server.stdout });
  const pending = new Map();
  let nextId = 0;
  let closed = false;

  const failPending = (error) => {
    for (const { reject } of pending.values()) {
      reject(error);
    }
    pending.clear();
  };

  server.stderr.on("data", (chunk) => {
    process.stderr.write(chunk);
  });

  server.on("exit", (code, signal) => {
    closed = true;
    failPending(
      new Error(
        `RoboROS MCP server exited before smoke test completed (code=${code}, signal=${signal ?? "none"}).`,
      ),
    );
  });

  reader.on("line", (line) => {
    if (!line.trim()) {
      return;
    }

    let payload;
    try {
      payload = JSON.parse(line);
    } catch (error) {
      failPending(new Error(`Failed parsing MCP response: ${String(error)}`));
      return;
    }

    if (payload.id === undefined) {
      return;
    }

    const resolver = pending.get(payload.id);
    if (!resolver) {
      return;
    }

    pending.delete(payload.id);
    if (payload.error) {
      resolver.reject(
        new Error(
          payload.error.message ?? `MCP request ${payload.id} returned an unknown error.`,
        ),
      );
      return;
    }

    resolver.resolve(payload);
  });

  const request = (method, params = {}) => {
    if (closed) {
      return Promise.reject(new Error("MCP server is already closed."));
    }

    const id = ++nextId;
    const message = {
      jsonrpc: "2.0",
      id,
      method,
      params,
    };

    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      server.stdin.write(`${JSON.stringify(message)}\n`);
    });
  };

  const notify = (method, params = {}) => {
    if (closed) {
      return;
    }

    const message = {
      jsonrpc: "2.0",
      method,
      params,
    };

    server.stdin.write(`${JSON.stringify(message)}\n`);
  };

  const shutdown = async () => {
    if (!closed) {
      server.kill("SIGTERM");
    }
    reader.close();
  };

  try {
    await request("initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: {
        name: "roboros-smoke",
        version: "0.1.0",
      },
    });
    notify("notifications/initialized");

    const tools = await request("tools/list");
    const toolNames = listNames(tools?.result?.tools);
    assert(toolNames.includes("robot_get_overview"), "Missing tool robot_get_overview.");
    assert(toolNames.includes("ros2_list_services"), "Missing tool ros2_list_services.");
    assert(toolNames.includes("ros2_call_service"), "Missing tool ros2_call_service.");

    const overview = await request("tools/call", {
      name: "robot_get_overview",
      arguments: {},
    });
    const overviewData = getStructuredContent(overview);
    assert(overviewData?.health?.connected === true, "Runtime should report as connected.");

    const topicsResponse = await request("tools/call", {
      name: "ros2_list_topics",
      arguments: {},
    });
    const topicsData = getStructuredContent(topicsResponse);
    const topicNames = listNames(topicsData?.topics);
    assert(topicNames.includes("/robotflow/demo/heartbeat"), "Heartbeat topic not discovered.");
    assert(
      topicNames.includes("/robotflow/demo/camera/image_raw/compressed"),
      "Camera topic not discovered.",
    );
    assert(topicNames.includes("/robotflow/demo/cmd_vel_echo"), "cmd_vel echo topic not discovered.");

    const servicesResponse = await request("tools/call", {
      name: "ros2_list_services",
      arguments: {},
    });
    const servicesData = getStructuredContent(servicesResponse);
    const serviceNames = listNames(servicesData?.services);
    assert(
      serviceNames.includes("/robotflow/demo/add_two_ints"),
      "Demo add_two_ints service not discovered.",
    );

    const cameraResponse = await request("tools/call", {
      name: "robot_camera_snapshot",
      arguments: {
        topic: "/robotflow/demo/camera/image_raw/compressed",
      },
    });
    const cameraData = getStructuredContent(cameraResponse);
    assert(cameraData?.data?.length > 0, "Camera snapshot did not return image data.");
    assert(cameraData?.mimeType === "image/png", "Camera snapshot should resolve to image/png.");

    await request("tools/call", {
      name: "ros2_publish",
      arguments: {
        topic: "/cmd_vel",
        type: "geometry_msgs/msg/Twist",
        message: {
          linear: { x: 0.2, y: 0.0, z: 0.0 },
          angular: { x: 0.0, y: 0.0, z: 0.1 },
        },
      },
    });

    const echoResponse = await request("tools/call", {
      name: "ros2_subscribe_once",
      arguments: {
        topic: "/robotflow/demo/cmd_vel_echo",
        type: "geometry_msgs/msg/Twist",
        timeoutMs: 4000,
      },
    });
    const echoData = getStructuredContent(echoResponse);
    assert(
      Number(echoData?.message?.linear?.x) === 0.2,
      "cmd_vel echo did not contain the published linear velocity.",
    );
    assert(
      Number(echoData?.message?.angular?.z) === 0.1,
      "cmd_vel echo did not contain the published angular velocity.",
    );

    const serviceCallResponse = await request("tools/call", {
      name: "ros2_call_service",
      arguments: {
        service: "/robotflow/demo/add_two_ints",
        type: "example_interfaces/srv/AddTwoInts",
        args: {
          a: 4,
          b: 3,
        },
      },
    });
    const serviceCallData = getStructuredContent(serviceCallResponse);
    assert(
      Number(serviceCallData?.values?.sum) === 7,
      "Service call result should contain sum=7.",
    );

    process.stdout.write(
      "RoboROS smoke test passed: Docker demo, MCP server, topics, camera, publish, and service call are all working.\n",
    );
  } finally {
    await shutdown();
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error}\n`);
  process.exitCode = 1;
});
