"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  addLearnerToShortlist,
  fetchShortlistedLearners,
  fetchTalentPoolInsights,
  removeLearnerFromShortlist,
} from "../api";

export const SHORTLIST_KEYS = {
  all: ["company-shortlist"] as const,
  list: () => [...SHORTLIST_KEYS.all, "list"] as const,
  insights: () => [...SHORTLIST_KEYS.all, "insights"] as const,
};

export function useShortlistedLearners() {
  return useQuery({
    queryKey: SHORTLIST_KEYS.list(),
    queryFn: fetchShortlistedLearners,
    refetchOnWindowFocus: false,
  });
}

export function useTalentPoolInsights() {
  return useQuery({
    queryKey: SHORTLIST_KEYS.insights(),
    queryFn: fetchTalentPoolInsights,
    refetchOnWindowFocus: false,
  });
}

export function useAddLearnerToShortlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, note }: { userId: string; note?: string }) =>
      addLearnerToShortlist(userId, note),
    onSuccess: () => {
      toast.success("Learner added to shortlist");
      queryClient.invalidateQueries({ queryKey: SHORTLIST_KEYS.list() });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to add learner to shortlist",
        }),
      );
    },
  });
}

export function useRemoveLearnerFromShortlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeLearnerFromShortlist(userId),
    onSuccess: () => {
      toast.success("Learner removed from shortlist");
      queryClient.invalidateQueries({ queryKey: SHORTLIST_KEYS.list() });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to remove learner from shortlist",
        }),
      );
    },
  });
}
