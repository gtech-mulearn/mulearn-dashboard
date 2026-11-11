"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  type CollaborationPageParams,
  type CollaborationResponseBody,
  createCollaboration,
  discoverCollaborations,
  fetchCollaborations,
  fetchIncomingCollaborations,
  respondCollaboration,
  withdrawCollaboration,
} from "../api";
import type { CollaborationCreatePayload } from "../lib/collaboration-payload";

export const COLLABORATION_KEYS = {
  all: ["company-collaborations"] as const,
  list: (params?: CollaborationPageParams) =>
    [...COLLABORATION_KEYS.all, "list", params ?? {}] as const,
  discover: (params?: CollaborationPageParams) =>
    [...COLLABORATION_KEYS.all, "discover", params ?? {}] as const,
  incoming: () => [...COLLABORATION_KEYS.all, "incoming"] as const,
};

/** Campus/IG lead inbox of collaboration invites (BE-9). */
export function useIncomingCollaborations(enabled = true) {
  return useQuery({
    queryKey: COLLABORATION_KEYS.incoming(),
    queryFn: fetchIncomingCollaborations,
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useCollaborations(params?: CollaborationPageParams) {
  return useQuery({
    queryKey: COLLABORATION_KEYS.list(params),
    queryFn: () => fetchCollaborations(params),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}

export function useDiscoverCollaborations(
  params?: CollaborationPageParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: COLLABORATION_KEYS.discover(params),
    queryFn: () => discoverCollaborations(params),
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}

export function useCreateCollaboration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollaborationCreatePayload) =>
      createCollaboration(payload),
    onSuccess: (_, payload) => {
      toast.success(
        payload.target_org_id
          ? "Invitation sent. You'll be notified when they respond."
          : "Collaboration posted. Campuses and IGs can now discover it.",
      );
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
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: CollaborationResponseBody;
    }) => respondCollaboration(id, body),
    onSuccess: (_, variables) => {
      toast.success(
        !variables.body.accept
          ? "Collaboration declined"
          : variables.body.target_org_id
            ? "Collaboration claimed. The company has been notified."
            : "Collaboration accepted. The company has been notified.",
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

export function useWithdrawCollaboration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => withdrawCollaboration(id),
    onSuccess: () => {
      toast.success("Collaboration withdrawn");
      queryClient.invalidateQueries({ queryKey: COLLABORATION_KEYS.all });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to withdraw collaboration",
        }),
      );
    },
  });
}
