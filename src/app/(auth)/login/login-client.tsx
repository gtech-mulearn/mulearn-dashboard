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
import { sanitizeReturnPath } from "@/lib/auth/return-path";

interface LoginClientProps {
  redirectUri?: string;
}

export function LoginClient({ redirectUri }: LoginClientProps) {
  const router = useRouter();
  const [loginMode, setLoginMode] = useState<"password" | "otp">("password");

  const loginWithPassword = useLoginWithPassword();
  const loginWithOTP = useLoginWithOTP();
  const requestOTP = useRequestOTP();

  // `ruri` arrives from the URL, so it is attacker-controllable — sanitize
  // before redirecting. The sanitizer keeps the query string, which is what
  // carries an OAuth `?code=` back to /dashboard/connect-discord after a
  // login detour.
  const getRedirectPath = () => {
    if (redirectUri && redirectUri !== "noredirect") {
      return `/${sanitizeReturnPath(redirectUri)}`;
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
    } catch {}
  };

  const handleRequestOTP = async (emailOrMuid: string) => {
    await requestOTP.mutateAsync(emailOrMuid);
    toast.success("OTP sent to your email!");
  };

  const handleVerifyOTP = async (emailOrMuid: string, otp: string) => {
    try {
      await loginWithOTP.mutateAsync({ emailOrMuid, otp });
      toast.success("Welcome back!");
      router.push(getRedirectPath());
    } catch {}
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
