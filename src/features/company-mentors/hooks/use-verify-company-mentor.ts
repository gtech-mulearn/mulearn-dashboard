"use client";

// Approve or reject a company's mentor nomination. Moved here from company-jobs for dashboard
// issue 0010: it is the only part of company-jobs that called mentor, and company-jobs and mentor
// importing each other made an import cycle. Only this feature's MentorsPage uses it.

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { COMPANY_MENTOR_KEYS } from "@/features/company-jobs";
import { verifyMentor } from "@/features/mentor";
import { getApiResponseError } from "@/hooks/use-get-error";

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
