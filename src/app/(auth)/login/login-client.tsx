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
import {
  LoginForm,
  OTPLoginForm,
  useLoginWithOTP,
  useLoginWithPassword,
  useRequestOTP,
} from "@/features/auth";
import { getApiResponseError } from "@/hooks/use-get-error";

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
      toast.error(
        getApiResponseError(error, {
          fallback: "Login failed. Please check your credentials.",
        }),
      );
    }
  };

  const handleRequestOTP = async (emailOrMuid: string) => {
    try {
      await requestOTP.mutateAsync(emailOrMuid);
      toast.success("OTP sent to your email!");
    } catch (error) {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to send OTP. Please try again.",
        }),
      );
      throw error; // Re-throw to prevent form from advancing
    }
  };

  const handleVerifyOTP = async (emailOrMuid: string, otp: string) => {
    try {
      await loginWithOTP.mutateAsync({ emailOrMuid, otp });
      toast.success("Welcome back!");
      router.push(getRedirectPath());
    } catch (error) {
      toast.error(
        getApiResponseError(error, {
          fallback: "Invalid OTP. Please try again.",
        }),
      );
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
