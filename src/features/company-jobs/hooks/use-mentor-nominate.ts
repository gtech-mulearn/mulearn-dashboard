"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  applyAsCompanyMentor,
  fetchCompanyMentors,
  nominateCompanyMentor,
} from "../api";
import type {
  ApplyMentorPayload,
  NominateMentorPayload,
} from "../api/company-mentor.api";

export const COMPANY_MENTOR_KEYS = {
  all: ["company-mentor"] as const,
  nominations: () => [...COMPANY_MENTOR_KEYS.all, "nominations"] as const,
};

export function useCompanyMentorNominations() {
  return useQuery({
    queryKey: COMPANY_MENTOR_KEYS.nominations(),
    queryFn: fetchCompanyMentors,
    refetchOnWindowFocus: false,
  });
}

export function useNominateCompanyMentor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: NominateMentorPayload) =>
      nominateCompanyMentor(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANY_MENTOR_KEYS.all });
      toast.success("Mentor nominated successfully.");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to nominate mentor" }),
      );
    },
  });
}

export function useApplyCompanyMentor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ApplyMentorPayload) => applyAsCompanyMentor(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANY_MENTOR_KEYS.all });
      toast.success(
        "Application submitted successfully. It is pending review by the company owner.",
      );
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to submit application",
        }),
      );
    },
  });
}

// Company owner can still approve/reject via the admin verify endpoint
// (used for nominations from other flows where admin approval is required).
