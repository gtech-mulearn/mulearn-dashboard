"use client";

/**
 * useJobs — Paginated job listing query
 *
 * 📍 src/features/company-jobs/hooks/use-jobs.ts
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchJobs } from "../api";
import type { JobsListParams } from "../types";

export const JOBS_KEYS = {
  all: ["company-jobs"] as const,
  list: (params?: JobsListParams) =>
    [...JOBS_KEYS.all, "list", params ?? {}] as const,
  detail: (jobId: string) => [...JOBS_KEYS.all, "detail", jobId] as const,
};

export function useJobs(params?: JobsListParams) {
  return useQuery({
    queryKey: JOBS_KEYS.list(params),
    queryFn: () => fetchJobs(params),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/** Expose queryClient for invalidation from sibling hooks */
export function useJobsQueryClient() {
  return useQueryClient();
}
