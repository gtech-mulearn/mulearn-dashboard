/**
 * Invite Link Page Component
 *
 * 📍 src/features/learning-circle/components/invite-link-view.tsx
 *
 * Shows an invitation via shareable link and lets
 * the user accept or reject it.
 */

"use client";

import { Check, Loader2, PartyPopper, Users, X } from "lucide-react";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { useInviteByLink, useRespondToInviteByLink } from "../hooks";

interface InviteLinkViewProps {
  linkId: string;
}

export function InviteLinkView({ linkId }: InviteLinkViewProps) {
  const { data: invite, isLoading, isError } = useInviteByLink(linkId);
  const respondToInvite = useRespondToInviteByLink();

  const handleRespond = (isAccepted: boolean) => {
    respondToInvite.mutate({
      linkId,
      data: { action: isAccepted ? "accept" : "reject" },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isError || !invite) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
          <X className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-lg font-bold text-foreground">
          Invalid or Expired Link
        </p>
        <p className="text-[13px] text-muted-foreground">
          This invitation is no longer available
        </p>
        <Link
          href="/dashboard/learning-circle"
          className="mt-2 rounded-full bg-foreground px-5 py-2.5 text-[13px] font-semibold text-background transition-all hover:bg-foreground/90 hover:shadow-md"
        >
          Browse Circles
        </Link>
      </div>
    );
  }

  if (respondToInvite.isSuccess) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-success shadow-[0_8px_30px_rgba(16,185,129,0.25)]">
            <PartyPopper className="h-9 w-9 text-primary-foreground" />
          </div>
          <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-card shadow-md">
            <Check className="h-4 w-4 text-success" />
          </div>
        </div>
        <p className="text-xl font-extrabold text-foreground">
          Response Submitted!
        </p>
        <p className="text-[13px] text-muted-foreground">You're all set</p>
        <Link
          href="/dashboard/learning-circle"
          className="mt-2 rounded-full bg-foreground px-5 py-2.5 text-[13px] font-semibold text-background transition-all hover:bg-foreground/90 hover:shadow-md"
        >
          Go to Circles
        </Link>
      </div>
    );
  }

  let inviterName = "";
  if (invite.invited_by) {
    if (typeof invite.invited_by === "object") {
      inviterName = invite.invited_by.full_name || "Unknown";
    } else {
      inviterName = invite.invited_by;
    }
  }

  return (
    <div
      className="mx-auto max-w-md py-12"
      style={{
        fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div className="relative overflow-hidden rounded-[24px] bg-card shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
        {/* Gradient header */}
        <div className="relative bg-linear-to-r from-primary via-primary/90 to-primary/70 px-8 py-10 text-center">
          <div className="pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full bg-primary-foreground/10 blur-xl" />
          <div className="pointer-events-none absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-primary-foreground/[0.07] blur-lg" />

          <div className="relative">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/20 backdrop-blur-sm">
              <Users className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-extrabold tracking-[-0.02em] text-primary-foreground">
              Circle Invitation
            </h2>
            <p className="mt-1 text-[13px] text-primary-foreground/70">
              You&apos;ve been invited to join
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-8">
          {(invite.circle_name ||
            invite.circle_title ||
            invite.circle ||
            invite.title) && (
            <div className="mb-6 text-center">
              <p className="text-[20px] font-extrabold text-foreground">
                {invite.circle_name ||
                  invite.circle_title ||
                  invite.circle ||
                  invite.title}
              </p>
            </div>
          )}

          {inviterName && (
            <div className="mb-8 flex items-center justify-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                {inviterName.charAt(0)}
              </div>
              <p className="text-[13px] text-muted-foreground">
                Invited by{" "}
                <span className="font-semibold text-foreground">
                  {inviterName}
                </span>
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-destructive/10 py-3 text-[13px] font-bold text-destructive transition-all hover:bg-destructive/20 active:scale-[0.98] disabled:opacity-50"
              onClick={() => handleRespond(false)}
              disabled={respondToInvite.isPending}
            >
              {respondToInvite.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Decline
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-success py-3 text-[13px] font-bold text-primary-foreground shadow-[0_4px_12px_rgba(16,185,129,0.3)] transition-all hover:bg-success/90 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
              onClick={() => handleRespond(true)}
              disabled={respondToInvite.isPending}
            >
              {respondToInvite.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
