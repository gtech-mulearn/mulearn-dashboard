"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/api";
import {
  fetchMentorDetail,
  fetchMentorList,
  verifyMentor,
} from "../api/mentor-verify.api";
import type { VerifyActionValues } from "../schemas";

const mentorVerifyKeys = {
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
      toast.success(
        data.status === "APPROVED"
          ? "Mentor approved successfully."
          : "Mentor application rejected.",
      );
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to update verification",
      ),
  });
}
