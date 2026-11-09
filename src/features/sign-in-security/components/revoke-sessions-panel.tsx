/**
 * Sign one member out of every device and app (e.g. a lost phone or a takeover).
 *
 * 📍 src/features/sign-in-security/components/revoke-sessions-panel.tsx
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRevokeMemberSessions } from "../hooks";

export function RevokeSessionsPanel() {
  const [muid, setMuid] = useState("");
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);
  const revoke = useRevokeMemberSessions();

  return (
    <section className="space-y-4 rounded-xl border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">Sign a member out everywhere</h2>
        <p className="text-sm text-muted-foreground">
          Ends their sessions on every device and in every app. An access token
          already handed out keeps working for up to 15 minutes.
        </p>
      </div>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (muid.trim()) setConfirming(true);
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="revoke-muid">µID</Label>
          <Input
            id="revoke-muid"
            value={muid}
            onChange={(e) => setMuid(e.target.value)}
            placeholder="e.g. asha-rao@mulearn"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="revoke-reason">Reason (kept in the audit log)</Label>
          <Textarea
            id="revoke-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. reported a lost phone"
            maxLength={500}
          />
        </div>
        <Button
          type="submit"
          variant="destructive"
          disabled={!muid.trim() || revoke.isPending}
        >
          Sign out everywhere
        </Button>
      </form>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`Sign ${muid.trim()} out everywhere?`}
        description="They'll need to sign in again on every device and in every app."
        confirmLabel="Yes, sign them out"
        variant="destructive"
        isPending={revoke.isPending}
        onConfirm={() =>
          revoke.mutate(
            { muid: muid.trim(), reason: reason.trim() || undefined },
            {
              onSuccess: () => {
                setConfirming(false);
                setMuid("");
                setReason("");
              },
            },
          )
        }
      />
    </section>
  );
}
