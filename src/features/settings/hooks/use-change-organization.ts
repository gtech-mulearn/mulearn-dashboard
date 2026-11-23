"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { profileKeys } from "@/features/profile";
import { changeOrganization } from "@/features/settings";
import { getApiResponseError } from "@/hooks/use-get-error";
import { userInfoKey } from "@/lib/auth/user-info";

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
      queryClient.invalidateQueries({ queryKey: userInfoKey() });
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
