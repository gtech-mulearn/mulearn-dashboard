"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTaskLevels } from "../api/task-levels.api";
import { taskLevelKeys } from "./query-keys";

const no403Retry = (failureCount: number, error: unknown) => {
  if (
    error instanceof Error &&
    "status" in error &&
    (error as { status: number }).status === 403
  )
    return false;
  return failureCount < 2;
};

export function useTaskLevels() {
  return useQuery({
    queryKey: taskLevelKeys.list(),
    queryFn: fetchTaskLevels,
    staleTime: 10 * 60 * 1000, // levels change rarely
    retry: no403Retry,
  });
}
