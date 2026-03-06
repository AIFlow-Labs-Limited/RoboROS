import { z } from "zod";

const WsUrlSchema = z
  .string()
  .min(1)
  .refine((value) => /^wss?:\/\//i.test(value), "Expected a ws:// or wss:// URL.");

export const RoboRosConfigSchema = z.object({
  transport: z
    .object({
      mode: z.enum(["rosbridge", "local", "webrtc", "zenoh"]).default("rosbridge"),
    })
    .default({ mode: "rosbridge" }),
  rosbridge: z
    .object({
      url: WsUrlSchema.default("ws://127.0.0.1:9090"),
      reconnectIntervalMs: z.number().int().min(250).default(1500),
      requestTimeoutMs: z.number().int().min(500).default(5000),
    })
    .default({
      url: "ws://127.0.0.1:9090",
      reconnectIntervalMs: 1500,
      requestTimeoutMs: 5000,
    }),
  robot: z
    .object({
      id: z.string().default("local-robot"),
      name: z.string().default("Robot Flow Unit"),
      namespace: z.string().default(""),
      cameraTopic: z.string().default(""),
    })
    .default({
      id: "local-robot",
      name: "Robot Flow Unit",
      namespace: "",
      cameraTopic: "",
    }),
  safety: z
    .object({
      maxLinearVelocity: z.number().min(0).default(1),
      maxAngularVelocity: z.number().min(0).default(1.5),
    })
    .default({
      maxLinearVelocity: 1,
      maxAngularVelocity: 1.5,
    }),
  features: z
    .object({
      lerobot: z.boolean().default(true),
    })
    .default({ lerobot: true }),
});

export type RoboRosConfig = z.infer<typeof RoboRosConfigSchema>;

export function parseConfig(raw: unknown): RoboRosConfig {
  const normalized = typeof raw === "object" && raw !== null ? raw : {};
  return RoboRosConfigSchema.parse(normalized);
}

export function loadConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): RoboRosConfig {
  return parseConfig({
    transport: {
      mode: env["RFL_TRANSPORT_MODE"] ?? "rosbridge",
    },
    rosbridge: {
      url: env["RFL_ROSBRIDGE_URL"] ?? "ws://127.0.0.1:9090",
      reconnectIntervalMs: env["RFL_RECONNECT_INTERVAL_MS"]
        ? Number(env["RFL_RECONNECT_INTERVAL_MS"])
        : undefined,
      requestTimeoutMs: env["RFL_REQUEST_TIMEOUT_MS"]
        ? Number(env["RFL_REQUEST_TIMEOUT_MS"])
        : undefined,
    },
    robot: {
      id: env["RFL_ROBOT_ID"] ?? "local-robot",
      name: env["RFL_ROBOT_NAME"] ?? "Robot Flow Unit",
      namespace: env["RFL_ROBOT_NAMESPACE"] ?? "",
      cameraTopic: env["RFL_CAMERA_TOPIC"] ?? "",
    },
    safety: {
      maxLinearVelocity: env["RFL_MAX_LINEAR_VELOCITY"]
        ? Number(env["RFL_MAX_LINEAR_VELOCITY"])
        : undefined,
      maxAngularVelocity: env["RFL_MAX_ANGULAR_VELOCITY"]
        ? Number(env["RFL_MAX_ANGULAR_VELOCITY"])
        : undefined,
    },
    features: {
      lerobot: env["RFL_FEATURE_LEROBOT"]
        ? env["RFL_FEATURE_LEROBOT"] !== "false"
        : true,
    },
  });
}
