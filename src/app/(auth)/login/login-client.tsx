/**
 * Login Client Component
 *
 * 📍 src/app/(auth)/login/login-client.tsx
 *
 * Client component with all login logic.
 * Uses TanStack Query hooks for data mutations.
 */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/api";
import {
  LoginForm,
  OTPLoginForm,
  useLoginWithOTP,
  useLoginWithPassword,
  useRequestOTP,
} from "@/features/auth";

interface LoginClientProps {
  redirectUri?: string;
}

export function LoginClient({ redirectUri }: LoginClientProps) {
  const router = useRouter();
  const [loginMode, setLoginMode] = useState<"password" | "otp">("password");

  const loginWithPassword = useLoginWithPassword();
  const loginWithOTP = useLoginWithOTP();
  const requestOTP = useRequestOTP();

  const getRedirectPath = () => {
    if (redirectUri && redirectUri !== "noredirect") {
      return `/${redirectUri}`;
    }
    return "/dashboard";
  };

  const handlePasswordLogin = async (values: {
    emailOrMuid: string;
    password: string;
  }) => {
    try {
      await loginWithPassword.mutateAsync(values);
      toast.success("Welcome back!");
      router.push(getRedirectPath());
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Login failed. Please check your credentials.";
      toast.error(message);
    }
  };

  const handleRequestOTP = async (emailOrMuid: string) => {
    try {
      await requestOTP.mutateAsync(emailOrMuid);
      toast.success("OTP sent to your email!");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Failed to send OTP. Please try again.";
      toast.error(message);
      throw error; // Re-throw to prevent form from advancing
    }
  };

  const handleVerifyOTP = async (emailOrMuid: string, otp: string) => {
    try {
      await loginWithOTP.mutateAsync({ emailOrMuid, otp });
      toast.success("Welcome back!");
      router.push(getRedirectPath());
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Invalid OTP. Please try again.";
      toast.error(message);
    }
  };

  if (loginMode === "otp") {
    return (
      <OTPLoginForm
        onRequestOTP={handleRequestOTP}
        onVerifyOTP={handleVerifyOTP}
        isRequestingOTP={requestOTP.isPending}
        isVerifying={loginWithOTP.isPending}
        onSwitchToPassword={() => setLoginMode("password")}
      />
    );
  }

  return (
    <LoginForm
      onSubmit={handlePasswordLogin}
      isLoading={loginWithPassword.isPending}
      onSwitchToOTP={() => setLoginMode("otp")}
    />
  );
}
