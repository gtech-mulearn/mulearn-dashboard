"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import type { OpportunityListParams } from "../api/opportunities.api";
import {
  closeOpportunity,
  createOpportunity,
  deleteOpportunity,
  fetchOpportunities,
  fetchOpportunityDetail,
  fetchPublicOpportunities,
  publishOpportunity,
  updateOpportunity,
} from "../api/opportunities.api";
import type { OpportunityFormValues } from "../schemas";

export const opportunityKeys = {
  all: ["mentor-opportunities"] as const,
  lists: () => [...opportunityKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) =>
    [...opportunityKeys.lists(), params] as const,
  details: () => [...opportunityKeys.all, "detail"] as const,
  detail: (id: string) => [...opportunityKeys.details(), id] as const,
  publicLists: () => [...opportunityKeys.all, "public"] as const,
  publicList: (params: Record<string, unknown>) =>
    [...opportunityKeys.publicLists(), params] as const,
};

const no403Retry = (failureCount: number, error: unknown) => {
  if ((error as { status?: number })?.status === 403) return false;
  return failureCount < 2;
};

export function useOpportunities(params: OpportunityListParams = {}) {
  return useQuery({
    queryKey: opportunityKeys.list(params as Record<string, unknown>),
    queryFn: () => fetchOpportunities(params),
    retry: no403Retry,
  });
}

export function useOpportunityDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: opportunityKeys.detail(id),
    queryFn: () => fetchOpportunityDetail(id),
    enabled: Boolean(id) && enabled,
    retry: no403Retry,
  });
}

export function usePublicOpportunities(params: OpportunityListParams = {}) {
  return useQuery({
    queryKey: opportunityKeys.publicList(params as Record<string, unknown>),
    queryFn: () => fetchPublicOpportunities(params),
    retry: no403Retry,
  });
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: OpportunityFormValues) => createOpportunity(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: opportunityKeys.all });
      toast.success("Opportunity created");
    },
    onError: (error) =>
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to create opportunity",
        }),
      ),
  });
}

export function useUpdateOpportunity(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<OpportunityFormValues>) =>
      updateOpportunity(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: opportunityKeys.all });
      toast.success("Opportunity updated");
    },
    onError: (error) =>
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update opportunity",
        }),
      ),
  });
}

export function useDeleteOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOpportunity(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: opportunityKeys.all });
      toast.success("Opportunity deleted");
    },
    onError: (error) =>
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to delete opportunity",
        }),
      ),
  });
}

export function usePublishOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => publishOpportunity(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: opportunityKeys.all });
      toast.success("Opportunity published");
    },
    onError: (error) =>
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to publish opportunity",
        }),
      ),
  });
}

export function useCloseOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => closeOpportunity(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: opportunityKeys.all });
      toast.success("Opportunity closed");
    },
    onError: (error) =>
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to close opportunity",
        }),
      ),
  });
}
