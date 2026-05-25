"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchActivityLog, fetchMentees } from "../api/mentees.api";

const menteeKeys = {
  all: ["mentor-mentees"] as const,
  list: (params: Record<string, unknown>) =>
    [...menteeKeys.all, "list", params] as const,
  activityLog: (params: Record<string, unknown>) =>
    [...menteeKeys.all, "activity-log", params] as const,
};

const no403Retry = (failureCount: number, error: unknown) => {
  if ((error as { status?: number })?.status === 403) return false;
  return failureCount < 2;
};

interface UseMenteesParams {
  page?: number;
  search?: string;
}

export function useMentees(params: UseMenteesParams = {}) {
  return useQuery({
    queryKey: menteeKeys.list(params as Record<string, unknown>),
    queryFn: () => fetchMentees(params),
    retry: no403Retry,
  });
}

export function useActivityLog(params: UseMenteesParams = {}) {
  return useQuery({
    queryKey: menteeKeys.activityLog(params as Record<string, unknown>),
    queryFn: () => fetchActivityLog(params),
    retry: no403Retry,
  });
}
