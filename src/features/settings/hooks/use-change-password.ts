"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { changePassword } from "@/features/settings";

export function useChangePassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: changePassword,
    onSuccess: (res: unknown) => {
      const data = res as { message?: { general?: string[] } };
      const msg = data.message?.general?.[0] || "Password changed successfully";
      toast.success(msg);
      router.push("/dashboard/profile");
    },
    onError: (error: Error) => {
      const msg = error.message || "Something went wrong. Please try again.";
      toast.error(msg);
    },
  });
}
