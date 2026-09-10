"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  createEventTemplate,
  deleteEventTemplate,
  fetchEventTemplates,
} from "../api";

export const TEMPLATES_KEYS = {
  all: ["company-templates"] as const,
  events: () => [...TEMPLATES_KEYS.all, "events"] as const,
};

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
