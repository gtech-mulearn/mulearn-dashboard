/**
 * Discord Moderation Schemas
 *
 * 📍 src/features/discord-moderation/schemas/index.ts
 *
 * Zod schemas for all Discord Moderation API responses.
 */

import { z } from "zod";

// ─── Shared ──────────────────────────────────────────────────────────────────

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.record(z.string(), z.array(z.string())).optional(),
    response: dataSchema,
  });

export const PaginationSchema = z.object({
  page: z.number().optional(),
  perPage: z.number().optional(),
  total: z.number().optional(),
  count: z.number().optional(),
  totalPages: z.number().optional(),
});

// ─── Task List ────────────────────────────────────────────────────────────────

export const TaskLogSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string(),
  task_name: z.string(),
  status: z.enum([
    "Pending",
    "Peer Approved",
    "Appraiser Approved",
    "Karma Awarded",
  ]),
  discordlink: z.string().nullable(),
});

export const TaskListDataSchema = z.object({
  data: z.array(TaskLogSchema),
  pagination: PaginationSchema,
});

export const TaskListResponseSchema = ApiResponseSchema(TaskListDataSchema);

export type TaskLog = z.infer<typeof TaskLogSchema>;
export type TaskListData = z.infer<typeof TaskListDataSchema>;
export type TaskStatus = TaskLog["status"];

// ─── Pending Counts ───────────────────────────────────────────────────────────

export const PendingCountsSchema = z.object({
  peer_pending: z.number(),
  appraise_pending: z.number(),
});

export const PendingCountsResponseSchema = z.object({
  hasError: z.boolean(),
  statusCode: z.number(),
  message: z.record(z.string(), z.array(z.string())).optional(),
  response: PendingCountsSchema,
});

export type PendingCounts = z.infer<typeof PendingCountsSchema>;

// ─── Moderator Leaderboard ───────────────────────────────────────────────────

export const ModeratorLeaderboardItemSchema = z.object({
  name: z.string(),
  count: z.number(),
  muid: z.string(),
});

export const ModeratorLeaderboardDataSchema = z.object({
  data: z.array(ModeratorLeaderboardItemSchema),
  pagination: PaginationSchema,
});

export const ModeratorLeaderboardResponseSchema = ApiResponseSchema(
  ModeratorLeaderboardDataSchema,
);

export type ModeratorLeaderboardItem = z.infer<
  typeof ModeratorLeaderboardItemSchema
>;
export type ModeratorLeaderboardData = z.infer<
  typeof ModeratorLeaderboardDataSchema
>;
export type LeaderboardOption = "peer" | "appraiser";
