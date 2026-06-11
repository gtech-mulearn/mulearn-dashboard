import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/api/errors";
import {
  createCompanyTask,
  deleteCompanyTask,
  fetchCompanyTaskDetail,
  fetchCompanyTasks,
  updateCompanyTask,
  fetchPublicTaskList,
  fetchTaskTypes,
  createTaskType,
  updateTaskType,
  deleteTaskType,
  type FetchCompanyTasksParams,
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
      if (error instanceof ApiError) {
        const errData = error.data as Record<string, string[]>;
        if (errData?.hashtag) {
          toast.error(
            errData.hashtag[0] || "A task with this hashtag already exists.",
          );
        } else if (errData?.type) {
          toast.error(`Invalid Task Type: ${errData.type[0]}`);
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error("Failed to create task. Please try again.");
      }
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
      if (error instanceof ApiError) {
        toast.error(error.message || "Failed to update task.");
      } else {
        toast.error("An unexpected error occurred.");
      }
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
      if (error instanceof ApiError) {
        toast.error(error.message || "Cannot delete task.");
      } else {
        toast.error("An unexpected error occurred while deleting.");
      }
    },
  });
}

export function useCreateTaskType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => createTaskType(payload),
    onSuccess: () => {
      toast.success("Task type created.");
      queryClient.invalidateQueries({ queryKey: COMPANY_TASKS_KEYS.types() });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to create task type.",
      );
    },
  });
}

export function useUpdateTaskType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => updateTaskType(payload),
    onSuccess: () => {
      toast.success("Task type updated.");
      queryClient.invalidateQueries({ queryKey: COMPANY_TASKS_KEYS.types() });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to update task type.",
      );
    },
  });
}

export function useDeleteTaskType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => deleteTaskType(payload),
    onSuccess: () => {
      toast.success("Task type deleted.");
      queryClient.invalidateQueries({ queryKey: COMPANY_TASKS_KEYS.types() });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to delete task type.",
      );
    },
  });
}
