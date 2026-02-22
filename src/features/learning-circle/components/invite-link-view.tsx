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
    respondToInvite.mutate({ linkId, data: { is_accepted: isAccepted } });
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
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FEE2E2]">
          <X className="h-8 w-8 text-[#DC2626]" />
        </div>
        <p className="text-lg font-bold text-[#111827]">
          Invalid or Expired Link
        </p>
        <p className="text-[13px] text-[#9CA3AF]">
          This invitation is no longer available
        </p>
        <Link
          href="/dashboard/learning-circle"
          className="mt-2 rounded-full bg-[#111827] px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-[#1F2937] hover:shadow-md"
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
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#34D399] to-[#10B981] shadow-[0_8px_30px_rgba(16,185,129,0.25)]">
            <PartyPopper className="h-9 w-9 text-white" />
          </div>
          <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md">
            <Check className="h-4 w-4 text-[#10B981]" />
          </div>
        </div>
        <p className="text-xl font-extrabold text-[#111827]">
          Response Submitted!
        </p>
        <p className="text-[13px] text-[#9CA3AF]">You're all set</p>
        <Link
          href="/dashboard/learning-circle"
          className="mt-2 rounded-full bg-[#111827] px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-[#1F2937] hover:shadow-md"
        >
          Go to Circles
        </Link>
      </div>
    );
  }

  return (
    <div
      className="mx-auto max-w-md py-12"
      style={{
        fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div className="relative overflow-hidden rounded-[24px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
        {/* Gradient header */}
        <div className="relative bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#818CF8] px-8 py-10 text-center">
          <div className="pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
          <div className="pointer-events-none absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-white/[0.07] blur-lg" />

          <div className="relative">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-extrabold tracking-[-0.02em] text-white">
              Circle Invitation
            </h2>
            <p className="mt-1 text-[13px] text-white/70">
              You&apos;ve been invited to join
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-8">
          {invite.circle_name && (
            <div className="mb-6 text-center">
              <p className="text-[20px] font-extrabold text-[#111827]">
                {invite.circle_name}
              </p>
            </div>
          )}

          {invite.invited_by && (
            <div className="mb-8 flex items-center justify-center gap-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#C7D2FE] to-[#A5B4FC] flex items-center justify-center text-[10px] font-bold text-[#4338CA]">
                {invite.invited_by.charAt(0)}
              </div>
              <p className="text-[13px] text-[#6B7280]">
                Invited by{" "}
                <span className="font-semibold text-[#374151]">
                  {invite.invited_by}
                </span>
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FEE2E2] py-3 text-[13px] font-bold text-[#DC2626] transition-all hover:bg-[#FECACA] active:scale-[0.98] disabled:opacity-50"
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
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#059669] to-[#10B981] py-3 text-[13px] font-bold text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] transition-all hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
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
