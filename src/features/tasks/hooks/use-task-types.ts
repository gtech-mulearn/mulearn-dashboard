import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  createTaskType,
  deleteTaskType,
  fetchTaskTypes,
  type TaskTypeParams,
  updateTaskType,
} from "../api/task-type.api";
import type { UpdateTaskTypeInput } from "../schemas/task-type.schema";
import { useTaskQueryErrorToast } from "./task-error";

export const useTaskTypes = (
  params: TaskTypeParams,
  options?: { enabled?: boolean },
) => {
  const query = useQuery({
    queryKey: ["task-types", params],
    queryFn: () => fetchTaskTypes(params),
    placeholderData: (prev) => prev,
    ...options,
  });

  useTaskQueryErrorToast(query.error, "Failed to load task types.");
  return query;
};

export const useCreateTaskType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTaskType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-types"], exact: false });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to create task type." }),
      );
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
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to update task type." }),
      );
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
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to delete task type." }),
      );
    },
  });
};
