"use client";

import { useId, useState } from "react";
import { toast } from "sonner";
import { getApiErrorNumber } from "@/api/errors";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiResponseError } from "@/hooks/use-get-error";
import { useConfirmEmailChange, useRequestEmailChange } from "../hooks";
import { useCountdown } from "../hooks/use-countdown";
import { codeErrorMessage } from "../utils";
import { EmailCodeForm } from "./email-code-form";

interface ChangeEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEmail: string;
  hasPassword: boolean;
}

/** Spec A §3.5: the new address proves itself before it replaces the old one. */
export function ChangeEmailDialog({
  open,
  onOpenChange,
  currentEmail,
  hasPassword,
}: ChangeEmailDialogProps) {
  const requestChange = useRequestEmailChange();
  const confirmChange = useConfirmEmailChange();
  const { remaining, start } = useCountdown();
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const emailId = useId();
  const passwordId = useId();

  const close = (next: boolean) => {
    if (!next) {
      setNewEmail("");
      setPassword("");
      setSentTo(null);
      setError(null);
    }
    onOpenChange(next);
  };

  const request = () => {
    setError(null);
    requestChange.mutate(
      { newEmail, currentPassword: hasPassword ? password : undefined },
      {
        onSuccess: (sent) => {
          setSentTo(sent.sent_to);
          start(sent.resend_after);
        },
        onError: (err) => {
          const retryAfter = getApiErrorNumber(err, "retry_after");
          if (retryAfter) start(retryAfter);
          setError(
            getApiResponseError(err, {
              fallback: "We couldn't send the code. Please try again.",
            }),
          );
        },
      },
    );
  };

  const confirm = (code: string) => {
    setError(null);
    confirmChange.mutate(code, {
      onSuccess: (result) => {
        toast.success(`Your email is now ${result.email}`);
        close(false);
      },
      onError: (err) => setError(codeErrorMessage(err)),
    });
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change email</DialogTitle>
          <DialogDescription>
            Your current address, {currentEmail}, stays active until the new one
            is confirmed.
          </DialogDescription>
        </DialogHeader>

        {sentTo ? (
          <EmailCodeForm
            sentTo={sentTo}
            onSubmit={confirm}
            onResend={request}
            resendIn={remaining}
            isSubmitting={confirmChange.isPending}
            isResending={requestChange.isPending}
            error={error}
            onEditEmail={() => {
              setSentTo(null);
              setError(null);
            }}
            submitLabel="Confirm new email"
          />
        ) : (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              request();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor={emailId}>New email</Label>
              <Input
                id={emailId}
                type="email"
                autoComplete="email"
                required
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
              />
            </div>
            {hasPassword ? (
              <div className="space-y-2">
                <Label htmlFor={passwordId}>Current password</Label>
                <Input
                  id={passwordId}
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
            ) : null}
            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => close(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !newEmail.trim() ||
                  (hasPassword && !password) ||
                  requestChange.isPending ||
                  remaining > 0
                }
              >
                {requestChange.isPending ? "Sending…" : "Send code"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
