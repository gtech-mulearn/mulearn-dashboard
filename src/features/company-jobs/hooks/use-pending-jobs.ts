"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchPendingJobs } from "../api";
import { JOBS_KEYS } from "./use-jobs";

export interface PendingJobsParams {
  page?: number;
  perPage?: number;
}

/**
 * Jobs company mentors submitted that wait for the owner or a co-admin.
 * Keyed under JOBS_KEYS.all so approve/reject/request-changes refresh it.
 */
export function usePendingJobs(
  params?: PendingJobsParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: [...JOBS_KEYS.all, "pending", params ?? {}] as const,
    queryFn: () =>
      fetchPendingJobs({ pageIndex: params?.page, perPage: params?.perPage }),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}
