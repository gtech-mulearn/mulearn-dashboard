/**
 * Company Tasks API
 *
 * 📍 src/features/company-jobs/api/company-tasks.api.ts
 *
 * Company creator and approved Company Mentors can submit tasks for admin approval.
 * Tasks are scoped to requested_by = current user (not the whole company).
 * Base: /api/v1/dashboard/company/tasks/
 *
 * Auth: JWT · verified company creator or approved Company Mentor
 *       (GET /tasks/ list is accessible to any authenticated user — returns empty if none submitted)
 */

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  CompanyTask,
  CompanyTaskFormValues,
} from "../schemas/company-tasks.schema";
import {
  CompanyTaskCreateResponseSchema,
  CompanyTaskDetailResponseSchema,
  CompanyTaskGenericResponseSchema,
  CompanyTaskListResponseSchema,
} from "../schemas/company-tasks.schema";

const OPT = { skipAuthRedirectOn403: true } as const;

// ─── Query params ─────────────────────────────────────────────────────────────

export interface CompanyTaskListParams {
  /** Filter by approval status */
  approval_status?: "pending" | "approved" | "rejected";
  pageIndex?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
}

// ─── GET /tasks/ — list user-submitted company tasks ─────────────────────────

export async function fetchCompanyTasks(
  params: CompanyTaskListParams = {},
): Promise<{ data: CompanyTask[]; totalPages: number; totalItems: number }> {
  const q = new URLSearchParams();
  if (params.approval_status) q.set("approval_status", params.approval_status);
  if (params.pageIndex) q.set("pageIndex", String(params.pageIndex));
  if (params.perPage) q.set("perPage", String(params.perPage));
  if (params.search) q.set("search", params.search);
  if (params.sortBy) q.set("sortBy", params.sortBy);

  const url = `${endpoints.company.tasks}?${q}`;
  const res = await apiClient.get(url, CompanyTaskListResponseSchema, OPT);
  return {
    data: res.response.data,
    totalPages: res.response.pagination.totalPages,
    totalItems: res.response.pagination.count ?? res.response.data.length,
  };
}

// ─── POST /tasks/ — submit new task for approval ─────────────────────────────
// Requires verified company profile (creator or approved Company Mentor).
// Saves with approval_status=pending, active=false until admin approves.

export async function createCompanyTask(
  data: CompanyTaskFormValues,
): Promise<void> {
  await apiClient.post(
    endpoints.company.tasks,
    data,
    CompanyTaskCreateResponseSchema,
    OPT,
  );
}

// ─── GET /tasks/<task_id>/ — single task detail ───────────────────────────────
// requested_by must be the current user; requires verified company profile.

export async function fetchCompanyTask(taskId: string): Promise<CompanyTask> {
  const res = await apiClient.get(
    endpoints.company.taskDetail(taskId),
    CompanyTaskDetailResponseSchema,
    OPT,
  );
  return res.response;
}

// ─── PUT /tasks/<task_id>/ — edit task (re-submit for approval) ───────────────
// Resets approval_status → pending and active → false for re-approval.

export async function updateCompanyTask(
  taskId: string,
  data: Partial<CompanyTaskFormValues>,
): Promise<void> {
  await apiClient.put(
    endpoints.company.taskDetail(taskId),
    data,
    CompanyTaskGenericResponseSchema,
    OPT,
  );
}

// ─── DELETE /tasks/<task_id>/ — delete task (only pending tasks) ──────────────

export async function deleteCompanyTask(taskId: string): Promise<void> {
  await apiClient.delete(
    endpoints.company.taskDetail(taskId),
    undefined,
    CompanyTaskGenericResponseSchema,
    OPT,
  );
}
