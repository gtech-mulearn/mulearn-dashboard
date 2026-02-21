/**
 * Forgot Password Client Component
 *
 * 📍 src/app/(auth)/forgot-password/forgot-password-client.tsx
 */

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/api";
import { ForgotPasswordForm, useForgotPassword } from "@/features/auth";

export function ForgotPasswordClient() {
  const [isSuccess, setIsSuccess] = useState(false);
  const forgotPassword = useForgotPassword();

  const handleSubmit = async (emailOrMuid: string) => {
    try {
      await forgotPassword.mutateAsync(emailOrMuid);
      setIsSuccess(true);
      toast.success("Reset link sent to your email!");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Failed to send reset link. Please check your email/MuID.";
      toast.error(message);
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
