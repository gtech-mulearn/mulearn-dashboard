"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createTaskRequest,
  fetchTaskRequests,
  reviewTaskRequest,
} from "../api/task-requests.api";
import type {
  ReviewTaskRequestValues,
  TaskRequestFormValues,
} from "../schemas";

const taskRequestKeys = {
  all: ["mentor-task-requests"] as const,
  list: (params: Record<string, unknown>) =>
    [...taskRequestKeys.all, "list", params] as const,
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
    onError: () => toast.error("Failed to create task request"),
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
    onError: () => toast.error("Failed to update task request"),
  });
}
