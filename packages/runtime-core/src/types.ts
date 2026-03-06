export type SupportedTransportMode = "rosbridge" | "local" | "webrtc" | "zenoh";

export interface TopicDescriptor {
  name: string;
  type: string;
}

export interface ServiceDescriptor {
  name: string;
  type: string;
}

export interface RobotCapabilityFlags {
  motion: boolean;
  navigation: boolean;
  cameras: boolean;
  depth: boolean;
  manipulation: boolean;
  battery: boolean;
}

export interface RobotCapabilities {
  robotId: string;
  robotName: string;
  namespace: string;
  transportMode: SupportedTransportMode;
  discoveredAt: string;
  topicCount: number;
  suggestedCameraTopic: string | null;
  flags: RobotCapabilityFlags;
  topics: TopicDescriptor[];
}

export interface PublishMessageRequest {
  topic: string;
  type: string;
  message: Record<string, unknown>;
}

export interface SubscribeOnceRequest {
  topic: string;
  type?: string;
  timeoutMs?: number;
}

export interface SubscribeOnceResult {
  topic: string;
  message: Record<string, unknown>;
}

export interface CameraSnapshot {
  topic: string;
  mimeType: string;
  format: string;
  data: string;
  width?: number;
  height?: number;
}

export interface RobotSummary {
  id: string;
  name: string;
  namespace: string;
  transportMode: SupportedTransportMode;
  endpoint: string;
  connected: boolean;
}

export interface RuntimeHealth {
  connected: boolean;
  transportMode: SupportedTransportMode;
  endpoint: string;
  robot: RobotSummary;
}

export interface ServiceCallRequest {
  service: string;
  type?: string;
  args?: Record<string, unknown>;
}

export interface ServiceCallResult {
  service: string;
  type?: string;
  values: Record<string, unknown>;
}

export interface RuntimeOverview {
  health: RuntimeHealth;
  capabilities: RobotCapabilities;
  services: ServiceDescriptor[];
}
