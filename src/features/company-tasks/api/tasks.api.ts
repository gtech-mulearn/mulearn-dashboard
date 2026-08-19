import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  CompanyTaskDetailResponseSchema,
  CompanyTasksResponseSchema,
  GenericResponseSchema,
} from "../schemas/tasks.schema";
import type {
  CompanyTask,
  CompanyTaskApprovalStatus,
  CompanyTasksResponse,
  CreateCompanyTaskPayload,
  UpdateCompanyTaskPayload,
} from "../types/tasks.types";

export interface FetchCompanyTasksParams {
  approval_status?: CompanyTaskApprovalStatus;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

export async function fetchCompanyTasks(
  params?: FetchCompanyTasksParams,
): Promise<CompanyTasksResponse> {
  const query = new URLSearchParams();

  if (params?.approval_status)
    query.set("approval_status", params.approval_status);
  if (params?.search?.trim()) query.set("search", params.search.trim());
  if (params?.sort_by) query.set("sort_by", params.sort_by);
  if (params?.sort_order) query.set("sort_order", params.sort_order);
  if (params?.page) query.set("page", String(params.page));
  if (params?.per_page) query.set("per_page", String(params.per_page));

  const queryString = query.toString();
  const url = queryString
    ? `${endpoints.company.tasks}?${queryString}`
    : endpoints.company.tasks;

  const res = await apiClient.get(url, CompanyTasksResponseSchema);
  // Normalize response shape whether enveloped or direct
  if ("response" in res && res.response && typeof res.response === "object") {
    const respObj = res.response as unknown as CompanyTasksResponse;
    const pagination = respObj.pagination ?? {
      page: params?.page ?? 1,
      per_page: params?.per_page ?? 10,
      total: respObj.data?.length ?? 0,
    };
    return {
      data: respObj.data ?? [],
      pagination: {
        page: pagination.page ?? pagination.current_page ?? 1,
        per_page: pagination.per_page ?? 10,
        total:
          pagination.total ?? pagination.count ?? respObj.data?.length ?? 0,
        count:
          pagination.count ?? pagination.total ?? respObj.data?.length ?? 0,
        total_pages:
          pagination.total_pages ??
          Math.max(
            1,
            Math.ceil(
              (pagination.total ??
                pagination.count ??
                respObj.data?.length ??
                0) / (pagination.per_page ?? 10),
            ),
          ),
        current_page: pagination.current_page ?? pagination.page ?? 1,
        next: pagination.next ?? null,
        previous: pagination.previous ?? null,
      },
    };
  }

  const directObj = res as unknown as CompanyTasksResponse;
  const pagination = directObj.pagination ?? {
    page: params?.page ?? 1,
    per_page: params?.per_page ?? 10,
    total: directObj.data?.length ?? 0,
  };
  return {
    data: directObj.data ?? [],
    pagination: {
      page: pagination.page ?? pagination.current_page ?? 1,
      per_page: pagination.per_page ?? 10,
      total:
        pagination.total ?? pagination.count ?? directObj.data?.length ?? 0,
      count:
        pagination.count ?? pagination.total ?? directObj.data?.length ?? 0,
      total_pages:
        pagination.total_pages ??
        Math.max(
          1,
          Math.ceil(
            (pagination.total ??
              pagination.count ??
              directObj.data?.length ??
              0) / (pagination.per_page ?? 10),
          ),
        ),
      current_page: pagination.current_page ?? pagination.page ?? 1,
      next: pagination.next ?? null,
      previous: pagination.previous ?? null,
    },
  };
}

export async function createCompanyTask(
  payload: CreateCompanyTaskPayload,
): Promise<void> {
  await apiClient.post(endpoints.company.tasks, payload, GenericResponseSchema);
}

export async function fetchCompanyTaskDetail(
  taskId: string,
): Promise<CompanyTask> {
  const res = await apiClient.get(
    endpoints.company.taskDetail(taskId),
    CompanyTaskDetailResponseSchema,
  );
  if ("response" in res && res.response) {
    return res.response as CompanyTask;
  }
  return res as CompanyTask;
}

export async function updateCompanyTask({
  taskId,
  payload,
}: {
  taskId: string;
  payload: UpdateCompanyTaskPayload;
}): Promise<void> {
  await apiClient.patch(
    endpoints.company.taskDetail(taskId),
    payload,
    GenericResponseSchema,
  );
}

export async function deleteCompanyTask(taskId: string): Promise<void> {
  await apiClient.delete(
    endpoints.company.taskDetail(taskId),
    undefined,
    GenericResponseSchema,
  );
}

// ==========================================
// Public Tasks & Task Types APIs
// ==========================================

export async function fetchPublicTaskList(): Promise<unknown> {
  const res = await apiClient.get(
    endpoints.admin.tasks.publicList,
    GenericResponseSchema,
  );
  return "response" in res ? res.response : res;
}

export async function fetchTaskTypes(): Promise<unknown> {
  const res = await apiClient.get(
    endpoints.admin.tasks.taskTypes,
    GenericResponseSchema,
  );
  return "response" in res ? res.response : res;
}

export async function createTaskType(payload: unknown): Promise<void> {
  await apiClient.post(
    endpoints.admin.tasks.taskTypes,
    payload,
    GenericResponseSchema,
  );
}

export async function updateTaskType(payload: unknown): Promise<void> {
  await apiClient.put(
    endpoints.admin.tasks.taskTypes,
    payload,
    GenericResponseSchema,
  );
}

export async function deleteTaskType(payload: unknown): Promise<void> {
  await apiClient.delete(
    endpoints.admin.tasks.taskTypes,
    payload,
    GenericResponseSchema,
  );
}
