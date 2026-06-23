import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  createCompanyTask,
  createTaskType,
  deleteCompanyTask,
  deleteTaskType,
  type FetchCompanyTasksParams,
  fetchCompanyTaskDetail,
  fetchCompanyTasks,
  fetchPublicTaskList,
  fetchTaskTypes,
  updateCompanyTask,
  updateTaskType,
} from "../api/tasks.api";
import type {
  CreateCompanyTaskPayload,
  UpdateCompanyTaskPayload,
} from "../types/tasks.types";

export const COMPANY_TASKS_KEYS = {
  all: ["company-tasks"] as const,
  list: (params?: FetchCompanyTasksParams) =>
    [...COMPANY_TASKS_KEYS.all, "list", params ?? {}] as const,
  detail: (taskId: string) =>
    [...COMPANY_TASKS_KEYS.all, "detail", taskId] as const,
  types: () => [...COMPANY_TASKS_KEYS.all, "types"] as const,
  publicList: () => ["public-tasks-list"] as const,
};

export function useCompanyTasks(params?: FetchCompanyTasksParams) {
  return useQuery({
    queryKey: COMPANY_TASKS_KEYS.list(params),
    queryFn: () => fetchCompanyTasks(params),
  });
}

export function usePublicTasksList() {
  return useQuery({
    queryKey: COMPANY_TASKS_KEYS.publicList(),
    queryFn: fetchPublicTaskList,
  });
}

export function useTaskTypes() {
  return useQuery({
    queryKey: COMPANY_TASKS_KEYS.types(),
    queryFn: fetchTaskTypes,
    staleTime: Infinity,
  });
}

export function useCreateCompanyTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCompanyTaskPayload) =>
      createCompanyTask(payload),
    onSuccess: () => {
      toast.success("Task submitted for approval.");
      queryClient.invalidateQueries({
        queryKey: COMPANY_TASKS_KEYS.all,
      });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to create task. Please try again.",
        }),
      );
    },
  });
}

export function useCompanyTaskDetail(taskId: string) {
  return useQuery({
    queryKey: COMPANY_TASKS_KEYS.detail(taskId),
    queryFn: () => fetchCompanyTaskDetail(taskId),
    enabled: !!taskId,
  });
}

export function useUpdateCompanyTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      taskId: string;
      payload: UpdateCompanyTaskPayload;
    }) => updateCompanyTask(params),
    onSuccess: (_, { taskId }) => {
      toast.success("Task updated and re-submitted for approval.");
      queryClient.invalidateQueries({ queryKey: COMPANY_TASKS_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: COMPANY_TASKS_KEYS.detail(taskId),
      });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to update task." }),
      );
    },
  });
}

export function useDeleteCompanyTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => deleteCompanyTask(taskId),
    onSuccess: () => {
      toast.success("Task deleted successfully.");
      queryClient.invalidateQueries({ queryKey: COMPANY_TASKS_KEYS.all });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Cannot delete task." }),
      );
    },
  });
}

export function useCreateTaskType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: unknown) => createTaskType(payload),
    onSuccess: () => {
      toast.success("Task type created.");
      queryClient.invalidateQueries({ queryKey: COMPANY_TASKS_KEYS.types() });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to create task type." }),
      );
    },
  });
}

export function useUpdateTaskType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: unknown) => updateTaskType(payload),
    onSuccess: () => {
      toast.success("Task type updated.");
      queryClient.invalidateQueries({ queryKey: COMPANY_TASKS_KEYS.types() });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to update task type." }),
      );
    },
  });
}

export function useDeleteTaskType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: unknown) => deleteTaskType(payload),
    onSuccess: () => {
      toast.success("Task type deleted.");
      queryClient.invalidateQueries({ queryKey: COMPANY_TASKS_KEYS.types() });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to delete task type." }),
      );
    },
  });
}
