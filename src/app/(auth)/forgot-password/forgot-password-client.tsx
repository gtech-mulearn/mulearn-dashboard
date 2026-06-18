/**
 * Forgot Password Client Component
 *
 * 📍 src/app/(auth)/forgot-password/forgot-password-client.tsx
 */

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ForgotPasswordForm, useForgotPassword } from "@/features/auth";
import { getApiResponseError } from "@/hooks/use-get-error";

export function ForgotPasswordClient() {
  const [isSuccess, setIsSuccess] = useState(false);
  const forgotPassword = useForgotPassword();

  const handleSubmit = async (emailOrMuid: string) => {
    try {
      await forgotPassword.mutateAsync(emailOrMuid);
      setIsSuccess(true);
      toast.success("Reset link sent to your email!");
    } catch (error) {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to send reset link. Please check your email/MuID.",
        }),
      );
    }
  };

  return (
    <ForgotPasswordForm
      onSubmit={handleSubmit}
      isLoading={forgotPassword.isPending}
      isSuccess={isSuccess}
    />
  );
}
