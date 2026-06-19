"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  createMentorTask,
  deleteMentorTask,
  fetchMentorActivity,
  fetchMentorTask,
  fetchMentorTasks,
  fetchTaskIgDropdown,
  fetchTaskLevels,
  fetchTaskTypes,
  updateMentorTask,
} from "../api/mentor-tasks.api";
import type { MentorTaskFormValues } from "../schemas";

// ─── Query keys ───────────────────────────────────────────────────────────────
const mentorTaskKeys = {
  all: ["mentor-tasks"] as const,
  igDropdown: () => [...mentorTaskKeys.all, "ig-dropdown"] as const,
  taskTypes: () => [...mentorTaskKeys.all, "task-types"] as const,
  list: (params: Record<string, unknown>) =>
    [...mentorTaskKeys.all, "list", params] as const,
  detail: (taskId: string) =>
    [...mentorTaskKeys.all, "detail", taskId] as const,
  activity: (params: Record<string, unknown>) =>
    [...mentorTaskKeys.all, "activity", params] as const,
};

const no403Retry = (failureCount: number, error: unknown) => {
  if (
    error instanceof Error &&
    "status" in error &&
    (error as { status: number }).status === 403
  )
    return false;
  return failureCount < 2;
};

// ─── #1 GET /tasks/ig-dropdown/ ──────────────────────────────────────────────
export function useTaskIgDropdown() {
  return useQuery({
    queryKey: mentorTaskKeys.igDropdown(),
    queryFn: fetchTaskIgDropdown,
    staleTime: 5 * 60 * 1000,
    retry: no403Retry,
  });
}

// ─── GET /task/list-task-type/ — task types for dropdown ─────────────────────
export function useTaskTypes() {
  return useQuery({
    queryKey: mentorTaskKeys.taskTypes(),
    queryFn: fetchTaskTypes,
    staleTime: 10 * 60 * 1000, // task types change rarely
    retry: no403Retry,
  });
}

// ─── GET /api/v1/dashboard/task/level/ — task levels for dropdown ────────────
export function useTaskLevels() {
  return useQuery({
    queryKey: [...mentorTaskKeys.all, "levels"],
    queryFn: fetchTaskLevels,
    staleTime: 10 * 60 * 1000, // levels change rarely
    retry: no403Retry,
  });
}

// ─── #2 GET /tasks/ — paginated task list ────────────────────────────────────
interface UseMentorTasksParams {
  approval_status?: "pending" | "approved" | "rejected";
  pageIndex?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
}

export function useMentorTasks(params: UseMentorTasksParams = {}) {
  return useQuery({
    queryKey: mentorTaskKeys.list(params as Record<string, unknown>),
    queryFn: () => fetchMentorTasks(params),
    retry: no403Retry,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── #3 GET /tasks/<task_id>/ — single task detail ───────────────────────────
export function useMentorTask(taskId: string | null | undefined) {
  return useQuery({
    queryKey: mentorTaskKeys.detail(taskId ?? ""),
    queryFn: () => fetchMentorTask(taskId as string),
    retry: no403Retry,
    enabled: !!taskId,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── #2 POST /tasks/ — create task ───────────────────────────────────────────
export function useCreateMentorTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MentorTaskFormValues) => createMentorTask(data),
    onSuccess: () => {
      toast.success("Task submitted for approval.");
      void qc.invalidateQueries({ queryKey: mentorTaskKeys.all });
    },
    onError: (error) =>
      toast.error(
        getApiResponseError(error, { fallback: "Failed to create task" }),
      ),
  });
}

// ─── #3 PUT /tasks/<task_id>/ — update + re-submit task ──────────────────────
export function useUpdateMentorTask(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<MentorTaskFormValues>) =>
      updateMentorTask(taskId, data),
    onSuccess: () => {
      toast.success("Task updated and re-submitted for approval.");
      void qc.invalidateQueries({ queryKey: mentorTaskKeys.all });
    },
    onError: (error) =>
      toast.error(
        getApiResponseError(error, { fallback: "Failed to update task" }),
      ),
  });
}

// ─── #3 DELETE /tasks/<task_id>/ — delete pending task ───────────────────────
export function useDeleteMentorTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => deleteMentorTask(taskId),
    onSuccess: () => {
      toast.success("Task deleted.");
      void qc.invalidateQueries({ queryKey: mentorTaskKeys.all });
    },
    onError: (error) =>
      toast.error(
        getApiResponseError(error, { fallback: "Failed to delete task" }),
      ),
  });
}

// ─── #4 GET /activity/ — mentor activity feed ────────────────────────────────
interface UseMentorActivityParams {
  pageIndex?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
}

export function useMentorActivity(params: UseMentorActivityParams = {}) {
  return useQuery({
    queryKey: mentorTaskKeys.activity(params as Record<string, unknown>),
    queryFn: () => fetchMentorActivity(params),
    retry: no403Retry,
    staleTime: 2 * 60 * 1000,
  });
}
