import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTaskType,
  deleteTaskType,
  fetchTaskTypes,
  type TaskTypeParams,
  updateTaskType,
} from "../api/task-type.api";
import type {
  CreateTaskTypeInput,
  UpdateTaskTypeInput,
} from "../schemas/task-type.schema";

export const useTaskTypes = (
  params: TaskTypeParams,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["task-types", params],
    queryFn: () => fetchTaskTypes(params),
    placeholderData: (prev) => prev,
    ...options,
  });
};

export const useCreateTaskType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTaskType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-types"], exact: false });
    },
  });
};

export const useUpdateTaskType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskTypeInput }) =>
      updateTaskType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-types"], exact: false });
    },
  });
};

export const useDeleteTaskType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTaskType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-types"], exact: false });
    },
  });
};
