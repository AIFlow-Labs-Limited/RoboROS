import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
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

export const LeRobotFrameSchema = z.object({
  timestamp: z.string(),
  observations: z.record(z.string(), z.unknown()).default({}),
  actions: z.record(z.string(), z.unknown()).default({}),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export type LeRobotObservation = z.infer<typeof LeRobotObservationSchema>;
export type LeRobotAction = z.infer<typeof LeRobotActionSchema>;
export type LeRobotEpisode = z.infer<typeof LeRobotEpisodeSchema>;
export type LeRobotFrame = z.infer<typeof LeRobotFrameSchema>;

export function createEpisodeManifest(input: LeRobotEpisode): LeRobotEpisode {
  return LeRobotEpisodeSchema.parse(input);
}

export function createEpisodeFrame(input: LeRobotFrame): LeRobotFrame {
  return LeRobotFrameSchema.parse(input);
}

export async function writeEpisodeBundle(input: {
  outputDir: string;
  manifest: LeRobotEpisode;
  frames: LeRobotFrame[];
  assets?: Array<{ relativePath: string; content: Buffer | string }>;
}): Promise<{
  outputDir: string;
  manifestPath: string;
  framesPath: string;
  assetPaths: string[];
}> {
  const manifest = createEpisodeManifest(input.manifest);
  const frames = input.frames.map(createEpisodeFrame);
  const outputDir = path.resolve(input.outputDir);
  const manifestPath = path.join(outputDir, "episode.json");
  const framesPath = path.join(outputDir, "frames.jsonl");

  await mkdir(outputDir, { recursive: true });
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await writeFile(
    framesPath,
    `${frames.map((frame) => JSON.stringify(frame)).join("\n")}\n`,
    "utf8",
  );

  const assetPaths: string[] = [];
  for (const asset of input.assets ?? []) {
    const assetPath = path.join(outputDir, asset.relativePath);
    await mkdir(path.dirname(assetPath), { recursive: true });
    await writeFile(assetPath, asset.content);
    assetPaths.push(assetPath);
  }

  return {
    outputDir,
    manifestPath,
    framesPath,
    assetPaths,
  };
}
