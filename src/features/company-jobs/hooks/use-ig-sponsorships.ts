"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  fetchIgSponsorshipMetrics,
  reviewIgSponsorship,
  submitIgSponsorship,
} from "../api";

export const IG_SPONSORSHIP_KEYS = {
  all: ["ig-sponsorships"] as const,
  metrics: (igId: string) =>
    [...IG_SPONSORSHIP_KEYS.all, "metrics", igId] as const,
};

export function useIgSponsorshipMetrics(igId: string) {
  return useQuery({
    queryKey: IG_SPONSORSHIP_KEYS.metrics(igId),
    queryFn: () => fetchIgSponsorshipMetrics(igId),
    enabled: !!igId,
    refetchOnWindowFocus: false,
  });
}

export function useSubmitIgSponsorship() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ igId }: { igId: string }) => submitIgSponsorship(igId),
    onSuccess: (_, variables) => {
      toast.success("Sponsorship proposal submitted");
      queryClient.invalidateQueries({
        queryKey: IG_SPONSORSHIP_KEYS.metrics(variables.igId),
      });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to submit sponsorship proposal",
        }),
      );
    },
  });
}

export function useReviewIgSponsorship() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      igId,
      payload,
    }: {
      igId: string;
      payload: { approve: boolean };
    }) => reviewIgSponsorship(igId, payload),
    onSuccess: (_, variables) => {
      toast.success(
        variables.payload.approve
          ? "Sponsorship approved"
          : "Sponsorship rejected",
      );
      queryClient.invalidateQueries({
        queryKey: IG_SPONSORSHIP_KEYS.metrics(variables.igId),
      });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to review sponsorship proposal",
        }),
      );
    },
  });
}
