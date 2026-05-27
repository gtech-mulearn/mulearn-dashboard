"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApiError } from "@/api";
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
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.",
      );
    },
  });
}
