"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  createEventTemplate,
  createTaskTemplate,
  deleteEventTemplate,
  deleteTaskTemplate,
  fetchEventTemplates,
  fetchTaskTemplates,
} from "../api";
import type { TaskTemplate } from "../types";

export const TEMPLATES_KEYS = {
  all: ["company-templates"] as const,
  tasks: () => [...TEMPLATES_KEYS.all, "tasks"] as const,
  events: () => [...TEMPLATES_KEYS.all, "events"] as const,
};

export function useTaskTemplates() {
  return useQuery({
    queryKey: TEMPLATES_KEYS.tasks(),
    queryFn: fetchTaskTemplates,
    refetchOnWindowFocus: false,
  });
}

export function useCreateTaskTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<TaskTemplate, "id" | "created_at">) =>
      createTaskTemplate(payload),
    onSuccess: () => {
      toast.success("Task template created");
      queryClient.invalidateQueries({ queryKey: TEMPLATES_KEYS.tasks() });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to create task template",
        }),
      );
    },
  });
}

export function useDeleteTaskTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) => deleteTaskTemplate(templateId),
    onSuccess: () => {
      toast.success("Task template deleted");
      queryClient.invalidateQueries({ queryKey: TEMPLATES_KEYS.tasks() });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to delete task template",
        }),
      );
    },
  });
}

export function useEventTemplates() {
  return useQuery({
    queryKey: TEMPLATES_KEYS.events(),
    queryFn: fetchEventTemplates,
    refetchOnWindowFocus: false,
  });
}

export function useCreateEventTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      title: string;
      description?: string;
      event_type: string;
      default_duration_minutes?: number;
      mode?: string;
    }) => createEventTemplate(payload),
    onSuccess: () => {
      toast.success("Event template created");
      queryClient.invalidateQueries({ queryKey: TEMPLATES_KEYS.events() });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to create event template",
        }),
      );
    },
  });
}

export function useDeleteEventTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) => deleteEventTemplate(templateId),
    onSuccess: () => {
      toast.success("Event template deleted");
      queryClient.invalidateQueries({ queryKey: TEMPLATES_KEYS.events() });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to delete event template",
        }),
      );
    },
  });
}
