import { execFile } from "node:child_process";
import { Buffer } from "node:buffer";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import express from "express";
import {
  createEpisodeFrame,
  createEpisodeManifest,
  writeEpisodeBundle,
} from "@robotflowlabs/bridge-lerobot";
import {
  loadConfigFromEnv,
  RoboRosError,
  RoboRosRuntime,
  type PublishMessageRequest,
  type ServiceCallRequest,
  type SubscribeOnceRequest,
} from "@robotflowlabs/runtime-core";

const execFileAsync = promisify(execFile);
const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const publicDir = path.join(packageRoot, "public");
const repoRoot = path.resolve(packageRoot, "../..");
const composeFile = path.join(repoRoot, "docker", "compose.yml");
const artifactsRoot = path.join(repoRoot, "artifacts", "lerobot");

const config = loadConfigFromEnv();
const runtime = new RoboRosRuntime(config);

let connectPromise: Promise<void> | null = null;

async function ensureRuntimeConnected(): Promise<void> {
  if (runtime.isConnected()) {
    return;
  }

  if (!connectPromise) {
    connectPromise = runtime.connect().finally(() => {
      connectPromise = null;
    });
  }

  await connectPromise;
}

function createApp() {
  const app = express();
  app.use(express.json({ limit: "5mb" }));
  app.use(express.static(publicDir));

  app.get("/api/health", route(async (_request, response) => {
    await ensureRuntimeConnected();
    response.json(runtime.getHealth());
  }));

  app.get("/api/overview", route(async (_request, response) => {
    await ensureRuntimeConnected();
    response.json(await runtime.getOverview());
  }));

  app.get("/api/topics", route(async (_request, response) => {
    await ensureRuntimeConnected();
    response.json({
      topics: await runtime.listTopics(),
    });
  }));

  app.get("/api/services", route(async (_request, response) => {
    await ensureRuntimeConnected();
    response.json({
      services: await runtime.listServices(),
    });
  }));

  app.get("/api/camera", route(async (request, response) => {
    await ensureRuntimeConnected();
    response.json(await runtime.cameraSnapshot(asString(request.query["topic"])));
  }));

  app.post("/api/publish", route(async (request, response) => {
    await ensureRuntimeConnected();
    const payload = request.body as PublishMessageRequest;
    response.json(await runtime.publish(payload));
  }));

  app.post("/api/service", route(async (request, response) => {
    await ensureRuntimeConnected();
    const payload = request.body as ServiceCallRequest;
    response.json(await runtime.callService(payload));
  }));

  app.post("/api/subscribe-once", route(async (request, response) => {
    await ensureRuntimeConnected();
    const payload = request.body as SubscribeOnceRequest;
    response.json(await runtime.subscribeOnce(payload));
  }));

  app.get("/api/demo/ps", route(async (_request, response) => {
    response.json({
      text: await runDockerCommand(["compose", "-f", composeFile, "ps"]),
    });
  }));

  app.get("/api/demo/logs", route(async (request, response) => {
    const tail = asPositiveInteger(request.query["tail"], 120);
    const since = asString(request.query["since"]) ?? "5m";
    response.json({
      text: await runDockerCommand([
        "compose",
        "-f",
        composeFile,
        "logs",
        "--since",
        since,
        "--tail",
        String(tail),
        "demo-rosbridge",
      ]),
    });
  }));

  app.post("/api/lerobot/export-demo", route(async (_request, response) => {
    await ensureRuntimeConnected();

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const episodeId = `demo-${timestamp}`;
    const outputDir = path.join(artifactsRoot, episodeId);
    const camera = await runtime.cameraSnapshot();
    const heartbeat = await runtime.subscribeOnce({
      topic: "/robotflow/demo/heartbeat",
      type: "std_msgs/msg/String",
      timeoutMs: 4000,
    });

    const imageFile = `frames/frame-000000.${camera.format === "png" ? "png" : "jpg"}`;
    const manifest = createEpisodeManifest({
      datasetId: "robotflowlabs-demo",
      episodeId,
      task: "demo-inspection",
      robotId: config.robot.id,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      observations: [
        {
          key: "camera_front",
          modality: "image",
          shape: [],
          encoding: camera.mimeType,
        },
        {
          key: "heartbeat",
          modality: "state",
          shape: [1],
          encoding: "utf8",
        },
      ],
      actions: [
        {
          key: "cmd_vel",
          shape: [6],
          units: "m_s_rad_s",
        },
      ],
      metadata: {
        source: "roboros-dashboard",
        rosbridgeUrl: config.rosbridge.url,
      },
    });

    const frame = createEpisodeFrame({
      timestamp: new Date().toISOString(),
      observations: {
        camera_front: {
          file: imageFile,
          mimeType: camera.mimeType,
          topic: camera.topic,
        },
        heartbeat: heartbeat.message,
      },
      actions: {
        cmd_vel: {
          linear: { x: 0, y: 0, z: 0 },
          angular: { x: 0, y: 0, z: 0 },
        },
      },
      metadata: {
        exportedBy: "dashboard-web",
      },
    });

    const result = await writeEpisodeBundle({
      outputDir,
      manifest,
      frames: [frame],
      assets: [
        {
          relativePath: imageFile,
          content: Buffer.from(camera.data, "base64"),
        },
      ],
    });

    response.json(result);
  }));

  app.use(async (error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    const normalized = error instanceof Error ? error : new Error(String(error));
    response.status(500).json({
      error: normalized.message,
      code: normalized instanceof RoboRosError ? normalized.code : "INTERNAL_ERROR",
    });
  });

  return app;
}

async function runDockerCommand(args: string[]): Promise<string> {
  const result = await execFileAsync("docker", args, {
    cwd: repoRoot,
    maxBuffer: 1024 * 1024 * 4,
  });
  return result.stdout.trim();
}

function route(
  handler: (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => Promise<void>,
) {
  return (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    void handler(request, response, next).catch(next);
  };
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function asPositiveInteger(value: unknown, fallback: number): number {
  if (typeof value !== "string") return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return parsed;
}

async function main(): Promise<void> {
  const app = createApp();
  const port = Number(process.env["RFL_DASHBOARD_PORT"] ?? 3210);

  await ensureRuntimeConnected();

  app.listen(port, () => {
    console.log(`[RoboROS web] listening on http://127.0.0.1:${port}`);
  });
}

main().catch((error) => {
  console.error("[RoboROS web] fatal:", error);
  process.exitCode = 1;
});
