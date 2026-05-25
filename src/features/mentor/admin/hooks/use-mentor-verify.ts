"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchMentorList, verifyMentor } from "../api/mentor-verify.api";
import type { VerifyActionValues } from "../schemas";

const mentorVerifyKeys = {
  all: ["admin-mentor-list"] as const,
  list: (params: Record<string, unknown>) =>
    [...mentorVerifyKeys.all, "list", params] as const,
};

interface UseMentorListParams {
  search?: string;
  page?: number;
  status?: string;
}

export function useMentorList(params: UseMentorListParams = {}) {
  return useQuery({
    queryKey: mentorVerifyKeys.list(params as Record<string, unknown>),
    queryFn: () => fetchMentorList(params),
  });
}

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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mentorVerifyKeys.all });
      toast.success("Mentor verification updated");
    },
    onError: () => toast.error("Failed to update verification"),
  });
}
