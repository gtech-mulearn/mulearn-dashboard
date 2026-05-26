"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getMentorApplication,
  submitMentorApplication,
  updateMentorApplication,
} from "../api/onboarding.api";
import type { OnboardingFormValues, OnboardingState } from "../schemas";

const ONBOARDING_KEYS = {
  all: ["mentor-onboarding"] as const,
  application: () => [...ONBOARDING_KEYS.all, "application"] as const,
};

const no403Retry = (failureCount: number, error: unknown) => {
  if (
    error instanceof Error &&
    "status" in error &&
    (error as { status: number }).status === 403
  )
    return false;
  return failureCount < 2;
};

export function useMentorApplication(enabled = true) {
  return useQuery({
    queryKey: ONBOARDING_KEYS.application(),
    queryFn: getMentorApplication,
    retry: no403Retry,
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}

export function deriveOnboardingState(
  data: { is_verified: boolean; verified_by_name?: string | null } | undefined,
  error: Error | null,
): OnboardingState {
  if (!data && !error) return "loading";

  if (
    error instanceof Error &&
    "status" in error &&
    (error as { status: number }).status === 400
  )
    return "not_applied";

  if (!data) return "not_applied";

  if (data.is_verified) return "verified";
  if (data.verified_by_name != null) return "rejected";
  return "pending_verification";
}

export function useSubmitMentorApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitMentorApplication,
    onSuccess: () => {
      toast.success("Application submitted! It is now under review.");
      void queryClient.invalidateQueries({ queryKey: ONBOARDING_KEYS.all });
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to submit application"),
  });
}

export function useUpdateMentorApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<OnboardingFormValues>) =>
      updateMentorApplication(data),
    onSuccess: () => {
      toast.success("Application updated.");
      void queryClient.invalidateQueries({ queryKey: ONBOARDING_KEYS.all });
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to update application"),
  });
}
