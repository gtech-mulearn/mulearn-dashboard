"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  COMPANY_KEYS,
  useCompanyProfile,
} from "@/features/company-jobs/hooks/use-company-profile";
import { getApiResponseError } from "@/hooks/use-get-error";
import { updateCompanyProfile } from "../api/company-profile.api";
import type { ProfileEditFormValues } from "../schemas";

export function useUpdateCompanyProfile() {
  const queryClient = useQueryClient();
  const { status } = useCompanyProfile({ enabled: false }); // Just to read the cached status

  return useMutation({
    mutationFn: (payload: Partial<ProfileEditFormValues>) =>
      updateCompanyProfile(payload, status),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.profile() });
      toast.success(res.message);
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update company profile",
        }),
      );
    },
  });
}
