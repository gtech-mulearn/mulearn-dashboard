/**
 * IssueVCDialogListener
 *
 * Drop this once anywhere in the achievements layout (or any parent that needs
 * the VC flow). It listens for the "achievement:vc-pending" custom DOM event
 * dispatched by `useClaimAchievement` and opens the IssueVCDialog.
 *
 * This decouples the claim mutation (which runs anywhere) from the dialog
 * (which needs to be rendered in a stable parent).
 */
"use client";

import * as React from "react";
import { IssueVCDialog } from "./issue-vc-dialog";

interface VCPendingDetail {
  achievementId: string;
  achievementName?: string;
}

export function IssueVCDialogListener() {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState<VCPendingDetail | null>(null);

  React.useEffect(() => {
    function handleVCPending(e: Event) {
      const detail = (e as CustomEvent<VCPendingDetail>).detail;
      setPending(detail);
      setOpen(true);
    }

    window.addEventListener("achievement:vc-pending", handleVCPending);
    return () => {
      window.removeEventListener("achievement:vc-pending", handleVCPending);
    };
  }, []);

  if (!pending) return null;

  return (
    <IssueVCDialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setPending(null);
      }}
      achievementId={pending.achievementId}
      achievementName={pending.achievementName}
      onSuccess={() => {
        setOpen(false);
        setPending(null);
      }}
    />
  );
}
