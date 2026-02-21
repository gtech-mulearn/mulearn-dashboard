/**
 * Invite Section Component
 *
 * 📍 src/features/learning-circle/components/invite-section.tsx
 *
 * Studio-quality send invite form + sent invites list with refined styling.
 */

"use client";

import { ArrowRight, Mail, Send } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useSendInvite, useSentInvites } from "../hooks";

interface InviteSectionProps {
  circleId: string;
}

export function InviteSection({ circleId }: InviteSectionProps) {
  const [muid, setMuid] = useState("");
  const sendInvite = useSendInvite(circleId);
  const { data: sentInvites, isLoading } = useSentInvites(circleId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!muid.trim()) return;
    sendInvite.mutate(
      { muid: muid.trim() },
      {
        onSuccess: () => setMuid(""),
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Send Invite Form */}
      <div className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h4 className="mb-5 flex items-center gap-2.5 text-[16px] font-semibold text-[#111827]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF2FF]">
            <Send className="h-4 w-4 text-[#4F46E5]" />
          </div>
          Send Invite
        </h4>
        <form onSubmit={handleSend} className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="muid" className="sr-only">
              User MUID
            </Label>
            <Input
              id="muid"
              value={muid}
              onChange={(e) => setMuid(e.target.value)}
              placeholder="Enter user's MUID"
              className="h-11 rounded-xl border-[1.5px] border-[#E5E7EB] bg-white px-4 text-[14px] text-[#111827] shadow-none
                placeholder:text-[#9CA3AF]
                focus-visible:border-[#4F46E5] focus-visible:ring-[3px] focus-visible:ring-[#4F46E5]/10 focus-visible:outline-none
                transition-all duration-200"
            />
          </div>
          <button
            type="submit"
            disabled={!muid.trim() || sendInvite.isPending}
            className="flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] px-6 text-[13px] font-semibold text-white
              transition-all duration-200 hover:from-[#4338CA] hover:to-[#6D28D9] hover:shadow-lg hover:shadow-[#4F46E5]/25
              active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendInvite.isPending ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            Send
          </button>
        </form>
      </div>

      {/* Sent Invites List */}
      <div>
        <h4 className="mb-3 flex items-center gap-2.5 text-[16px] font-semibold text-[#111827]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4F6]">
            <Mail className="h-4 w-4 text-[#6B7280]" />
          </div>
          Sent Invites
        </h4>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-5 w-5 text-[#4F46E5]" />
          </div>
        ) : !sentInvites || sentInvites.length === 0 ? (
          <div className="lc-fade-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#D1D5DB] px-6 py-12">
            <Mail className="mb-3 h-10 w-10 text-[#D1D5DB]" />
            <p className="text-[14px] font-medium text-[#9CA3AF]">
              No invites sent yet
            </p>
            <p className="mt-1 text-[13px] text-[#D1D5DB]">
              Send your first invite above
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sentInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between rounded-[14px] border border-[#F3F4F6] bg-white px-4 py-3.5
                  shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-200 hover:border-[#E5E7EB]"
              >
                <div>
                  <p className="text-[15px] font-semibold text-[#111827]">
                    {invite.muid || invite.user || "Unknown"}
                  </p>
                  {invite.created_at && (
                    <p className="text-[12px] text-[#9CA3AF]">
                      Sent {new Date(invite.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ${
                    invite.is_accepted === true
                      ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]/60"
                      : invite.is_accepted === false
                        ? "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]/60"
                        : "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]/60"
                  }`}
                >
                  {invite.is_accepted === true
                    ? "Accepted"
                    : invite.is_accepted === false
                      ? "Rejected"
                      : "Pending"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
