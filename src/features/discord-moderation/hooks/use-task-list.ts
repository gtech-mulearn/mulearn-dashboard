/**
 * useTaskList Hook
 *
 * 📍 src/features/discord-moderation/hooks/use-task-list.ts
 *
 * TanStack Query wrapper for the karma activity task log.
 */

"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchTaskList, type TaskListParams } from "../api";
import { discordModerationKeys } from "./query-keys";

export function getTaskListQueryOptions(params: TaskListParams) {
  return {
    queryKey: discordModerationKeys.taskList(params),
    queryFn: () => fetchTaskList(params),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  } as const;
}

export function useTaskList(params: TaskListParams) {
  return useQuery(getTaskListQueryOptions(params));
}
