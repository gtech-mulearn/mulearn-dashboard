"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchReviewQueue, reviewItem } from "../api/task-review.api";
import type { ReviewActionValues } from "../schemas";

const reviewKeys = {
  all: ["mentor-review"] as const,
  list: (params: Record<string, unknown>) =>
    [...reviewKeys.all, "list", params] as const,
};

const no403Retry = (failureCount: number, error: unknown) => {
  if ((error as { status?: number })?.status === 403) return false;
  return failureCount < 2;
};

interface UseReviewQueueParams {
  status?: string;
  page?: number;
  search?: string;
}

export function useReviewQueue(params: UseReviewQueueParams = {}) {
  return useQuery({
    queryKey: reviewKeys.list(params as Record<string, unknown>),
    queryFn: () => fetchReviewQueue(params),
    retry: no403Retry,
  });
}

export function useReviewItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      kalId,
      data,
    }: {
      kalId: string;
      data: ReviewActionValues;
    }) => reviewItem(kalId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      toast.success("Review submitted");
    },
    onError: () => {
      toast.error("Failed to submit review");
    },
  });
}
