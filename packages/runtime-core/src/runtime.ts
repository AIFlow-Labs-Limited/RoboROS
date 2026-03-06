import { deriveCapabilities } from "./capabilities.js";
import type { RoboRosConfig } from "./config.js";
import {
  RoboRosError,
  SafetyViolationError,
  TransportNotConnectedError,
  UnsupportedTransportError,
} from "./errors.js";
import { RosbridgeClient } from "./transport/rosbridge-client.js";
import type {
  CameraSnapshot,
  PublishMessageRequest,
  RobotCapabilities,
  RobotSummary,
  RuntimeHealth,
  RuntimeOverview,
  ServiceCallRequest,
  ServiceCallResult,
  ServiceDescriptor,
  SubscribeOnceRequest,
  SubscribeOnceResult,
  TopicDescriptor,
} from "./types.js";

const COMPRESSED_IMAGE_TYPE = "sensor_msgs/msg/CompressedImage";
const RAW_IMAGE_TYPE = "sensor_msgs/msg/Image";

function normalizeTopic(topic: string): string {
  const trimmed = topic.trim();
  if (trimmed.startsWith("/")) return trimmed;
  return `/${trimmed}`;
}

function normalizeNamespace(namespace: string): string {
  return namespace.trim().replace(/^\/+|\/+$/g, "");
}

function applyNamespace(config: RoboRosConfig, topicOrService: string): string {
  const trimmed = topicOrService.trim();
  if (trimmed.startsWith("/")) {
    return normalizeTopic(trimmed);
  }

  const normalizedTopic = normalizeTopic(trimmed);
  const namespace = normalizeNamespace(config.robot.namespace);
  if (!namespace) return normalizedTopic;

  if (normalizedTopic === `/${namespace}` || normalizedTopic.startsWith(`/${namespace}/`)) {
    return normalizedTopic;
  }

  return `/${namespace}${normalizedTopic}`;
}

function asNumber(record: Record<string, unknown> | undefined, key: string): number {
  const value = record?.[key];
  return typeof value === "number" ? value : 0;
}

function validateTwistMessage(
  config: RoboRosConfig,
  request: PublishMessageRequest,
): void {
  const isTwistType = /geometry_msgs\/msg\/Twist$/i.test(request.type);
  const isVelocityTopic = /cmd_vel/i.test(request.topic);
  if (!isTwistType && !isVelocityTopic) {
    return;
  }

  const linear = request.message["linear"];
  const angular = request.message["angular"];
  const linearRecord =
    linear && typeof linear === "object" ? (linear as Record<string, unknown>) : undefined;
  const angularRecord =
    angular && typeof angular === "object"
      ? (angular as Record<string, unknown>)
      : undefined;

  const linearMagnitude = Math.sqrt(
    asNumber(linearRecord, "x") ** 2 +
      asNumber(linearRecord, "y") ** 2 +
      asNumber(linearRecord, "z") ** 2,
  );

  if (linearMagnitude > config.safety.maxLinearVelocity) {
    throw new SafetyViolationError(
      `Linear velocity ${linearMagnitude.toFixed(3)} m/s exceeds maxLinearVelocity ${config.safety.maxLinearVelocity}.`,
    );
  }

  const angularZ = Math.abs(asNumber(angularRecord, "z"));
  if (angularZ > config.safety.maxAngularVelocity) {
    throw new SafetyViolationError(
      `Angular velocity ${angularZ.toFixed(3)} rad/s exceeds maxAngularVelocity ${config.safety.maxAngularVelocity}.`,
    );
  }
}

function guessTopicType(topic: string, requestedType?: string): string | undefined {
  if (requestedType) return requestedType;
  if (/compressed/i.test(topic)) return COMPRESSED_IMAGE_TYPE;
  if (/(camera|image|depth|color)/i.test(topic)) return RAW_IMAGE_TYPE;
  return undefined;
}

function byteArrayToBase64(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Uint8Array) return Buffer.from(value).toString("base64");
  if (Array.isArray(value)) return Buffer.from(value).toString("base64");
  return "";
}

export class RoboRosRuntime {
  private readonly rosbridgeClient: RosbridgeClient;

  constructor(readonly config: RoboRosConfig) {
    if (config.transport.mode !== "rosbridge") {
      throw new UnsupportedTransportError(config.transport.mode);
    }

    this.rosbridgeClient = new RosbridgeClient({
      url: config.rosbridge.url,
      requestTimeoutMs: config.rosbridge.requestTimeoutMs,
    });
  }

  async connect(): Promise<void> {
    await this.rosbridgeClient.connect();
  }

  async disconnect(): Promise<void> {
    await this.rosbridgeClient.disconnect();
  }

