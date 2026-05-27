"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/api";
import {
  createOpportunity,
  deleteOpportunity,
  fetchOpportunities,
  updateOpportunity,
} from "../api/opportunities.api";
import type { OpportunityFormValues } from "../schemas";

const opportunityKeys = {
  all: ["mentor-opportunities"] as const,
  list: (params: Record<string, unknown>) =>
    [...opportunityKeys.all, "list", params] as const,
};

const no403Retry = (failureCount: number, error: unknown) => {
  if ((error as { status?: number })?.status === 403) return false;
  return failureCount < 2;
};

interface UseOpportunitiesParams {
  status?: string;
  page?: number;
  search?: string;
}

export function useOpportunities(params: UseOpportunitiesParams = {}) {
  return useQuery({
    queryKey: opportunityKeys.list(params as Record<string, unknown>),
    queryFn: () => fetchOpportunities(params),
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
        error instanceof ApiError
          ? error.message
          : "Failed to create opportunity",
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
        error instanceof ApiError
          ? error.message
          : "Failed to update opportunity",
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
        error instanceof ApiError
          ? error.message
          : "Failed to delete opportunity",
      ),
  });
}
