import { z } from "zod";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { ApiResponseSchema } from "../schemas/task-type.schema";
import {
  DropdownResponseSchema,
  SingleTaskResponseSchema,
  TasksResponseSchema,
  type ReferenceItem,
  type Task,
  type TaskCreateRequest,
  type TaskReferenceData,
} from "../schemas/tasks.schema";
import type { TaskListData, TaskListParams } from "../types/tasks.types";

export async function fetchTasks(
  params: TaskListParams,
): Promise<TaskListData> {
  const query = new URLSearchParams({
    pageIndex: String(params.pageIndex),
    perPage: String(params.perPage),
  });

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }
  if (params.sortBy?.trim()) {
    query.set("sortBy", params.sortBy.trim());
  }

  const response = await apiClient.get(
    `${endpoints.admin.tasks.base}?${query.toString()}`,
    TasksResponseSchema,
    { skipAuthRedirectOn403: true },
  );

  return (
    response.response ??
    response.data ?? {
      data: [],
      pagination: { count: 0, totalPages: 1, isNext: false, isPrev: false },
    }
  );
}

export async function fetchTaskDetail(id: string): Promise<Task> {
  const response = await apiClient.get(
    endpoints.admin.tasks.detail(id),
    SingleTaskResponseSchema,
    { skipAuthRedirectOn403: true },
  );

  const task = response.response ?? response.data;
  if (!task) {
    throw new Error("Task not found");
  }
  return task;
}

export async function createTask(data: TaskCreateRequest): Promise<Task> {
  const response = await apiClient.post(
    endpoints.admin.tasks.base,
    data,
    SingleTaskResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  const result = response.response ?? response.data;
  if (!result) {
    throw new Error("Failed to create task");
  }
  return result as Task;
}

export async function updateTask(
  id: string,
  data: Partial<TaskCreateRequest>,
): Promise<Task> {
  const response = await apiClient.put(
    endpoints.admin.tasks.detail(id),
    data,
    SingleTaskResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  const result = response.response ?? response.data;
  if (!result) {
    throw new Error("Failed to update task");
  }
  return result as Task;
}

export async function deleteTask(id: string): Promise<void> {
  await apiClient.delete(endpoints.admin.tasks.detail(id), {
    skipAuthRedirectOn403: true,
  });
}

export async function downloadTasksCsv(): Promise<Blob> {
  return apiClient.get<Blob>(endpoints.admin.tasks.csv, undefined, {
    responseType: "blob",
  });
}

export async function downloadTasksTemplate(): Promise<Blob> {
  return apiClient.get<Blob>(endpoints.admin.tasks.template, undefined, {
    responseType: "blob",
  });
}

export async function importTasks(file: File): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);

  const schema = ApiResponseSchema(z.any());
  const response = await apiClient.post(
    endpoints.admin.tasks.import,
    formData,
    schema,
    {
      isFormData: true,
      skipAuthRedirectOn403: true,
    },
  );

  return response.response ?? response.data;
}

export async function fetchTaskReferences(): Promise<TaskReferenceData> {
  const safeFetch = async (url: string): Promise<ReferenceItem[]> => {
    try {
      const res = await apiClient.get(url, DropdownResponseSchema, {
        skipAuthRedirectOn403: true,
      });
      const data = res.response ?? res.data ?? [];
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        title: item.title,
      }));
    } catch (err) {
      console.error(`Failed to fetch references from ${url}:`, err);
      return [];
    }
  };

  const [levels, igs, organizations, channels, types, skills] =
    await Promise.all([
      safeFetch(endpoints.admin.tasks.levels),
      safeFetch(endpoints.admin.tasks.igs),
      safeFetch(endpoints.admin.tasks.organizations),
      safeFetch(endpoints.admin.tasks.channels),
      safeFetch(endpoints.admin.tasks.types),
      safeFetch(endpoints.admin.tasks.skills),
    ]);

  return {
    levels,
    igs,
    organizations,
    channels,
    types,
    skills,
  };
}
