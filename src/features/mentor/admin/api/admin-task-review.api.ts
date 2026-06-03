import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  AdminPendingTask,
  AdminTaskReviewValues,
} from "../../tasks/schemas";
import {
  AdminPendingTaskListResponseSchema,
  AdminTaskReviewResponseSchema,
} from "../../tasks/schemas";

interface AdminTaskListParams {
  approval_status?: "pending" | "approved" | "rejected";
  role?: "mentor" | "company" | "admin";
  mentor_name?: string;
  company_name?: string;
  pageIndex?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
}

// ─── #5 GET /task/pending/ — admin: list tasks by status / role ───────────────
export async function fetchAdminPendingTasks(
  params: AdminTaskListParams = {},
): Promise<{
  tasks: AdminPendingTask[];
  totalPages: number;
  totalItems: number;
}> {
  const q = new URLSearchParams();
  // Default to "pending" matching the doc's default
  q.set("approval_status", params.approval_status ?? "pending");
  if (params.role) q.set("role", params.role);
  if (params.mentor_name) q.set("mentor_name", params.mentor_name);
  if (params.company_name) q.set("company_name", params.company_name);
  if (params.pageIndex) q.set("pageIndex", String(params.pageIndex));
  if (params.perPage) q.set("perPage", String(params.perPage));
  if (params.search) q.set("search", params.search);
  if (params.sortBy) q.set("sortBy", params.sortBy);

  const url = `${endpoints.adminTask.pending}?${q}`;
  const res = await apiClient.get(url, AdminPendingTaskListResponseSchema);
  return {
    tasks: res.response.tasks,
    totalPages: res.response.pagination.totalPages,
    totalItems: res.response.pagination.count ?? res.response.tasks.length,
  };
}

// ─── #6 PATCH /task/<task_id>/review/ — admin: approve or reject task ────────
// payload: { action: "approve" } | { action: "reject", reason: "..." }
export async function reviewAdminTask(
  taskId: string,
  data: AdminTaskReviewValues,
): Promise<void> {
  await apiClient.patch(
    endpoints.adminTask.review(taskId),
    data,
    AdminTaskReviewResponseSchema,
  );
}
