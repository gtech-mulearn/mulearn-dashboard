"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/api";
import type { AdminTaskReviewValues } from "../../tasks/schemas";
import {
  fetchAdminPendingTasks,
  reviewAdminTask,
} from "../api/admin-task-review.api";

// ─── Query keys ───────────────────────────────────────────────────────────────
const adminTaskKeys = {
  all: ["admin-tasks"] as const,
  list: (params: Record<string, unknown>) =>
    [...adminTaskKeys.all, "list", params] as const,
};

// ─── #5 GET /task/pending/ — paginated task list ──────────────────────────────
interface UseAdminTasksParams {
  approval_status?: "pending" | "approved" | "rejected";
  role?: "mentor" | "company" | "admin";
  mentor_name?: string;
  company_name?: string;
  pageIndex?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
}

export function useAdminTasks(params: UseAdminTasksParams = {}) {
  return useQuery({
    queryKey: adminTaskKeys.list(params as Record<string, unknown>),
    queryFn: () => fetchAdminPendingTasks(params),
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Convenience alias — mentor tasks pending review ─────────────────────────
export const useAdminMentorPendingTasks = (
  params: Omit<UseAdminTasksParams, "role" | "approval_status"> = {},
) =>
  useAdminTasks({
    ...params,
    role: "mentor",
    approval_status: "pending",
  });

// ─── #6 PATCH /task/<task_id>/review/ — approve or reject ────────────────────
export function useReviewAdminTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: AdminTaskReviewValues;
    }) => reviewAdminTask(taskId, data),
    onSuccess: (_result, { data }) => {
      void qc.invalidateQueries({ queryKey: adminTaskKeys.all });
      toast.success(
        data.action === "approve"
          ? "Task approved and is now live."
          : "Task rejected.",
      );
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError ? error.message : "Failed to review task",
      ),
  });
}
