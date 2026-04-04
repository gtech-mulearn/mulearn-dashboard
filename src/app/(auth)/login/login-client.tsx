/**
 * Login Client Component
 *
 * 📍 src/app/(auth)/login/login-client.tsx
 *
 * Client component with all login logic.
 * Uses TanStack Query hooks for data mutations.
 */

"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { appleAuthHelpers } from "react-apple-signin-auth";
import Script from "next/script";
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
  useLoginWithGoogle,
  useLoginWithApple,
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
  const loginWithGoogle = useLoginWithGoogle();
  const loginWithApple = useLoginWithApple();

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

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await loginWithGoogle.mutateAsync({
          access_token: tokenResponse.access_token,
        });
        toast.success("Welcome back!");
        router.push(getRedirectPath());
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : "Google Login failed. Please try again.";
        toast.error(message);
      }
    },
    onError: () => {
      toast.error("Google login failed. Please try again.");
    },
  });

  const handleGoogleLogin = () => {
    googleLogin();
  };

  const handleAppleLogin = async () => {
    try {
      const response = await appleAuthHelpers.signIn({
        authOptions: {
          clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || "",
          scope: "email name",
          redirectURI:
            typeof window !== "undefined" ? window.location.origin : "",
          usePopup: true,
        },
      });

      if (response && response.authorization) {
        await loginWithApple.mutateAsync(response.authorization);
        toast.success("Welcome back!");
        router.push(getRedirectPath());
      } else {
        toast.error("Apple Login failed. No authorization returned.");
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else if (error && typeof error === "object" && "error" in error) {
        toast.error(`Apple Login failed: ${String((error as any).error)}`);
      } else {
        toast.error(
          "Apple SDK hasn't fully loaded yet or login was cancelled. Please try again.",
        );
      }
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
    <>
      <Script
        src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
        strategy="lazyOnload"
      />
      <LoginForm
        onSubmit={handlePasswordLogin}
        isLoading={loginWithPassword.isPending}
        onSwitchToOTP={() => setLoginMode("otp")}
        onGoogleLogin={handleGoogleLogin}
        onAppleLogin={handleAppleLogin}
        isGoogleLoading={loginWithGoogle.isPending}
        isAppleLoading={loginWithApple.isPending}
      />
    </>
  );
}
