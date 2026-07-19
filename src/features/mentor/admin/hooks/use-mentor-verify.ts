"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  assignMentors,
  revokeMentorAssignment,
} from "../api/mentor-assign.api";
import {
  fetchMentorDetail,
  fetchMentorList,
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
