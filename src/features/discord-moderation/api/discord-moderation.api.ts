/**
 * Discord Moderation API Functions
 *
 * 📍 src/features/discord-moderation/api/discord-moderation.api.ts
 *
 * All Discord Moderation API calls go through here.
 * NO direct fetch calls in components or hooks.
 * NO React dependencies — pure data layer.
 */

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  type LeaderboardOption,
  type ModeratorLeaderboardData,
  ModeratorLeaderboardResponseSchema,
  type PendingCounts,
  PendingCountsResponseSchema,
  type TaskListData,
  TaskListResponseSchema,
} from "../schemas";

// ─── Params ───────────────────────────────────────────────────────────────────

export interface TaskListParams {
  pageIndex: number;
  perPage: number;
  search?: string;
  sortBy?: string;
}

export interface LeaderboardParams {
  option: LeaderboardOption;
  pageIndex: number;
  perPage: number;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Fetch paginated karma activity task log.
 */
export async function fetchTaskList(
  params: TaskListParams,
): Promise<TaskListData> {
  const query = new URLSearchParams({
    perPage: String(params.perPage),
    pageIndex: String(params.pageIndex),
  });

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.sortBy?.trim()) {
    query.set("sortBy", params.sortBy.trim());
  }

  const response = await apiClient.get(
    `${endpoints.discordModeration.taskList}?${query.toString()}`,
    TaskListResponseSchema,
  );

  return response.response;
}

/**
 * Fetch pending peer / appraiser approval counts.
 * Accepts an optional ISO date string (YYYY-MM-DD) to filter by date.
 */
export async function fetchPendingCounts(
  date?: string,
): Promise<PendingCounts> {
  const query = new URLSearchParams();

  if (date) {
    query.set("date", date);
  }

  const url = query.toString()
    ? `${endpoints.discordModeration.pendingCounts}?${query.toString()}`
    : endpoints.discordModeration.pendingCounts;

  const response = await apiClient.get(url, PendingCountsResponseSchema);
  return response.response;
}

/**
 * Fetch moderator leaderboard (peer or appraiser), paginated.
 */
export async function fetchModeratorLeaderboard(
  params: LeaderboardParams,
): Promise<ModeratorLeaderboardData> {
  const query = new URLSearchParams({
    option: params.option,
    perPage: String(params.perPage),
    pageIndex: String(params.pageIndex),
  });

  const response = await apiClient.get(
    `${endpoints.discordModeration.leaderboard}?${query.toString()}`,
    ModeratorLeaderboardResponseSchema,
  );

  return response.response;
}
