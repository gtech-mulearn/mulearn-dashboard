"use client";

import { Loader2 } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCountdown } from "../hooks/use-countdown";
import { CODE_LENGTH, CodeInput } from "./code-input";

export interface EmailCodeFormProps {
  /** Masked address the code went to, e.g. a•••@gmail.com */
  sentTo: string;
  onSubmit: (code: string) => void;
  onResend: () => void;
  /** Seconds until a new code may be requested (0 = now). */
  resendIn: number;
  isSubmitting?: boolean;
  isResending?: boolean;
  error?: string | null;
  onEditEmail?: () => void;
  submitLabel?: string;
}

export function EmailCodeForm({
  sentTo,
  onSubmit,
  onResend,
  resendIn,
  isSubmitting = false,
  isResending = false,
  error,
  onEditEmail,
  submitLabel = "Verify",
}: EmailCodeFormProps) {
  const [code, setCode] = useState("");
  const errorId = useId();

  const submit = (value: string) => {
    if (value.length === CODE_LENGTH && !isSubmitting) onSubmit(value);
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        submit(code);
      }}
    >
      <p className="text-sm text-muted-foreground">
        We sent a 6-digit code to{" "}
        <span className="font-medium text-foreground">{sentTo}</span>. It
        expires in 10 minutes.
      </p>

      <CodeInput
        value={code}
        onChange={setCode}
        onComplete={submit}
        invalid={Boolean(error)}
        disabled={isSubmitting}
        autoFocus
        describedBy={error ? errorId : undefined}
      />

      {error ? (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        className="w-full"
        disabled={code.length !== CODE_LENGTH || isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {submitLabel}
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <button
          type="button"
          onClick={onResend}
          disabled={resendIn > 0 || isResending}
          className="font-medium text-primary disabled:cursor-not-allowed disabled:text-muted-foreground"
        >
          {resendIn > 0
            ? `Resend code in ${formatCountdown(resendIn)}`
            : isResending
              ? "Sending…"
              : "Resend code"}
        </button>
        {onEditEmail ? (
          <button
            type="button"
            onClick={onEditEmail}
            className="text-muted-foreground underline-offset-4 hover:underline"
          >
            Wrong email? Edit
          </button>
        ) : null}
      </div>

      {/* Announce only the transition, not every tick. */}
      <p aria-live="polite" className="sr-only">
        {resendIn > 0
          ? "You can request a new code shortly."
          : "You can request a new code now."}
      </p>
    </form>
  );
}
