"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useGoogleCallback } from "@/features/auth";

interface CallbackClientProps {
  code?: string;
  error?: string;
}

export function CallbackClient({ code, error }: CallbackClientProps) {
  const router = useRouter();
  const callbackMutation = useGoogleCallback();
  const hasCalled = useRef(false);

  useEffect(() => {
    if (hasCalled.current) return;

    if (error) {
      toast.error(error || "Google login failed");
      router.push("/login");
      return;
    }

    if (!code) {
      toast.error("No authorization code received");
      router.push("/login");
      return;
    }

    const handleCallback = async () => {
      hasCalled.current = true;
      try {
        await callbackMutation.mutateAsync(code);
        toast.success("Welcome back!");
        router.push("/dashboard");
      } catch (err) {
        console.error("Google callback error:", err);
        toast.error("Failed to authenticate with Google");
        router.push("/login");
      }
    };

    handleCallback();
  }, [code, error, router, callbackMutation]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
      <Spinner className="h-8 w-8 text-primary" />
      <div className="text-center">
        <h1 className="text-xl font-semibold">Authenticating...</h1>
        <p className="text-sm text-muted-foreground">
          Please wait while we sign you in with Google.
        </p>
      </div>
    </div>
  );
}
