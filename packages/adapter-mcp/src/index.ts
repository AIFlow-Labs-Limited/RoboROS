#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type {
  ImageContent,
  TextContent,
} from "@modelcontextprotocol/sdk/types.js";
import {
  loadConfigFromEnv,
  RoboRosRuntime,
  type PublishMessageRequest,
  type ServiceCallRequest,
} from "@robotflowlabs/runtime-core";
import { z } from "zod";

function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function toStructuredContent(value: unknown): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}

async function main(): Promise<void> {
  const config = loadConfigFromEnv();
  const runtime = new RoboRosRuntime(config);
  await runtime.connect();

  const server = new McpServer({
    name: "RoboROS",
    version: "0.1.0",
  });

  server.tool(
    "robots_list",
    "List robots exposed through the current RoboROS runtime.",
    {},
    async () => {
      const robot = runtime.getRobotSummary();
      return {
        content: [
          {
            type: "text",
            text: `Connected robot: ${robot.name} (${robot.id}) via ${robot.transportMode} at ${robot.endpoint}`,
          },
        ],
        structuredContent: toStructuredContent({
          robots: [robot],
        }),
      };
    },
  );

  server.tool(
    "robot_get_overview",
    "Return one agent-friendly snapshot of runtime health, capabilities, and service inventory.",
    {},
    async () => {
      const overview = await runtime.getOverview();
      return {
        content: [
          {
            type: "text",
            text: formatJson(overview),
          },
        ],
        structuredContent: toStructuredContent(overview),
      };
    },
  );

  server.tool(
    "robot_get_capabilities",
    "Inspect discovered ROS capabilities, topic inventory, and likely robot affordances.",
    {},
    async () => {
      const capabilities = await runtime.getCapabilities();
      return {
        content: [
          {
            type: "text",
            text: formatJson(capabilities),
          },
        ],
        structuredContent: toStructuredContent(capabilities),
      };
    },
  );

  server.tool(
    "ros2_list_topics",
    "List ROS2 topics reachable through RoboROS.",
    {},
    async () => {
      const topics = await runtime.listTopics();
      return {
        content: [
          {
            type: "text",
            text: formatJson({ count: topics.length, topics }),
          },
        ],
        structuredContent: toStructuredContent({
          count: topics.length,
          topics,
        }),
      };
    },
  );

  server.tool(
    "ros2_list_services",
    "List ROS2 services reachable through RoboROS.",
    {},
    async () => {
      const services = await runtime.listServices();
      return {
        content: [
          {
            type: "text",
            text: formatJson({ count: services.length, services }),
          },
        ],
        structuredContent: toStructuredContent({
          count: services.length,
          services,
        }),
      };
    },
  );

  server.tool(
    "ros2_publish",
    "Publish a ROS2 message through RoboROS with runtime safety checks.",
    {
      topic: z.string().min(1),
      type: z.string().min(1),
      message: z.record(z.string(), z.unknown()),
    },
    async (input) => {
      const request = input as PublishMessageRequest;
      const result = await runtime.publish(request);
      return {
        content: [
          {
            type: "text",
            text: `Published ${result.type} to ${result.topic}`,
          },
        ],
        structuredContent: toStructuredContent(result),
      };
    },
  );

  server.tool(
    "ros2_call_service",
    "Call a ROS2 service through RoboROS and return its response values.",
    {
      service: z.string().min(1),
      type: z.string().min(1).optional(),
      args: z.record(z.string(), z.unknown()).optional(),
    },
    async (input) => {
      const result = await runtime.callService(input as ServiceCallRequest);
      return {
        content: [
          {
            type: "text",
            text: formatJson(result),
          },
        ],
        structuredContent: toStructuredContent(result),
      };
    },
  );

  server.tool(
    "ros2_subscribe_once",
    "Read the next ROS2 message emitted on a topic.",
    {
      topic: z.string().min(1),
      type: z.string().optional(),
      timeoutMs: z.number().int().positive().max(60000).optional(),
    },
    async (input) => {
      const result = await runtime.subscribeOnce(input);
      return {
        content: [
          {
            type: "text",
            text: formatJson(result),
          },
        ],
        structuredContent: toStructuredContent(result),
      };
    },
  );

  server.tool(
    "robot_camera_snapshot",
    "Capture a single camera frame and return base64 image data when available.",
    {
      topic: z.string().optional(),
    },
    async ({ topic }) => {
      const snapshot = await runtime.cameraSnapshot(topic);
      const content: Array<TextContent | ImageContent> = [
        {
          type: "text",
          text: `Captured frame from ${snapshot.topic}`,
        },
      ];

      if (snapshot.data) {
        content.push({
          type: "image",
          data: snapshot.data,
          mimeType: snapshot.mimeType,
        });
      }

      return {
        content,
        structuredContent: toStructuredContent(snapshot),
      };
    },
  );

  server.registerResource(
    "robot-health",
    "robot://health",
    {
      description: "Runtime health and connection state.",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "robot://health",
          text: formatJson(runtime.getHealth()),
          mimeType: "application/json",
        },
      ],
    }),
  );

  server.registerResource(
    "robot-overview",
    "robot://overview",
    {
      description: "Agent-friendly overview of health, capabilities, and services.",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "robot://overview",
          text: formatJson(await runtime.getOverview()),
          mimeType: "application/json",
        },
      ],
    }),
  );

  server.registerResource(
    "robot-capabilities",
    "robot://capabilities",
    {
      description: "Latest capability snapshot for the connected robot.",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "robot://capabilities",
          text: formatJson(await runtime.getCapabilities()),
          mimeType: "application/json",
        },
      ],
    }),
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("[RoboROS MCP] fatal:", error);
  process.exitCode = 1;
});
