/**
 * Transfer Lead Modal
 *
 * 📍 src/features/learning-circle/components/transfer-lead-modal.tsx
 *
 * Clean selection modal — flat surfaces, no accent borders.
 */

"use client";

import { Crown } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useCircleMembers, useTransferLead } from "../hooks";

interface TransferLeadModalProps {
  circleId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransferLeadModal({
  circleId,
  open,
  onOpenChange,
}: TransferLeadModalProps) {
  const { data: members } = useCircleMembers(circleId);
  const transferLead = useTransferLead(circleId);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const candidates = members?.filter((m) => !m.is_leader) ?? [];

  const handleTransfer = () => {
    if (!selectedMemberId) return;
    transferLead.mutate(
      { muid: selectedMemberId },
      {
        onSuccess: () => {
          setSelectedMemberId(null);
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] rounded-2xl border-[#F0F0F0] bg-white p-0 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFFBEB]">
                <Crown className="h-5 w-5 text-[#F59E0B]" />
              </div>
              <div>
                <span className="block text-[16px] font-bold text-[#111827]">
                  Transfer Lead Role
                </span>
                <span className="block text-[12px] font-normal text-[#9CA3AF]">
                  Choose a new circle lead
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="max-h-[320px] overflow-y-auto px-6 py-4 space-y-1.5">
          {candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl bg-[#F9FAFB] py-8">
              <p className="text-[13px] text-[#9CA3AF]">
                No eligible members to transfer to.
              </p>
            </div>
          ) : (
            candidates.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => setSelectedMemberId(member.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-all duration-150
                  ${
                    selectedMemberId === member.id
                      ? "bg-[#EEF2FF] ring-1 ring-[#4F46E5]/20"
                      : "bg-[#F9FAFB] hover:bg-[#F3F4F6]"
                  }`}
              >
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#E5E7EB]">
                  {member.profile_pic ? (
                    <Image
                      src={member.profile_pic}
                      alt={member.full_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[13px] font-semibold text-[#6B7280]">
                      {member.full_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[13px] font-semibold text-[#111827]">
                    {member.full_name}
                  </p>
                  <p className="truncate text-[11px] text-[#9CA3AF]">
                    {member.ig_karma.toLocaleString()} karma
                  </p>
                </div>
                {selectedMemberId === member.id && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4F46E5]">
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                      aria-label="Selected"
                      role="img"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        <div className="flex justify-end gap-2.5 border-t border-[#F3F4F6] px-6 py-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 rounded-xl px-4 text-[13px] font-semibold text-[#6B7280]
              transition-all duration-150 hover:bg-[#F3F4F6]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleTransfer}
            disabled={!selectedMemberId || transferLead.isPending}
            className="flex h-9 items-center gap-2 rounded-xl bg-[#111827] px-5 text-[13px] font-semibold text-white
              transition-all duration-150 hover:bg-[#1F2937] disabled:opacity-40"
          >
            {transferLead.isPending && <Spinner className="h-3.5 w-3.5" />}
            Transfer Lead
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
