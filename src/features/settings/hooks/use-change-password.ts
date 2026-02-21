"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { changePassword } from "@/features/settings";

export function useChangePassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: changePassword,
    onSuccess: (res: any) => {
      const msg = res.message?.general?.[0] || "Password changed successfully";
      toast.success(msg);
      router.push("/dashboard/profile");
    },
    onError: (error: any) => {
      const msg = error.message || "Something went wrong. Please try again.";
      toast.error(msg);
    },
  });
}
