"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchLearnerApplications,
  resubmitApplication,
  withdrawApplication,
} from "../api";

export const LEARNER_APPLICATIONS_KEYS = {
  all: ["learner-applications"] as const,
  list: (params?: {
    search?: string;
    sortBy?: string;
    pageIndex?: number;
    perPage?: number;
  }) => [...LEARNER_APPLICATIONS_KEYS.all, "list", params ?? {}] as const,
};

export function useLearnerApplications(params?: {
  search?: string;
  sortBy?: string;
  pageIndex?: number;
  perPage?: number;
}) {
  return useQuery({
    queryKey: LEARNER_APPLICATIONS_KEYS.list(params),
    queryFn: () => fetchLearnerApplications(params),
    refetchOnWindowFocus: false,
  });
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appId: string) => withdrawApplication(appId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: LEARNER_APPLICATIONS_KEYS.all,
      });
      toast.success("Application withdrawn successfully");
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.message?.general?.[0] ||
          "Failed to withdraw application",
      );
    },
  });
}

export function useResubmitApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      appId,
      payload,
    }: {
      appId: string;
      payload: { resume_link?: string; cover_letter?: string };
    }) => resubmitApplication(appId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: LEARNER_APPLICATIONS_KEYS.all,
      });
      toast.success("Application resubmitted successfully");
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.message?.general?.[0] ||
          err?.response?.message ||
          "Failed to resubmit application",
      );
    },
  });
}
