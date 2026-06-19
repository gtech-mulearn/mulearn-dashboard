"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  createTaskRequest,
  fetchTaskRequest,
  fetchTaskRequests,
  reviewTaskRequest,
  withdrawTaskRequest,
} from "../api/task-requests.api";
import type {
  ReviewTaskRequestValues,
  TaskRequestFormValues,
} from "../schemas";

const taskRequestKeys = {
  all: ["mentor-task-requests"] as const,
  list: (params: Record<string, unknown>) =>
    [...taskRequestKeys.all, "list", params] as const,
  detail: (id: string) => [...taskRequestKeys.all, "detail", id] as const,
};

const no403Retry = (failureCount: number, error: unknown) => {
  if ((error as { status?: number })?.status === 403) return false;
  return failureCount < 2;
};

interface UseTaskRequestsParams {
  status?: string;
  page?: number;
  search?: string;
}

export function useTaskRequests(params: UseTaskRequestsParams = {}) {
  return useQuery({
    queryKey: taskRequestKeys.list(params as Record<string, unknown>),
    queryFn: () => fetchTaskRequests(params),
    retry: no403Retry,
  });
}

export function useCreateTaskRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskRequestFormValues) => createTaskRequest(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskRequestKeys.all });
      toast.success("Task request created");
    },
    onError: (error) =>
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to create task request",
        }),
      ),
  });
}

export function useReviewTaskRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewTaskRequestValues }) =>
      reviewTaskRequest(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskRequestKeys.all });
      toast.success("Task request updated");
    },
    onError: (error) =>
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update task request",
        }),
      ),
  });
}

export function useTaskRequest(id: string | null | undefined) {
  return useQuery({
    queryKey: taskRequestKeys.detail(id ?? ""),
    queryFn: () => fetchTaskRequest(id as string),
    retry: no403Retry,
    enabled: !!id,
  });
}

export function useWithdrawTaskRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => withdrawTaskRequest(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskRequestKeys.all });
      toast.success("Task request withdrawn");
    },
    onError: (error) =>
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to withdraw task request",
        }),
      ),
  });
}
