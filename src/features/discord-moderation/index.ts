/**
 * Discord Moderation Feature
 *
 * 📍 src/features/discord-moderation/index.ts
 *
 * Public API for the discord-moderation feature.
 * Import from here, not from internal files.
 */

// API functions
export {
  fetchModeratorLeaderboard,
  fetchPendingCounts,
  fetchTaskList,
} from "./api";

export type { LeaderboardParams, TaskListParams } from "./api";

// Components (primary entry point)
export {
  DiscordModerationPage,
  ModeratorLeaderboard,
  PendingCountsCard,
  TaskListTable,
} from "./components";

// Hooks
export {
  discordModerationKeys,
  getModeratorBoardQueryOptions,
  getPendingCountsQueryOptions,
  getTaskListQueryOptions,
  useModeratorBoard,
  usePendingCounts,
  useTaskList,
} from "./hooks";

// Schemas and types
export {
  ApiResponseSchema,
  ModeratorLeaderboardDataSchema,
  ModeratorLeaderboardItemSchema,
  ModeratorLeaderboardResponseSchema,
  PaginationSchema,
  PendingCountsResponseSchema,
  PendingCountsSchema,
  TaskListDataSchema,
  TaskListResponseSchema,
  TaskLogSchema,
} from "./schemas";

export type {
  LeaderboardOption,
  ModeratorLeaderboardData,
  ModeratorLeaderboardItem,
  PendingCounts,
  TaskListData,
  TaskLog,
  TaskStatus,
} from "./schemas";
