/**
 * Invite Form & Sent Invites Components
 *
 * 📍 src/features/learning-circle/components/invite-section.tsx
 *
 * Studio-quality send invite form + sent invites list with refined styling.
 */

"use client";

import { Mail, Send } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useSendInvite, useSentInvites } from "../hooks";

interface InviteProps {
  circleId: string;
}

export function InviteMemberForm({
  circleId,
  onSent,
}: InviteProps & { onSent?: () => void }) {
  const [muid, setMuid] = useState("");
  const sendInvite = useSendInvite(circleId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!muid.trim()) return;
    sendInvite.mutate(
      { muid: muid.trim() },
      {
        onSuccess: () => {
          setMuid("");
          onSent?.();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSend} className="flex gap-2 w-full">
      <div className="flex-1 min-w-0">
        <Label htmlFor="muid" className="sr-only">
          User MUID
        </Label>
        <Input
          id="muid"
          value={muid}
          onChange={(e) => setMuid(e.target.value)}
          placeholder="Enter user's MUID"
          className="h-10 w-full rounded-lg border-gray-200 bg-gray-50 px-3 text-[13px] text-gray-900 shadow-none
            placeholder:text-gray-400
            focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-white
            transition-all duration-200"
        />
      </div>
      <button
        type="submit"
        disabled={!muid.trim() || sendInvite.isPending}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white
          transition-all duration-200 hover:bg-primary/80 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {sendInvite.isPending ? (
          <Spinner className="h-4 w-4" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </button>
    </form>
  );
}

export function SentInvitesCard({ circleId }: InviteProps) {
  const { data: sentInvites, isLoading } = useSentInvites(circleId);

  return (
    <div className="w-full rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col">
      <div className="flex flex-col gap-1 mb-5">
        <h3 className="text-[16px] font-bold text-gray-900">
          Sent Invites{" "}
          {sentInvites && sentInvites.length > 0 && `(${sentInvites.length})`}
        </h3>
        <p className="text-[13px] text-gray-500 font-medium">
          Track the status of your invitations.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Spinner className="h-5 w-5 text-violet-600" />
        </div>
      ) : !sentInvites || sentInvites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-[13px] font-semibold text-gray-600">
            No invites sent yet
          </p>
          <p className="mt-1 text-[12px] text-gray-400">
            Send your first invite above
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sentInvites.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2.5
                transition-all duration-200 hover:border-gray-200"
            >
              <div className="min-w-0 pr-3">
                <p className="truncate text-[13px] font-semibold text-gray-900">
                  {invite.muid || invite.user || "Unknown"}
                </p>
                {invite.created_at && (
                  <p className="text-[11px] text-gray-500">
                    Sent {new Date(invite.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  invite.is_accepted === true
                    ? "bg-emerald-100 text-emerald-700"
                    : invite.is_accepted === false
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
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
  );
}
