"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPublicJobs } from "../api";
import type { JobsListParams } from "../types";

export const PUBLIC_JOBS_KEYS = {
  all: ["public-jobs"] as const,
  list: (params?: JobsListParams) =>
    [...PUBLIC_JOBS_KEYS.all, "list", params ?? {}] as const,
};

export function usePublicJobs(params?: JobsListParams) {
  return useQuery({
    queryKey: PUBLIC_JOBS_KEYS.list(params),
    queryFn: () => fetchPublicJobs(params),
    refetchOnWindowFocus: false,
  });
}
