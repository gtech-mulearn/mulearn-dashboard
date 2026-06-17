"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  createCompanyTask,
  deleteCompanyTask,
  fetchCompanyTask,
  fetchCompanyTasks,
  updateCompanyTask,
} from "../api";
import type { CompanyTaskListParams } from "../api/company-tasks.api";
import type { CompanyTaskFormValues } from "../schemas/company-tasks.schema";

export const COMPANY_TASKS_KEYS = {
  all: ["company-tasks"] as const,
  list: (params?: CompanyTaskListParams) =>
    [...COMPANY_TASKS_KEYS.all, "list", params ?? {}] as const,
  detail: (taskId: string) =>
    [...COMPANY_TASKS_KEYS.all, "detail", taskId] as const,
};

export function useCompanyTasks(params?: CompanyTaskListParams) {
  return useQuery({
    queryKey: COMPANY_TASKS_KEYS.list(params),
    queryFn: () => fetchCompanyTasks(params),
    refetchOnWindowFocus: false,
  });
}

export function useCompanyTaskDetail(taskId: string) {
  return useQuery({
    queryKey: COMPANY_TASKS_KEYS.detail(taskId),
    queryFn: () => fetchCompanyTask(taskId),
    enabled: !!taskId,
    refetchOnWindowFocus: false,
  });
}

export function useCreateCompanyTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CompanyTaskFormValues) => createCompanyTask(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANY_TASKS_KEYS.all });
      toast.success("Task submitted for approval successfully");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to submit task" }),
      );
    },
  });
}

export function useUpdateCompanyTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      payload,
    }: {
      taskId: string;
      payload: Partial<CompanyTaskFormValues>;
    }) => updateCompanyTask(taskId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: COMPANY_TASKS_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: COMPANY_TASKS_KEYS.detail(variables.taskId),
      });
      toast.success("Task updated and re-submitted for approval successfully");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to update task" }),
      );
    },
  });
}

export function useDeleteCompanyTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => deleteCompanyTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANY_TASKS_KEYS.all });
      toast.success("Task deleted successfully");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to delete task" }),
      );
    },
  });
}
