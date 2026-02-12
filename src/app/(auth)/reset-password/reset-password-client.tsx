/**
 * Reset Password Client Component
 *
 * 📍 src/app/(auth)/reset-password/reset-password-client.tsx
 */

"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  ResetPasswordForm,
  useResetPassword,
  useVerifyResetToken,
} from "@/features/auth";

interface ResetPasswordClientProps {
  token?: string;
}

export function ResetPasswordClient({ token }: ResetPasswordClientProps) {
  const [isSuccess, setIsSuccess] = useState(false);

  const verifyToken = useVerifyResetToken(token || "");
  const resetPassword = useResetPassword();

  // No token provided
  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Invalid Link</CardTitle>
          <CardDescription>
            This password reset link is invalid or missing a token. Please
            request a new password reset.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/forgot-password">Request new link</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Verifying token
  if (verifyToken.isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Spinner className="h-8 w-8 text-primary mb-4" />
          <p className="text-muted-foreground">Verifying your reset link...</p>
        </CardContent>
      </Card>
    );
  }

  // Token invalid
  if (verifyToken.isError) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Link Expired or Invalid
          </CardTitle>
          <CardDescription>
            This password reset link has expired or is invalid. Please request a
            new password reset.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/forgot-password">Request new link</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const handleSubmit = async (password: string) => {
    try {
      await resetPassword.mutateAsync({ token, password });
      setIsSuccess(true);
      toast.success("Password reset successfully!");
    } catch (_error) {
      toast.error("Failed to reset password. Please try again.");
    }
  };

  return (
    <ResetPasswordForm
      onSubmit={handleSubmit}
      isLoading={resetPassword.isPending}
      isSuccess={isSuccess}
      muid={verifyToken.data?.muid}
    />
  );
}
