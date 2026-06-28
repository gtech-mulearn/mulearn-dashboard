"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { mentorKeys } from "@/features/mentor/hooks";
import { mentorTaskKeys } from "@/features/mentor/tasks/hooks/use-mentor-tasks";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  getMentorApplicationStatus,
  getMentorProfile,
  submitMentorApplication,
  updateMentorApplication,
  updateMentorProfile,
} from "../api/onboarding.api";
import type { MentorProfileWrite, OnboardingState } from "../schemas";

const ONBOARDING_KEYS = {
  all: ["mentor-onboarding"] as const,
  status: () => [...ONBOARDING_KEYS.all, "status"] as const,
  profile: () => [...ONBOARDING_KEYS.all, "profile"] as const,
};

const no403Retry = (failureCount: number, error: unknown) => {
  if (error instanceof Error && "status" in error) {
    const status = (error as { status: number }).status;
    if (status === 403 || status === 404 || status === 400) {
      return false;
    }
  }
  return failureCount < 2;
};

// ─── GET /status/ ─────────────────────────────────────────────────────────────
export function useMentorApplicationStatus(enabled = true) {
  return useQuery({
    queryKey: ONBOARDING_KEYS.status(),
    queryFn: getMentorApplicationStatus,
    retry: no403Retry,
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}

// ─── GET /profile/ ────────────────────────────────────────────────────────────
export function useMentorProfile(enabled = true) {
  return useQuery({
    queryKey: ONBOARDING_KEYS.profile(),
    queryFn: getMentorProfile,
    retry: no403Retry,
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}

// ─── Derive UI state from status string (PENDING | APPROVED | REJECTED) ───────
export function deriveOnboardingState(
  data: { status?: string; verification_note?: string | null } | undefined,
  error: Error | null,
): OnboardingState {
  if (!data && !error) return "loading";

  // 400 = no application found yet
  if (
    error instanceof Error &&
    "status" in error &&
    (error as { status: number }).status === 400
  )
    return "not_applied";

  if (!data) return "not_applied";

  if (data.status === "APPROVED") return "verified";
  if (data.status === "REJECTED") return "rejected";
  if (data.status === "PENDING") return "pending_verification";

  return "not_applied";
}

// ─── POST /register/ ──────────────────────────────────────────────────────────
export function useSubmitMentorApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitMentorApplication,
    onSuccess: () => {
      toast.success("Application submitted! It is now under review.");
      void queryClient.invalidateQueries({ queryKey: ONBOARDING_KEYS.all });
    },
    onError: (error) =>
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to submit application",
        }),
      ),
  });
}

// ─── PATCH /register/ ─────────────────────────────────────────────────────────
export function useUpdateMentorApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<MentorProfileWrite>) =>
      updateMentorApplication(data),
    onSuccess: () => {
      toast.success("Application updated.");
      void queryClient.invalidateQueries({ queryKey: ONBOARDING_KEYS.all });
    },
    onError: (error) =>
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update application",
        }),
      ),
  });
}

// ─── PATCH /profile/ ──────────────────────────────────────────────────────────
export function useUpdateMentorProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<MentorProfileWrite>) =>
      updateMentorProfile(data),
    onSuccess: () => {
      toast.success("Profile updated.");
      void queryClient.invalidateQueries({ queryKey: ONBOARDING_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: mentorKeys.overview() });
      void queryClient.invalidateQueries({
        queryKey: mentorTaskKeys.igDropdown(),
      });
    },
    onError: (error) =>
      toast.error(
        getApiResponseError(error, { fallback: "Failed to update profile" }),
      ),
  });
}

// ─── Backward compat alias ────────────────────────────────────────────────────
export const useMentorApplication = useMentorApplicationStatus;
