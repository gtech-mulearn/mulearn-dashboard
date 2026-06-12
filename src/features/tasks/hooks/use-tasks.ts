import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTask,
  deleteTask,
  downloadTasksCsv,
  downloadTasksTemplate,
  fetchTaskDetail,
  fetchTaskReferences,
  fetchTasks,
  importTasks,
  type TaskListParams,
  updateTask,
} from "../api/tasks.api";
import type { TaskCreateRequest } from "../schemas/tasks.schema";

export const useTasks = (
  params: TaskListParams,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: () => fetchTasks(params),
    placeholderData: (prev) => prev,
    ...options,
  });
};

export const useTaskDetail = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["task", id],
    queryFn: () => fetchTaskDetail(id),
    ...options,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
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
      queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
      queryClient.invalidateQueries({
        queryKey: ["task", variables.id],
        exact: true,
      });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
    },
  });
};

export const useImportTasks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importTasks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
    },
  });
};

export const useTaskReferences = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["task-references"],
    queryFn: fetchTaskReferences,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
    ...options,
  });
};

export const useDownloadTasksCsv = () => {
  return useMutation({
    mutationFn: downloadTasksCsv,
  });
};

export const useDownloadTasksTemplate = () => {
  return useMutation({
    mutationFn: downloadTasksTemplate,
  });
};