  isConnected(): boolean {
    return this.rosbridgeClient.getStatus() === "connected";
  }

  getRobotSummary(): RobotSummary {
    return {
      id: this.config.robot.id,
      name: this.config.robot.name,
      namespace: this.config.robot.namespace,
      transportMode: this.config.transport.mode,
      endpoint: this.config.rosbridge.url,
      connected: this.isConnected(),
    };
  }

  getHealth(): RuntimeHealth {
    return {
      connected: this.isConnected(),
      transportMode: this.config.transport.mode,
      endpoint: this.config.rosbridge.url,
      robot: this.getRobotSummary(),
    };
  }

  async listTopics(): Promise<TopicDescriptor[]> {
    this.ensureConnected();
    const topics = await this.rosbridgeClient.listTopics();
    return topics.sort((left, right) => left.name.localeCompare(right.name));
  }

  async getCapabilities(): Promise<RobotCapabilities> {
    const topics = await this.listTopics();
    return deriveCapabilities(this.config, topics);
  }

  async listServices(): Promise<ServiceDescriptor[]> {
    this.ensureConnected();
    const services = await this.rosbridgeClient.listServices();
    return services.sort((left, right) => left.name.localeCompare(right.name));
  }

  async getOverview(): Promise<RuntimeOverview> {
    const [topics, services] = await Promise.all([this.listTopics(), this.listServices()]);

    return {
      health: this.getHealth(),
      capabilities: deriveCapabilities(this.config, topics),
      services,
    };
  }

  async publish(request: PublishMessageRequest): Promise<{ topic: string; type: string }> {
    this.ensureConnected();
    validateTwistMessage(this.config, request);

    const topic = applyNamespace(this.config, request.topic);
    await this.rosbridgeClient.publish({
      topic,
      type: request.type,
      message: request.message,
    });

    return { topic, type: request.type };
  }

  async callService(request: ServiceCallRequest): Promise<ServiceCallResult> {
    this.ensureConnected();

    const service = applyNamespace(this.config, request.service);
    const values = await this.rosbridgeClient.callService(
      service,
      request.args,
      request.type,
    );

    return {
      service,
      type: request.type,
      values,
    };
  }

  async subscribeOnce(request: SubscribeOnceRequest): Promise<SubscribeOnceResult> {
    this.ensureConnected();

    const topic = applyNamespace(this.config, request.topic);
    const message = await this.rosbridgeClient.subscribeOnce({
      topic,
      type: guessTopicType(topic, request.type),
      timeoutMs: request.timeoutMs ?? this.config.rosbridge.requestTimeoutMs,
    });

    return { topic, message };
  }

  async cameraSnapshot(topicOverride?: string): Promise<CameraSnapshot> {
    const topics = await this.listTopics();
    const selectedTopic = this.resolveCameraTopic(topicOverride, topics);

    if (!selectedTopic) {
      throw new RoboRosError(
        "No camera topic could be discovered. Set RFL_CAMERA_TOPIC or pass a topic explicitly.",
        "CAMERA_TOPIC_NOT_FOUND",
      );
    }

    const selectedType = topics.find((topic) => topic.name === selectedTopic)?.type;
    const snapshot = await this.subscribeOnce({
      topic: selectedTopic,
      type: selectedType || COMPRESSED_IMAGE_TYPE,
      timeoutMs: this.config.rosbridge.requestTimeoutMs,
    });

    const format = typeof snapshot.message["format"] === "string" ? snapshot.message["format"] : "jpeg";
    const mimeType =
      format === "png"
        ? "image/png"
        : format === "webp"
          ? "image/webp"
          : "image/jpeg";

    return {
      topic: snapshot.topic,
      mimeType,
      format,
      data: byteArrayToBase64(snapshot.message["data"]),
      width:
        typeof snapshot.message["width"] === "number"
          ? snapshot.message["width"]
          : undefined,
      height:
        typeof snapshot.message["height"] === "number"
          ? snapshot.message["height"]
          : undefined,
    };
  }

  private resolveCameraTopic(
    topicOverride: string | undefined,
    topics: TopicDescriptor[],
  ): string | null {
    const explicitTopic =
      topicOverride?.trim() || this.config.robot.cameraTopic.trim();
    if (explicitTopic) {
      return applyNamespace(this.config, explicitTopic);
    }

    const preferred = topics.find(
      (topic) =>
        topic.type === COMPRESSED_IMAGE_TYPE &&
        /(camera|image|color)/i.test(topic.name),
    );
    if (preferred) return preferred.name;

    const fallback = topics.find((topic) => /(camera|image|color)/i.test(topic.name));
    return fallback?.name ?? null;
  }

  private ensureConnected(): void {
    if (!this.isConnected()) {
      throw new TransportNotConnectedError();
    }
  }
}
