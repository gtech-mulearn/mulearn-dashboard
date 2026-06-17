"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchPendingTasks, reviewTask } from "../api/task-verification.api";
import type { ReviewActionValues } from "../schemas/task-verification.schema";
import { getApiResponseError } from "@/hooks/use-get-error";
import { useTaskQueryErrorToast } from "./task-error";

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
  const query = useQuery({
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

  useTaskQueryErrorToast(query.error, "Failed to load pending tasks.");
  return query;
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
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to submit review status.",
        }),
      );
    },
  });
}
