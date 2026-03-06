import type { RoboRosConfig } from "./config.js";
import type {
  RobotCapabilities,
  RobotCapabilityFlags,
  TopicDescriptor,
} from "./types.js";

const CAMERA_TYPE_MARKERS = new Set([
  "sensor_msgs/msg/CompressedImage",
  "sensor_msgs/msg/Image",
]);

function looksLikeCameraTopic(topic: TopicDescriptor): boolean {
  return (
    CAMERA_TYPE_MARKERS.has(topic.type) ||
    /(camera|image|color)/i.test(topic.name)
  );
}

function looksLikeDepthTopic(topic: TopicDescriptor): boolean {
  return /depth/i.test(topic.name);
}

function pickSuggestedCameraTopic(
  topics: TopicDescriptor[],
  configuredTopic: string,
): string | null {
  if (configuredTopic.trim().length > 0) {
    return configuredTopic;
  }

  const preferred = topics.find(
    (topic) =>
      topic.type === "sensor_msgs/msg/CompressedImage" &&
      /(color|image_raw|camera)/i.test(topic.name),
  );
  if (preferred) return preferred.name;

  const fallback = topics.find(looksLikeCameraTopic);
  return fallback?.name ?? null;
}

function deriveFlags(topics: TopicDescriptor[]): RobotCapabilityFlags {
  const topicNames = topics.map((topic) => topic.name);

  return {
    motion: topicNames.some((name) => /cmd_vel|twist|joint_trajectory/i.test(name)),
    navigation: topicNames.some((name) => /nav|map|odom|goal/i.test(name)),
    cameras: topics.some(looksLikeCameraTopic),
    depth: topics.some(looksLikeDepthTopic),
    manipulation: topicNames.some((name) => /gripper|arm|joint|eef/i.test(name)),
    battery: topicNames.some((name) => /battery/i.test(name)),
  };
}

export function deriveCapabilities(
  config: RoboRosConfig,
  topics: TopicDescriptor[],
): RobotCapabilities {
  return {
    robotId: config.robot.id,
    robotName: config.robot.name,
    namespace: config.robot.namespace,
    transportMode: config.transport.mode,
    discoveredAt: new Date().toISOString(),
    topicCount: topics.length,
    suggestedCameraTopic: pickSuggestedCameraTopic(topics, config.robot.cameraTopic),
    flags: deriveFlags(topics),
    topics,
  };
}

