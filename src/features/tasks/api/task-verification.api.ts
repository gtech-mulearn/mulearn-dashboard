import { z } from "zod";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { ApiResponseSchema } from "@/lib/schemas/api-response";
import type {
  ReviewActionValues,
  TaskVerificationItem,
} from "../schemas/task-verification.schema";
import { TaskVerificationListResponseSchema } from "../schemas/task-verification.schema";

interface ListParams {
  approval_status?: "pending" | "approved" | "rejected";
  source?: "mentor" | "company";
  mentor_name?: string;
  company_name?: string;
  pageIndex?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
}

export async function fetchPendingTasks(params: ListParams = {}): Promise<{
  tasks: TaskVerificationItem[];
  totalPages: number;
  totalItems: number;
}> {
  const q = new URLSearchParams();
  if (params.approval_status) q.set("approval_status", params.approval_status);
  if (params.source) q.set("source", params.source);
  if (params.mentor_name) q.set("mentor_name", params.mentor_name);
  if (params.company_name) q.set("company_name", params.company_name);
  if (params.pageIndex) q.set("pageIndex", String(params.pageIndex));
  if (params.perPage) q.set("perPage", String(params.perPage));
  if (params.search) q.set("search", params.search);
  if (params.sortBy) q.set("sortBy", params.sortBy);

  const query = q.toString();
  const url = query
    ? `${endpoints.admin.tasks.pending}?${query}`
    : endpoints.admin.tasks.pending;

  const res = await apiClient.get(url, TaskVerificationListResponseSchema, {
    skipAuthRedirectOn403: true,
  });

  const tasks = res.response?.tasks ?? [];
  return {
    tasks,
    totalPages: res.response?.pagination?.totalPages ?? 1,
    totalItems: res.response?.pagination?.count ?? tasks.length,
  };
}

export async function reviewTask(
  taskId: string,
  data: ReviewActionValues,
): Promise<void> {
  const schema = ApiResponseSchema(z.unknown());
  await apiClient.patch(endpoints.admin.tasks.review(taskId), data, schema, {
    skipAuthRedirectOn403: true,
  });
}
