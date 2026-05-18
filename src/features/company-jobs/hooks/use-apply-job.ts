"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { applyToJob } from "../api";
import { LEARNER_APPLICATIONS_KEYS } from "./use-learner-applications";
import { PUBLIC_JOBS_KEYS } from "./use-public-jobs";

export function useApplyJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, coverNote }: { jobId: string; coverNote?: string }) =>
      applyToJob(jobId, coverNote),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: LEARNER_APPLICATIONS_KEYS.all,
      });
      queryClient.invalidateQueries({ queryKey: PUBLIC_JOBS_KEYS.all });
    },
  });
}
