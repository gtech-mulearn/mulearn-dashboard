"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import { authKeys } from "@/features/auth/hooks/query-keys";
import { profileKeys } from "@/features/profile/hooks/query-keys";
import { changeOrganization } from "@/features/settings";

export function useChangeOrganization() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeOrganization,
    onSuccess: (res) => {
      const msg = res.message?.general?.[0];
      if (res.hasError) {
        toast.error(msg);
        return;
      }
      queryClient.invalidateQueries({ queryKey: authKeys.userInfo() });
      queryClient.invalidateQueries({ queryKey: profileKeys.profile() });
      toast.success(msg);
      router.push("/dashboard/profile");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Something went wrong. Please try again.",
        }),
      );
    },
  });
}
