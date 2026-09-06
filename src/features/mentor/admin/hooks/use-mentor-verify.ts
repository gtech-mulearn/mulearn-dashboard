"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  assignMentors,
  deactivateMentor,
  reactivateMentor,
  revokeMentorAssignment,
} from "../api/mentor-assign.api";
import {
  fetchMentorChangeRequests,
  fetchMentorDetail,
  fetchMentorList,
  fetchMentorRoster,
  verifyMentor,
} from "../api/mentor-verify.api";
import type { AssignMentorsPayload, VerifyActionValues } from "../schemas";
import { mentorGrantKeys } from "./use-mentor-grants";

export const mentorVerifyKeys = {
  all: ["admin-mentor-list"] as const,
  list: (params: Record<string, unknown>) =>
    [...mentorVerifyKeys.all, "list", params] as const,
  detail: (mentorId: string) =>
    [...mentorVerifyKeys.all, "detail", mentorId] as const,
  roster: (params: Record<string, unknown>) =>
    [...mentorVerifyKeys.all, "roster", params] as const,
  changeRequests: (params: Record<string, unknown>) =>
    [...mentorVerifyKeys.all, "change-requests", params] as const,
};

interface UseMentorListParams {
  search?: string;
  page?: number;
  pageIndex?: number;
  perPage?: number;
  status?: string;
  mentor_tier?: string;
  sortBy?: string;
}

// ─── GET /list/ ───────────────────────────────────────────────────────────────
export function useMentorList(params: UseMentorListParams = {}) {
  return useQuery({
    queryKey: mentorVerifyKeys.list(params as Record<string, unknown>),
    queryFn: () => fetchMentorList(params),
  });
}

// ─── GET /detail/<mentor_id>/ ─────────────────────────────────────────────────
export function useMentorDetail(mentorId: string, enabled = true) {
  return useQuery({
    queryKey: mentorVerifyKeys.detail(mentorId),
    queryFn: () => fetchMentorDetail(mentorId),
    enabled: enabled && !!mentorId,
  });
}

// ─── GET /roster/ ─────────────────────────────────────────────────────────────
// Paginated list of active APPROVED mentors with avg_rating / rating_count.
interface UseMentorRosterParams {
  mentor_tier?: string;
  low_rating?: boolean;
  page?: number;
  per_page?: number;
}

export function useMentorRoster(params: UseMentorRosterParams = {}) {
  return useQuery({
    queryKey: mentorVerifyKeys.roster(params as Record<string, unknown>),
    queryFn: () => fetchMentorRoster(params),
  });
}

// ─── GET /change-requests/ ────────────────────────────────────────────────────
// PENDING applications from users who are already approved for the same tier.
// Identical response shape to /list/ — admin can approve / reject them directly.
interface UseMentorChangeRequestsParams {
  search?: string;
  page?: number;
  perPage?: number;
  mentor_tier?: string;
}

export function useMentorChangeRequests(
  params: UseMentorChangeRequestsParams = {},
) {
  return useQuery({
    queryKey: mentorVerifyKeys.changeRequests(
      params as Record<string, unknown>,
    ),
    queryFn: () => fetchMentorChangeRequests(params),
  });
}

// ─── PATCH /verify/<mentor_id>/ ───────────────────────────────────────────────
// data: { status: "APPROVED" } or { status: "REJECTED", verification_note: "..." }
export function useVerifyMentor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      mentorId,
      data,
    }: {
      mentorId: string;
      data: VerifyActionValues;
    }) => verifyMentor(mentorId, data),
    onSuccess: (_result, { data }) => {
      void queryClient.invalidateQueries({ queryKey: mentorVerifyKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["mentor-onboarding"] });
      toast.success(
        data.status === "APPROVED"
          ? "Mentor approved successfully."
          : "Mentor application rejected.",
      );
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update verification",
        }),
      );
    },
  });
}

// ─── §5.1 POST /admin/assign/ ─────────────────────────────────────────────────
export function useAssignMentors() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignMentorsPayload) => assignMentors(payload),
    onSuccess: (assignedMuids) => {
      void queryClient.invalidateQueries({ queryKey: mentorVerifyKeys.all });
      void queryClient.invalidateQueries({ queryKey: mentorGrantKeys.all });
      toast.success(`${assignedMuids.length} mentor(s) assigned.`);
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to assign mentors" }),
      );
    },
  });
}

// ─── §5.2 DELETE /admin/assign/<muid>/ ────────────────────────────────────────
export function useRevokeMentorAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ muid, mentorTier }: { muid: string; mentorTier?: string }) =>
      revokeMentorAssignment(muid, mentorTier),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mentorVerifyKeys.all });
      void queryClient.invalidateQueries({ queryKey: mentorGrantKeys.all });
      toast.success(
        "Tier revoked. Their profile, employment, and other tiers stay intact.",
      );
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to revoke tier" }),
      );
    },
  });
}

// ─── §5.3 POST /admin/deactivate/<user_mentor_id>/ ───────────────────────────
// Requires a reason string (max 500 chars, enforced by the form).
// On success, invalidates roster + list so the row disappears from Roster tab
// and the All Applications tab reflects the suspended state.
export function useDeactivateMentor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userMentorId,
      reason,
    }: {
      userMentorId: string;
      reason: string;
    }) => deactivateMentor(userMentorId, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mentorVerifyKeys.all });
      toast.success("Mentor deactivated successfully.");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to deactivate mentor" }),
      );
    },
  });
}

// ─── §5.4 POST /admin/reactivate/<user_mentor_id>/ ───────────────────────────
// No payload needed — simply flips is_active back to True.
export function useReactivateMentor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userMentorId: string) => reactivateMentor(userMentorId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mentorVerifyKeys.all });
      toast.success("Mentor reactivated. They can now act as a mentor again.");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to reactivate mentor" }),
      );
    },
  });
}
