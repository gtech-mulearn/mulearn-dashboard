/**
 * Register Client Component
 *
 * 📍 src/app/(auth)/register/register-client.tsx
 */

"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApiError } from "@/api";
import { RegisterForm, useRegister } from "@/features/auth";

interface RegisterClientProps {
  redirectUri?: string;
  referralId?: string;
}

export function RegisterClient({
  redirectUri,
  referralId,
}: RegisterClientProps) {
  const router = useRouter();
  const register = useRegister();

  const handleSubmit = async (values: {
    fullName: string;
    email: string;
    password: string;
  }) => {
    try {
      await register.mutateAsync({
        user: {
          full_name: values.fullName,
          email: values.email,
          password: values.password,
        },
        referral: referralId ? { muid: referralId } : undefined,
      });

      toast.success("Account created successfully!");

      // Navigate to onboarding
      const redirectPath = redirectUri
        ? `/onboarding/organization?ruri=${redirectUri}`
        : "/onboarding/organization";
      router.push(redirectPath);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Registration failed. Please try again.";
      toast.error(message);
    }
  };

  return (
    <RegisterForm onSubmit={handleSubmit} isLoading={register.isPending} />
  );
}
