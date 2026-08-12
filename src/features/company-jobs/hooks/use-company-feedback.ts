"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  fetchCompanyFeedbackList,
  fetchCompanyImpactReport,
  submitCompanyFeedback,
  togglePublishImpactReport,
} from "../api";

export const FEEDBACK_KEYS = {
  all: ["company-feedback"] as const,
  list: () => [...FEEDBACK_KEYS.all, "list"] as const,
  impactReport: () => [...FEEDBACK_KEYS.all, "impact-report"] as const,
};

export function useCompanyFeedbackList() {
  return useQuery({
    queryKey: FEEDBACK_KEYS.list(),
    queryFn: fetchCompanyFeedbackList,
    refetchOnWindowFocus: false,
  });
}

export function useSubmitCompanyFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      to_user_id?: string;
      rating: number;
      feedback_type: string;
      comments: string;
    }) => submitCompanyFeedback(payload),
    onSuccess: () => {
      toast.success("Feedback submitted successfully");
      queryClient.invalidateQueries({ queryKey: FEEDBACK_KEYS.list() });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to submit feedback" }),
      );
    },
  });
}

export function useCompanyImpactReport() {
  return useQuery({
    queryKey: FEEDBACK_KEYS.impactReport(),
    queryFn: fetchCompanyImpactReport,
    refetchOnWindowFocus: false,
  });
}

export function useTogglePublishImpactReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isPublished: boolean) =>
      togglePublishImpactReport(isPublished),
    onSuccess: (_, isPublished) => {
      toast.success(
        isPublished ? "Impact report published" : "Impact report unpublished",
      );
      queryClient.invalidateQueries({ queryKey: FEEDBACK_KEYS.impactReport() });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update impact report publication status",
        }),
      );
    },
  });
}
