"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  cancelCollaboration,
  createCollaboration,
  discoverCollaborations,
  fetchCollaborations,
  respondCollaboration,
} from "../api";

export const COLLABORATION_KEYS = {
  all: ["company-collaborations"] as const,
  list: () => [...COLLABORATION_KEYS.all, "list"] as const,
  discover: () => [...COLLABORATION_KEYS.all, "discover"] as const,
};

export function useCollaborations() {
  return useQuery({
    queryKey: COLLABORATION_KEYS.list(),
    queryFn: fetchCollaborations,
    refetchOnWindowFocus: false,
  });
}

export function useDiscoverCollaborations() {
  return useQuery({
    queryKey: COLLABORATION_KEYS.discover(),
    queryFn: discoverCollaborations,
    refetchOnWindowFocus: false,
  });
}

export function useCreateCollaboration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      title: string;
      description: string;
      collaboration_type: string;
      partner_company_id?: string;
    }) => createCollaboration(payload),
    onSuccess: () => {
      toast.success("Collaboration created successfully");
      queryClient.invalidateQueries({ queryKey: COLLABORATION_KEYS.all });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to create collaboration",
        }),
      );
    },
  });
}

export function useRespondCollaboration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, accept }: { id: string; accept: boolean }) =>
      respondCollaboration(id, accept),
    onSuccess: (_, variables) => {
      toast.success(
        variables.accept
          ? "Collaboration accepted"
          : "Collaboration response recorded",
      );
      queryClient.invalidateQueries({ queryKey: COLLABORATION_KEYS.all });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to respond to collaboration",
        }),
      );
    },
  });
}

export function useCancelCollaboration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelCollaboration(id),
    onSuccess: () => {
      toast.success("Collaboration cancelled");
      queryClient.invalidateQueries({ queryKey: COLLABORATION_KEYS.all });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to cancel collaboration",
        }),
      );
    },
  });
}
