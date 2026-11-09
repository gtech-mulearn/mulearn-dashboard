"use client";

import { MailWarning } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useEmailVerificationStatus } from "../hooks";
import { EmailVerifyDialog } from "./email-verify-dialog";

/** Spec A §3.4: a compact prompt on your own profile until the email is verified. */
export function EmailVerificationNudge() {
  const { data: status } = useEmailVerificationStatus();
  const [open, setOpen] = useState(false);

  if (!status || status.verified) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 sm:flex-row sm:items-center">
      <MailWarning
        className="h-5 w-5 shrink-0 text-warning"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">Your email isn&apos;t verified</p>
        <p className="text-xs text-muted-foreground">
          Verify <span className="break-all">{status.email}</span> to use
          features that share it with partner apps.
        </p>
      </div>
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        Verify
      </Button>
      <EmailVerifyDialog
        open={open}
        onOpenChange={setOpen}
        email={status.email}
      />
    </div>
  );
}
