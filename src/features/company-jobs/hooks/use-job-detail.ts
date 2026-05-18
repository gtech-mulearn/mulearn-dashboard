"use client";

/**
 * useJobDetail — Single job detail query
 *
 * 📍 src/features/company-jobs/hooks/use-job-detail.ts
 */

import { useQuery } from "@tanstack/react-query";
import { fetchJobDetail } from "../api";
import { JOBS_KEYS } from "./use-jobs";

export function useJobDetail(jobId: string | undefined) {
  return useQuery({
    queryKey: JOBS_KEYS.detail(jobId ?? ""),
    queryFn: () => fetchJobDetail(jobId ?? ""),
    enabled: !!jobId,
    refetchOnWindowFocus: false,
  });
}
