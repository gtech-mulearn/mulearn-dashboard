/**
 * OTP Login Form Component
 *
 * 📍 src/features/auth/components/otp-login-form.tsx
 *
 * Two-step OTP login form.
 * Step 1: Request OTP with email/muid
 * Step 2: Verify OTP
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

const requestOTPSchema = z.object({
  emailOrMuid: z.string().min(1, "Email or MuID is required"),
});

const verifyOTPSchema = z.object({
  otp: z.string().min(4, "OTP must be at least 4 characters"),
});

type RequestOTPValues = z.infer<typeof requestOTPSchema>;
type VerifyOTPValues = z.infer<typeof verifyOTPSchema>;

interface OTPLoginFormProps {
  onRequestOTP: (emailOrMuid: string) => Promise<void>;
  onVerifyOTP: (emailOrMuid: string, otp: string) => void;
  isRequestingOTP?: boolean;
  isVerifying?: boolean;
  onSwitchToPassword?: () => void;
}

export function OTPLoginForm({
  onRequestOTP,
  onVerifyOTP,
  isRequestingOTP,
  isVerifying,
  onSwitchToPassword,
}: OTPLoginFormProps) {
  const [step, setStep] = useState<"request" | "verify">("request");
  const [emailOrMuid, setEmailOrMuid] = useState("");

  const requestForm = useForm<RequestOTPValues>({
    resolver: zodResolver(requestOTPSchema),
    defaultValues: { emailOrMuid: "" },
  });

  const verifyForm = useForm<VerifyOTPValues>({
    resolver: zodResolver(verifyOTPSchema),
    defaultValues: { otp: "" },
  });

  const handleRequestOTP = async (values: RequestOTPValues) => {
    setEmailOrMuid(values.emailOrMuid);
    await onRequestOTP(values.emailOrMuid);
    setStep("verify");
  };

  const handleVerifyOTP = (values: VerifyOTPValues) => {
    onVerifyOTP(emailOrMuid, values.otp);
  };

  const handleBack = () => {
    setStep("request");
    verifyForm.reset();
  };

  if (step === "verify") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="w-fit -ml-2 mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <CardTitle className="text-2xl font-bold">Enter OTP</CardTitle>
          <CardDescription>
            We&apos;ve sent an OTP to your email. Enter it below to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...verifyForm}>
            <form
              onSubmit={verifyForm.handleSubmit(handleVerifyOTP)}
              className="space-y-4"
            >
              <div className="space-y-2 pb-2">
                <Label htmlFor="otp">OTP</Label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter OTP"
                  disabled={isVerifying}
                  className="flex w-full text-foreground text-center text-lg tracking-widest h-12 rounded-xl border border-gray-200 bg-gray-50/50 outline-none focus:ring-2 focus:ring-primary/50"
                  {...verifyForm.register("otp")}
                />
                {verifyForm.formState.errors.otp && (
                  <p className="text-sm font-medium text-destructive">
                    {verifyForm.formState.errors.otp.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isVerifying}>
                {isVerifying && <Spinner className="mr-2 h-4 w-4" />}
                Verify OTP
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Login with OTP</CardTitle>
        <CardDescription>
          Enter your email or MuID to receive an OTP
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...requestForm}>
          <form
            onSubmit={requestForm.handleSubmit(handleRequestOTP)}
            className="space-y-4"
          >
              <div className="space-y-2 pb-2">
                <Label htmlFor="emailOrMuid">Email or MuID</Label>
                <Input
                  id="emailOrMuid"
                  type="text"
                  placeholder="email@example.com or muid"
                  disabled={isRequestingOTP}
                  className="h-12 rounded-xl border-gray-200 bg-gray-50/50 px-4"
                  {...requestForm.register("emailOrMuid")}
                />
                {requestForm.formState.errors.emailOrMuid && (
                  <p className="text-sm font-medium text-destructive">
                    {requestForm.formState.errors.emailOrMuid.message}
                  </p>
                )}
              </div>

            {onSwitchToPassword && (
              <div className="text-right text-sm">
                <button
                  type="button"
                  onClick={onSwitchToPassword}
                  className="text-primary hover:underline"
                >
                  Login with Password
                </button>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isRequestingOTP}>
              {isRequestingOTP && <Spinner className="mr-2 h-4 w-4" />}
              Request OTP
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
