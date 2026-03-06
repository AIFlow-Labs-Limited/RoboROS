import { z } from "zod";

export const LeRobotObservationSchema = z.object({
  key: z.string(),
  modality: z.enum(["image", "state", "depth", "force", "audio", "custom"]),
  shape: z.array(z.number().int().nonnegative()).default([]),
  encoding: z.string().default("raw"),
});

export const LeRobotActionSchema = z.object({
  key: z.string(),
  shape: z.array(z.number().int().nonnegative()).default([]),
  units: z.string().default("unknown"),
});

export const LeRobotEpisodeSchema = z.object({
  datasetId: z.string(),
  episodeId: z.string(),
  task: z.string(),
  robotId: z.string(),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  observations: z.array(LeRobotObservationSchema).default([]),
  actions: z.array(LeRobotActionSchema).default([]),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export type LeRobotObservation = z.infer<typeof LeRobotObservationSchema>;
export type LeRobotAction = z.infer<typeof LeRobotActionSchema>;
export type LeRobotEpisode = z.infer<typeof LeRobotEpisodeSchema>;

export function createEpisodeManifest(input: LeRobotEpisode): LeRobotEpisode {
  return LeRobotEpisodeSchema.parse(input);
}

