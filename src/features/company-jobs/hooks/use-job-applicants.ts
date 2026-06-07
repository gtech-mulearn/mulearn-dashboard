"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchJobApplicants, updateApplicantStatus } from "../api";

export const JOB_APPLICANTS_KEYS = {
  all: ["job-applicants"] as const,
  list: (
    jobId: string,
    params?: {
      status?: string;
      search?: string;
      sortBy?: string;
      pageIndex?: number;
      perPage?: number;
    },
  ) => [...JOB_APPLICANTS_KEYS.all, jobId, "list", params ?? {}] as const,
};

export function useJobApplicants(
  jobId: string,
  params?: {
    status?: string;
    search?: string;
    sortBy?: string;
    pageIndex?: number;
    perPage?: number;
  },
) {
  return useQuery({
    queryKey: JOB_APPLICANTS_KEYS.list(jobId, params),
    queryFn: () => fetchJobApplicants(jobId, params),
    refetchOnWindowFocus: false,
  });
}

export function useUpdateApplicantStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      jobId,
      appId,
      status,
      rejection_reason,
    }: {
      jobId: string;
      appId: string;
      status: string;
      rejection_reason?: string;
    }) => updateApplicantStatus(appId, { status, rejection_reason }),
    onSuccess: () => {
      // Invalidate specific job applicants query
      queryClient.invalidateQueries({ queryKey: JOB_APPLICANTS_KEYS.all });
    },
  });
}
