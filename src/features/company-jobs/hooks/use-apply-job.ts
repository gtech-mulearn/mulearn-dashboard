"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import { applyToJob } from "../api";
import { LEARNER_APPLICATIONS_KEYS } from "./use-learner-applications";
import { PUBLIC_JOBS_KEYS } from "./use-public-jobs";

export function useApplyJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      jobId,
      resume_link,
      cover_letter,
    }: {
      jobId: string;
      resume_link: string;
      cover_letter?: string;
    }) => applyToJob(jobId, { resume_link, cover_letter }),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: LEARNER_APPLICATIONS_KEYS.all,
      });
      queryClient.invalidateQueries({ queryKey: PUBLIC_JOBS_KEYS.all });
      toast.success("Application submitted successfully.");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to submit application. Please try again.",
        }),
      );
    },
  });
}
