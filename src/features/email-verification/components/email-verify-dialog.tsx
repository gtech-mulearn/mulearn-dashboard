"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmailVerifyPanel } from "./email-verify-panel";

interface EmailVerifyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
}

export function EmailVerifyDialog({
  open,
  onOpenChange,
  email,
}: EmailVerifyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify your email</DialogTitle>
          <DialogDescription>
            Confirm you own this address. It takes a minute.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <EmailVerifyPanel
            email={email}
            onVerified={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
