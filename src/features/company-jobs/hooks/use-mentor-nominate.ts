"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { verifyMentor } from "@/features/mentor/admin/api/mentor-verify.api";
import { getApiResponseError } from "@/hooks/use-get-error";
import { fetchCompanyMentors, nominateCompanyMentor } from "../api";
import type { NominateMentorPayload } from "../api/company-mentor.api";

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

// §3.1: the owning company user may approve/reject their own COMPANY_MENTOR
// nominations directly (same endpoint the admin verification flow uses).
export function useVerifyCompanyMentor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      mentorId,
      status,
      verification_note,
    }: {
      mentorId: string;
      status: "APPROVED" | "REJECTED";
      verification_note?: string;
    }) => verifyMentor(mentorId, { status, verification_note }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: COMPANY_MENTOR_KEYS.all });
      toast.success(
        vars.status === "APPROVED"
          ? "Mentor approved — they now hold company-mentor scope."
          : "Nomination rejected.",
      );
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Verification failed" }),
      );
    },
  });
}
