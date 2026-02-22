/**
 * Pending Invites Page Component
 *
 * 📍 src/features/learning-circle/components/pending-invites.tsx
 *
 * Clean invitation cards — flat surfaces, no accent borders.
 */

"use client";

import { Check, ChevronLeft, Mail, X } from "lucide-react";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { useMyPendingInvites, useRespondToInvite } from "../hooks";

export function PendingInvites() {
  const { data: invites, isLoading } = useMyPendingInvites();
  const respondToInvite = useRespondToInvite();

  const handleRespond = (id: string, isAccepted: boolean) => {
    respondToInvite.mutate({ id, is_accepted: isAccepted });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[#4F46E5]/10 animate-ping" />
          <Spinner className="relative h-6 w-6 text-[#4F46E5]" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-6"
      style={{
        fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
        fontFeatureSettings: "'cv02', 'cv03', 'cv04'",
      }}
    >
      {/* Header */}
      <div>
        <Link
          href="/dashboard/learning-circle"
          className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] px-3.5 py-1.5 text-[13px] font-medium text-[#6B7280]
            transition-all duration-200 hover:bg-[#F9FAFB] hover:text-[#111827] hover:border-[#D1D5DB]"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to Circles
        </Link>
        <h1 className="mt-4 text-[24px] font-bold tracking-[-0.02em] text-[#111827]">
          My Invitations
        </h1>
        <p className="mt-1 text-[14px] text-[#9CA3AF]">
          Pending circle invitations for you
        </p>
      </div>

      {!invites || invites.length === 0 ? (
        <div className="lc-fade-in flex flex-col items-center justify-center rounded-2xl bg-[#F9FAFB] px-8 py-20">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F3F4F6]">
            <Mail className="h-6 w-6 text-[#9CA3AF]" />
          </div>
          <p className="text-[15px] font-semibold text-[#111827]">
            No Pending Invitations
          </p>
          <p className="mt-1 text-[13px] text-[#9CA3AF]">
            You don&apos;t have any pending circle invitations.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {invites.map((invite, index) => (
            <div
              key={invite.id}
              className="flex items-center justify-between rounded-xl bg-white px-4 py-3.5
                border border-[#F0F0F0]
                shadow-[0_1px_3px_rgba(0,0,0,0.04)]
                transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]
                lc-slide-up"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EEF2FF]">
                  <Mail className="h-4 w-4 text-[#4F46E5]" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#111827]">
                    {invite.circle_name || "Learning Circle"}
                  </p>
                  {invite.created_at && (
                    <p className="text-[11px] text-[#9CA3AF]">
                      Invited {new Date(invite.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#EF4444]
                    transition-all duration-150 hover:bg-[#FEF2F2] active:scale-95
                    disabled:opacity-40"
                  onClick={() => handleRespond(invite.id, false)}
                  disabled={respondToInvite.isPending}
                  title="Reject"
                >
                  <X className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#10B981]
                    transition-all duration-150 hover:bg-[#ECFDF5] active:scale-95
                    disabled:opacity-40"
                  onClick={() => handleRespond(invite.id, true)}
                  disabled={respondToInvite.isPending}
                  title="Accept"
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
