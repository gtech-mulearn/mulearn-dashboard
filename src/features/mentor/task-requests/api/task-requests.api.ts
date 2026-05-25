import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  ReviewTaskRequestValues,
  TaskRequest,
  TaskRequestFormValues,
} from "../schemas";
import {
  GenericResponseSchema,
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
