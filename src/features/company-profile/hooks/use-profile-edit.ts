"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { COMPANY_KEYS } from "@/features/company-jobs/hooks/use-company-profile";
import { updateCompanyProfile } from "../api/company-profile.api";
import type { ProfileEditFormValues } from "../schemas";

export function useUpdateCompanyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<ProfileEditFormValues>) =>
      updateCompanyProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.profile() });
      toast.success("Company profile updated successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to update company profile");
    },
  });
}
