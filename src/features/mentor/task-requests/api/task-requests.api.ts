import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  ReviewTaskRequestValues,
  TaskRequest,
  TaskRequestFormValues,
} from "../schemas";
import {
  GenericResponseSchema,
  SingleTaskRequestResponseSchema,
  TaskRequestListResponseSchema,
} from "../schemas";

const OPT = { skipAuthRedirectOn403: true } as const;

interface ListParams {
  status?: string;
  page?: number;
  search?: string;
}

export async function fetchTaskRequests(params: ListParams = {}): Promise<{
  data: TaskRequest[];
  totalPages: number;
}> {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.page) q.set("page", String(params.page));
  if (params.search) q.set("search", params.search);

  const url =
    params.status || params.page || params.search
      ? `${endpoints.mentor.taskRequests}?${q}`
      : endpoints.mentor.taskRequests;

  const res = await apiClient.get(url, TaskRequestListResponseSchema, OPT);
  return {
    data: res.response.data,
    totalPages: res.response.pagination?.totalPages ?? 1,
  };
}

export async function createTaskRequest(
  data: TaskRequestFormValues,
): Promise<void> {
  const { ig_id, ...rest } = data;
  await apiClient.post(
    endpoints.mentor.taskRequests,
    { ...rest, ig: ig_id },
    GenericResponseSchema,
    OPT,
  );
}

export async function reviewTaskRequest(
  id: string,
  data: ReviewTaskRequestValues,
): Promise<void> {
  await apiClient.patch(
    endpoints.mentor.taskRequest(id),
    data,
    GenericResponseSchema,
    OPT,
  );
}

export async function fetchTaskRequest(id: string): Promise<TaskRequest> {
  const res = await apiClient.get(
    endpoints.mentor.taskRequest(id),
    SingleTaskRequestResponseSchema,
    OPT,
  );
  return res.response.task_request;
}

export async function withdrawTaskRequest(id: string): Promise<void> {
  await apiClient.delete(
    endpoints.mentor.taskRequest(id),
    undefined,
    GenericResponseSchema,
    OPT,
  );
}
