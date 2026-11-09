"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { getApiErrorCode, getApiErrorNumber } from "@/api/errors";
import { Button } from "@/components/ui/button";
import { getApiResponseError } from "@/hooks/use-get-error";
import { useSendSignupCode, useVerifySignupCode } from "../hooks";
import { useCountdown } from "../hooks/use-countdown";
import { codeErrorMessage, maskEmail } from "../utils";
import { EmailCodeForm } from "./email-code-form";

interface SignupEmailVerifyStepProps {
  email: string;
  onVerified: (token: string) => void;
  onEditEmail: () => void;
}

/** Spec A §3.3: prove the inbox before the account exists. */
export function SignupEmailVerifyStep({
  email,
  onVerified,
  onEditEmail,
}: SignupEmailVerifyStepProps) {
  const sendCode = useSendSignupCode();
  const verifyCode = useVerifySignupCode();
  const { remaining, start } = useCountdown();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailTaken, setEmailTaken] = useState(false);
  const requestedFor = useRef<string | null>(null);
  const send = sendCode.mutate;

  const requestCode = useCallback(() => {
    setError(null);
    send(email, {
      onSuccess: (sent) => {
        setSentTo(sent.sent_to);
        start(sent.resend_after);
      },
      onError: (err) => {
        const code = getApiErrorCode(err);
        if (code === "email_taken") {
          setEmailTaken(true);
          return;
        }
        const retryAfter = getApiErrorNumber(err, "retry_after");
        if (retryAfter) start(retryAfter);
        if (code === "code_cooldown") {
          // A code was already sent moments ago; let them use it.
          setSentTo((current) => current ?? maskEmail(email));
          return;
        }
        setError(
          getApiResponseError(err, {
            fallback: "We couldn't send the code. Please try again.",
          }),
        );
      },
    });
  }, [email, send, start]);

  useEffect(() => {
    // StrictMode mounts, unmounts and remounts in development. A mutation
    // started inside that window loses its observer (TanStack Query detaches
    // it on unsubscribe), so its callbacks never run. Start it after the
    // remount instead, and only once per address.
    const timer = setTimeout(() => {
      if (requestedFor.current === email) return;
      requestedFor.current = email;
      requestCode();
    }, 0);
    return () => clearTimeout(timer);
  }, [email, requestCode]);

  const handleSubmit = (code: string) => {
    setError(null);
    verifyCode.mutate(
      { email, code },
      {
        onSuccess: (result) => onVerified(result.email_verification_token),
        onError: (err) => setError(codeErrorMessage(err)),
      },
    );
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          Confirm this address to create your µLearn account.
        </p>
      </div>

      {emailTaken ? (
        <div className="space-y-4">
          <p className="text-sm">
            An account with{" "}
            <span className="font-medium break-all">{email}</span> already
            exists.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button type="button" variant="outline" onClick={onEditEmail}>
              Use a different email
            </Button>
          </div>
        </div>
      ) : sentTo ? (
        <EmailCodeForm
          sentTo={sentTo}
          onSubmit={handleSubmit}
          onResend={requestCode}
          resendIn={remaining}
          isSubmitting={verifyCode.isPending}
          isResending={sendCode.isPending}
          error={error}
          onEditEmail={onEditEmail}
          submitLabel="Verify and continue"
        />
      ) : (
        <div className="space-y-3">
          {error ? (
            <>
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
              <Button
                type="button"
                onClick={requestCode}
                disabled={sendCode.isPending || remaining > 0}
              >
                Try again
              </Button>
            </>
          ) : (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Sending a code to{" "}
              {email}…
            </p>
          )}
          <button
            type="button"
            onClick={onEditEmail}
            className="block text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Wrong email? Edit
          </button>
        </div>
      )}
    </div>
  );
}
