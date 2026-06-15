"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
      toast.success("Mentor nominated successfully. Pending admin approval.");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to nominate mentor");
    },
  });
}
