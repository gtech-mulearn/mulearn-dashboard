/**
 * Discord Moderation Query Keys
 *
 * 📍 src/features/discord-moderation/hooks/query-keys.ts
 */

import type { LeaderboardParams, TaskListParams } from "../api";

export const discordModerationKeys = {
  all: ["discord-moderation"] as const,

  // Task list
  taskLists: () => [...discordModerationKeys.all, "task-list"] as const,
  taskList: (params: TaskListParams) =>
    [
      ...discordModerationKeys.taskLists(),
      params.pageIndex,
      params.perPage,
      params.sortBy ?? "",
    ] as const,

  // Pending counts
  pendingCounts: (date?: string) =>
    [...discordModerationKeys.all, "pending-counts", date ?? "all"] as const,

  // Leaderboard
  leaderboards: () => [...discordModerationKeys.all, "leaderboard"] as const,
  leaderboard: (params: LeaderboardParams) =>
    [
      ...discordModerationKeys.leaderboards(),
      params.option,
      params.pageIndex,
      params.perPage,
    ] as const,
} as const;
