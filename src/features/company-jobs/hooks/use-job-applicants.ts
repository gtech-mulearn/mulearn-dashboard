"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import { fetchJobApplicants, updateApplicantStatus } from "../api";
import type { JobApplicantsResponse } from "../types";

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
      appId,
      status,
      rejection_reason,
    }: {
      appId: string;
      status: string;
      rejection_reason?: string;
    }) => updateApplicantStatus(appId, { status, rejection_reason }),
    onSuccess: (_data, variables) => {
      // Optimistically update query cache
      queryClient.setQueriesData<JobApplicantsResponse>(
        { queryKey: JOB_APPLICANTS_KEYS.all },
        (old) => {
          if (!old?.applicants) return old;
          return {
            ...old,
            applicants: old.applicants.map((a) =>
              a.id === variables.appId
                ? {
                    ...a,
                    status: variables.status,
                    rejection_reason:
                      variables.rejection_reason ?? a.rejection_reason,
                  }
                : a,
            ),
          };
        },
      );
      // Invalidate specific job applicants query
      queryClient.invalidateQueries({ queryKey: JOB_APPLICANTS_KEYS.all });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update applicant status",
        }),
      );
    },
  });
}
