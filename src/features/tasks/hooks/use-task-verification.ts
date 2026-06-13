"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/api";
import { fetchPendingTasks, reviewTask } from "../api/task-verification.api";
import type { ReviewActionValues } from "../schemas/task-verification.schema";

const taskVerificationKeys = {
  all: ["task-verification-list"] as const,
  list: (params: Record<string, unknown>) =>
    [...taskVerificationKeys.all, "list", params] as const,
};

interface UsePendingTasksParams {
  approval_status?: "pending" | "approved" | "rejected";
  source?: "mentor" | "company";
  mentor_name?: string;
  company_name?: string;
  pageIndex?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
}

export function usePendingTasks(params: UsePendingTasksParams = {}) {
  return useQuery({
    queryKey: taskVerificationKeys.list(params as Record<string, unknown>),
    queryFn: () => fetchPendingTasks(params),
    retry: (failureCount, error) => {
      if (
        error instanceof Error &&
        "status" in error &&
        (error as { status: number }).status === 403
      )
        return false;
      return failureCount < 2;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useReviewTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: ReviewActionValues;
    }) => reviewTask(taskId, data),
    onSuccess: (_result, { data }) => {
      void queryClient.invalidateQueries({
        queryKey: taskVerificationKeys.all,
      });
      toast.success(
        data.action === "approve"
          ? "Task approved and is now live."
          : "Task application rejected.",
      );
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to submit review status.",
      ),
  });
}
