import WebSocket from "ws";
import type { ServiceDescriptor, TopicDescriptor } from "../types.js";
import { RoboRosError } from "../errors.js";

type ConnectionStatus = "disconnected" | "connecting" | "connected";

interface RosbridgeClientOptions {
  url: string;
  requestTimeoutMs: number;
}

interface PendingRequest {
  resolve: (value: Record<string, unknown>) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

type TopicHandler = (message: Record<string, unknown>) => void;

export class RosbridgeClient {
  private socket: WebSocket | null = null;
  private status: ConnectionStatus = "disconnected";
  private readonly pending = new Map<string, PendingRequest>();
  private readonly topicHandlers = new Map<string, Set<TopicHandler>>();
  private readonly advertisedTopics = new Set<string>();
  private requestSequence = 0;

  constructor(private readonly options: RosbridgeClientOptions) {}

  getStatus(): ConnectionStatus {
    return this.status;
  }

  async connect(): Promise<void> {
    if (this.status === "connected") {
      return;
    }

    this.status = "connecting";

    await new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(this.options.url);
      const timeout = setTimeout(() => {
        socket.terminate();
        reject(new RoboRosError(`Timed out connecting to ${this.options.url}`, "CONNECT_TIMEOUT"));
      }, 10_000);

      const fail = (error: Error) => {
        clearTimeout(timeout);
        this.socket = null;
        this.status = "disconnected";
        reject(error);
      };

      socket.once("open", () => {
        clearTimeout(timeout);
        this.socket = socket;
        this.status = "connected";
        resolve();
      });

      socket.once("error", (error) => {
        if (this.status !== "connected") {
          fail(
            error instanceof Error
              ? error
              : new RoboRosError(`Failed connecting to ${this.options.url}`),
          );
        }
      });

      socket.on("close", () => {
        this.socket = null;
        this.status = "disconnected";
        this.rejectAllPending(new RoboRosError("Rosbridge connection closed.", "CONNECTION_CLOSED"));
      });

      socket.on("message", (raw) => {
        const payload = typeof raw === "string" ? raw : raw.toString();
        this.handleIncoming(payload);
      });
    });
  }

  async disconnect(): Promise<void> {
    this.rejectAllPending(
      new RoboRosError("Rosbridge client disconnected.", "CLIENT_DISCONNECTED"),
    );
    this.advertisedTopics.clear();

    if (!this.socket) {
      this.status = "disconnected";
      return;
    }

    const socket = this.socket;
    this.socket = null;
    this.status = "disconnected";

    await new Promise<void>((resolve) => {
      socket.once("close", () => resolve());
      socket.close();
      setTimeout(resolve, 1000);
    });
  }

  async listTopics(): Promise<TopicDescriptor[]> {
    const response = await this.callService("/rosapi/topics", {});
    const topicNames = this.asStringArray(response["topics"]);
    const inlineTypes = this.asStringArray(response["types"]);

    if (inlineTypes.length === topicNames.length && topicNames.length > 0) {
      return topicNames.map((name, index) => ({
        name,
        type: inlineTypes[index] ?? "",
      }));
    }

    const typedTopics = await Promise.all(
      topicNames.map(async (name) => ({
        name,
        type: await this.getTopicType(name),
      })),
    );

    return typedTopics;
  }

  async listServices(): Promise<ServiceDescriptor[]> {
    const response = await this.callService("/rosapi/services", {});
    const serviceNames = this.asStringArray(response["services"]);
    const inlineTypes = this.asStringArray(response["types"]);

    if (inlineTypes.length === serviceNames.length && serviceNames.length > 0) {
      return serviceNames.map((name, index) => ({
        name,
        type: inlineTypes[index] ?? "",
      }));
    }

    return serviceNames.map((name) => ({
      name,
      type: "",
    }));
  }

  async getTopicType(topic: string): Promise<string> {
    try {
      const response = await this.callService("/rosapi/topic_type", { topic });
      const type = response["type"];
      if (typeof type === "string") {
        return type;
      }
    } catch {
      return "";
    }

    return "";
  }

  async getServiceType(service: string): Promise<string> {
    try {
      const response = await this.callService("/rosapi/service_type", { service });
      const type = response["type"];
      if (typeof type === "string") {
        return type;
      }
    } catch {
      return "";
    }

    return "";
  }

  async publish(options: {
    topic: string;
    type: string;
    message: Record<string, unknown>;
  }): Promise<void> {
    this.ensureConnected();

    const advertiseKey = `${options.topic}:${options.type}`;
    if (!this.advertisedTopics.has(advertiseKey)) {
      this.send({
        op: "advertise",
        topic: options.topic,
        type: options.type,
      });
      this.advertisedTopics.add(advertiseKey);
    }

    this.send({
      op: "publish",
      topic: options.topic,
      type: options.type,
      msg: options.message,
    });
  }

  async subscribeOnce(options: {
    topic: string;
    type?: string;
    timeoutMs?: number;
  }): Promise<Record<string, unknown>> {
    this.ensureConnected();

    return new Promise<Record<string, unknown>>((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(
          new RoboRosError(
            `Timed out waiting for message on ${options.topic}.`,
            "SUBSCRIBE_TIMEOUT",
          ),
        );
      }, options.timeoutMs ?? this.options.requestTimeoutMs);

      const cleanup = this.onTopic(options.topic, (message) => {
        clearTimeout(timeout);
        cleanup();
        resolve(message);
      });

      this.send({
        op: "subscribe",
        id: this.nextId("subscribe"),
        topic: options.topic,
        type: options.type,
      });
    });
  }

  async callService(
    service: string,
    args?: Record<string, unknown>,
    type?: string,
  ): Promise<Record<string, unknown>> {
    this.ensureConnected();

    const id = this.nextId("service");

    const responsePromise = new Promise<Record<string, unknown>>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(
          new RoboRosError(
            `Service call timed out for ${service}.`,
            "SERVICE_TIMEOUT",
          ),
        );
      }, this.options.requestTimeoutMs);

      this.pending.set(id, { resolve, reject, timer });
    });

    this.send({
      op: "call_service",
      id,
      service,
      args,
      type,
    });

    return responsePromise;
  }

  private nextId(prefix: string): string {
    this.requestSequence += 1;
    return `roboros_${prefix}_${this.requestSequence}`;
  }

  private onTopic(topic: string, handler: TopicHandler): () => void {
    const handlers = this.topicHandlers.get(topic) ?? new Set<TopicHandler>();
    handlers.add(handler);
    this.topicHandlers.set(topic, handlers);

    return () => {
      const current = this.topicHandlers.get(topic);
      if (!current) return;
      current.delete(handler);
      if (current.size === 0) {
        this.topicHandlers.delete(topic);
      }
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.send({
          op: "unsubscribe",
          id: this.nextId("unsubscribe"),
          topic,
        });
      }
    };
  }

  private ensureConnected(): void {
    if (!this.socket || this.status !== "connected") {
      throw new RoboRosError("Rosbridge client is not connected.", "NOT_CONNECTED");
    }
  }

  private send(payload: Record<string, unknown>): void {
    this.ensureConnected();
    this.socket!.send(JSON.stringify(payload));
  }

  private handleIncoming(raw: string): void {
    let message: Record<string, unknown>;
    try {
      message = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return;
    }

    const op = message["op"];
    if (op === "publish") {
      const topic = message["topic"];
      const payload = message["msg"];
      if (typeof topic === "string" && payload && typeof payload === "object") {
        const handlers = this.topicHandlers.get(topic);
        if (handlers) {
          for (const handler of handlers) {
            handler(payload as Record<string, unknown>);
          }
        }
      }
      return;
    }

    if (op === "service_response") {
      const id = message["id"];
      if (typeof id === "string") {
        const pending = this.pending.get(id);
        if (!pending) return;

        clearTimeout(pending.timer);
        this.pending.delete(id);

        const values =
          message["values"] && typeof message["values"] === "object"
            ? (message["values"] as Record<string, unknown>)
            : {};

        const result = message["result"];
        if (result === false) {
          pending.reject(
            new RoboRosError(
              `Service call failed for ${(message["service"] as string) ?? "unknown service"}.`,
              "SERVICE_FAILED",
            ),
          );
          return;
        }

        pending.resolve(values);
      }
    }
  }

  private rejectAllPending(error: Error): void {
    for (const [id, pending] of this.pending.entries()) {
      clearTimeout(pending.timer);
      pending.reject(error);
      this.pending.delete(id);
    }
  }

  private asStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((entry): entry is string => typeof entry === "string");
  }
}
