"use client";

import { useState } from "react";
import { toast } from "sonner";
import { getApiErrorCode, getApiErrorNumber } from "@/api/errors";
import { Button } from "@/components/ui/button";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  useConfirmEmailVerification,
  useRequestEmailVerification,
} from "../hooks";
import { useCountdown } from "../hooks/use-countdown";
import { codeErrorMessage, maskEmail } from "../utils";
import { EmailCodeForm } from "./email-code-form";

interface EmailVerifyPanelProps {
  email: string;
  onVerified?: () => void;
}

/** Verify the current email inline. Used by the dialog and partner consent. */
export function EmailVerifyPanel({ email, onVerified }: EmailVerifyPanelProps) {
  const requestCode = useRequestEmailVerification();
  const confirmCode = useConfirmEmailVerification();
  const { remaining, start } = useCountdown();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const send = () => {
    setError(null);
    requestCode.mutate(undefined, {
      onSuccess: (result) => {
        if ("already_verified" in result) {
          onVerified?.();
          return;
        }
        setSentTo(result.sent_to);
        start(result.resend_after);
      },
      onError: (err) => {
        const retryAfter = getApiErrorNumber(err, "retry_after");
        if (retryAfter) start(retryAfter);
        if (getApiErrorCode(err) === "code_cooldown") {
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
  };

  const confirm = (code: string) => {
    setError(null);
    confirmCode.mutate(code, {
      onSuccess: () => {
        toast.success("Email verified");
        onVerified?.();
      },
      onError: (err) => setError(codeErrorMessage(err)),
    });
  };

  if (!sentTo) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          We&apos;ll email a 6-digit code to{" "}
          <span className="font-medium text-foreground break-all">{email}</span>{" "}
          to confirm it&apos;s yours.
        </p>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <Button
          type="button"
          onClick={send}
          disabled={requestCode.isPending || remaining > 0}
        >
          {requestCode.isPending ? "Sending…" : "Send code"}
        </Button>
      </div>
    );
  }

  return (
    <EmailCodeForm
      sentTo={sentTo}
      onSubmit={confirm}
      onResend={send}
      resendIn={remaining}
      isSubmitting={confirmCode.isPending}
      isResending={requestCode.isPending}
      error={error}
    />
  );
}
