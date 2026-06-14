import { apiClient } from "@/api";
import { endpoints } from "@/api/endpoints";
import {
  type CreateTaskTypeInput,
  MutationResponseSchema,
  type TaskTypeData,
  TaskTypeListResponseSchema,
  type UpdateTaskTypeInput,
} from "../schemas/task-type.schema";

export interface TaskTypeParams {
  page: number;
  perPage: number;
  search?: string;
  sortBy?: string;
}

export interface TaskTypeListData {
  data: TaskTypeData[];
  pagination: {
    count: number;
    totalPages: number;
    isNext: boolean;
    isPrev: boolean;
  };
}

export async function fetchTaskTypes(
  params: TaskTypeParams,
): Promise<TaskTypeListData> {
  const query = new URLSearchParams({
    pageIndex: String(params.page),
    perPage: String(params.perPage),
  });

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }
  if (params.sortBy?.trim()) {
    query.set("sortBy", params.sortBy.trim());
  }

  const response = await apiClient.get(
    `${endpoints.admin.tasks.taskTypes}?${query.toString()}`,
    TaskTypeListResponseSchema,
  );

  return (
    response.response ??
    response.data ?? {
      data: [],
      pagination: { count: 0, totalPages: 1, isNext: false, isPrev: false },
    }
  );
}

export async function createTaskType(data: CreateTaskTypeInput): Promise<void> {
  await apiClient.post(
    endpoints.admin.tasks.taskTypeCreate,
    data,
    MutationResponseSchema,
  );
}

export async function updateTaskType(
  id: string,
  data: UpdateTaskTypeInput,
): Promise<void> {
  await apiClient.put(
    endpoints.admin.tasks.taskTypeDetail(id),
    data,
    MutationResponseSchema,
  );
}

export async function deleteTaskType(id: string): Promise<void> {
  await apiClient.delete(endpoints.admin.tasks.taskTypeDetail(id));
}
