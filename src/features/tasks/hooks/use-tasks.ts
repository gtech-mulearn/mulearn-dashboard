import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { endpoints } from "@/api/endpoints";
import { useCsvDownload } from "@/hooks/use-csv-download";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  createTask,
  deleteTask,
  fetchActiveTasks,
  fetchInactiveTasks,
  fetchPublicTasks,
  fetchTaskDetail,
  fetchTaskReferences,
  importTasks,
  updateTask,
} from "../api/tasks.api";
import type { TaskCreateRequest } from "../schemas/tasks.schema";
import type {
  PublicTaskListParams,
  TaskListParams,
} from "../types/tasks.types";
import { tasksKeys } from "./query-keys";
import { useTaskQueryErrorToast } from "./task-error";

export const useActiveTasks = (
  params: TaskListParams,
  options?: { enabled?: boolean },
) => {
  const query = useQuery({
    queryKey: tasksKeys.active(params),
    queryFn: () => fetchActiveTasks(params),
    placeholderData: (prev) => prev,
    ...options,
  });

  useTaskQueryErrorToast(query.error, "Failed to load tasks.");
  return query;
};

export const useInactiveTasks = (
  params: TaskListParams,
  options?: { enabled?: boolean },
) => {
  const query = useQuery({
    queryKey: tasksKeys.inactive(params),
    queryFn: () => fetchInactiveTasks(params),
    placeholderData: (prev) => prev,
    ...options,
  });

  useTaskQueryErrorToast(query.error, "Failed to load tasks.");
  return query;
};

export const usePublicTasks = (
  params: PublicTaskListParams,
  options?: { enabled?: boolean },
) => {
  const query = useQuery({
    queryKey: ["public-tasks", params],
    queryFn: () => fetchPublicTasks(params),
    placeholderData: (prev) => prev,
    ...options,
  });

  useTaskQueryErrorToast(query.error, "Failed to load public tasks.");
  return query;
};

export const useTaskDetail = (id: string, options?: { enabled?: boolean }) => {
  const query = useQuery({
    queryKey: ["task", id],
    queryFn: () => fetchTaskDetail(id),
    ...options,
  });

  useTaskQueryErrorToast(query.error, "Failed to load task details.");
  return query;
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.all, exact: false });
      queryClient.invalidateQueries({
        queryKey: ["public-tasks"],
        exact: false,
      });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to create task." }),
      );
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<TaskCreateRequest>;
    }) => updateTask(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.all, exact: false });
      queryClient.invalidateQueries({
        queryKey: ["public-tasks"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["task", variables.id],
        exact: true,
      });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to update task." }),
      );
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.all, exact: false });
      queryClient.invalidateQueries({
        queryKey: ["public-tasks"],
        exact: false,
      });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to delete task." }),
      );
    },
  });
};

export const useImportTasks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importTasks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.all, exact: false });
      queryClient.invalidateQueries({
        queryKey: ["public-tasks"],
        exact: false,
      });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to import tasks." }),
      );
    },
  });
};

export const useTaskReferences = (options?: { enabled?: boolean }) => {
  const query = useQuery({
    queryKey: ["task-references"],
    queryFn: fetchTaskReferences,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
    ...options,
  });

  useTaskQueryErrorToast(query.error, "Failed to load task form options.");
  return query;
};

export const useDownloadTasksCsv = () =>
  useCsvDownload(endpoints.admin.tasks.csv, "tasks.csv");

export const useDownloadTasksTemplate = () =>
  useCsvDownload(endpoints.admin.tasks.template, "tasks_template.xlsx");
