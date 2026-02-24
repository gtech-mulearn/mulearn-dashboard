/**
 * Member List Component
 *
 * 📍 src/features/learning-circle/components/member-list.tsx
 *
 * "Project Roles"-style member grid with karma tier badges,
 * colored avatar placeholders, and hover-reveal actions.
 */

"use client";

import { Check, Crown, Plus, Users, X } from "lucide-react";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import {
  type CirclePermissions,
  useApproveMember,
  useCircleMembers,
} from "../hooks";

/* ─── Bold avatar colors ─── */
const AVATAR_BG = [
  "from-[#6366F1] to-[#4F46E5]",
  "from-[#10B981] to-[#059669]",
  "from-[#F97316] to-[#EA580C]",
  "from-[#EC4899] to-[#DB2777]",
  "from-[#8B5CF6] to-[#7C3AED]",
  "from-[#06B6D4] to-[#0284C7]",
  "from-[#FBBF24] to-[#D97706]",
  "from-[#EF4444] to-[#DC2626]",
];

function getAvatarGradient(name: string) {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_BG[hash % AVATAR_BG.length];
}

/* ─── Karma tier system ─── */
function _getKarmaTier(karma: number) {
  if (karma >= 1000)
    return {
      label: "Elite",
      bg: "bg-[#7C3AED]",
      text: "text-white",
      dot: "bg-[#7C3AED]",
    };
  if (karma >= 500)
    return {
      label: "Pro",
      bg: "bg-[#F59E0B]",
      text: "text-white",
      dot: "bg-[#F59E0B]",
    };
  if (karma >= 100)
    return {
      label: "Active",
      bg: "bg-[#059669]",
      text: "text-white",
      dot: "bg-[#059669]",
    };
  return {
    label: "New",
    bg: "bg-[#E5E7EB]",
    text: "text-[#6B7280]",
    dot: "bg-[#9CA3AF]",
  };
}

interface MemberListProps {
  circleId: string;
  permissions: CirclePermissions;
  onInviteClick?: () => void;
}

export function MemberList({
  circleId,
  permissions,
  onInviteClick,
}: MemberListProps) {
  const { data: members, isLoading } = useCircleMembers(circleId);
  const approveMember = useApproveMember(circleId);

  const handleApprove = (muid: string) => {
    approveMember.mutate({ muid, flag: true });
  };

  const handleReject = (muid: string) => {
    approveMember.mutate({ muid, flag: false });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[#4F46E5]/10 animate-ping" />
          <Spinner className="relative h-6 w-6 text-[#4F46E5]" />
        </div>
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div className="lc-fade-in flex flex-col items-center justify-center rounded-[16px] bg-linear-to-br from-[#F9FAFB] to-[#F3F4F6] px-8 py-14">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md">
          <Users className="h-5 w-5 text-[#4F46E5]" />
        </div>
        <p className="text-[14px] font-bold text-[#111827]">No members yet</p>
        <p className="mt-0.5 text-[13px] text-[#9CA3AF]">
          Members will appear here once they join
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-3 gap-y-5 sm:grid-cols-1">
      {/* Invite Member Button acts as first list item */}
      {permissions.canSendInvites && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onInviteClick}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-3 border-dashed border-gray-300 text-gray-500 hover:border-primary hover:bg-primary/10 hover:text-primary transition-colors"
            title="Invite Member"
          >
            <Plus className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <button
              type="button"
              className="text-[14px] font-semibold text-gray-900 cursor-pointer hover:text-primary bg-transparent border-none p-0"
              onClick={onInviteClick}
            >
              Invite Member
            </button>
          </div>
        </div>
      )}

      {members.map((member, index) => {
        return (
          <div
            key={member.id}
            className="group flex min-w-0 items-center justify-between
              transition-all duration-200 lc-slide-up"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              {/* Avatar */}
              <div className="relative h-10 w-10 shrink-0">
                {member.profile_pic ? (
                  <Image
                    src={member.profile_pic}
                    alt={member.full_name}
                    fill
                    className="rounded-full object-cover ring-2 ring-white"
                  />
                ) : (
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br ${getAvatarGradient(member.full_name)} text-[14px] font-bold text-white ring-2 ring-white`}
                  >
                    {member.full_name.charAt(0)}
                  </div>
                )}
                {member.is_leader && (
                  <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 ring-2 ring-white">
                    <Crown className="h-[9px] w-[9px] text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-gray-900 leading-tight pb-0.5">
                  {member.full_name}
                </p>
                <p className="text-[12px] font-medium text-gray-500 leading-tight">
                  {member.is_leader
                    ? "Lead"
                    : `${member.ig_karma?.toLocaleString() || 0} karma`}
                </p>
              </div>
            </div>

            {/* Actions — reveal on hover */}
            {permissions.canManageMembers && !member.is_leader && (
              <div className="flex shrink-0 gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <button
                  type="button"
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600
                    transition-colors hover:bg-emerald-100 active:scale-95 disabled:opacity-40"
                  onClick={() => handleApprove(member.muid)}
                  disabled={approveMember.isPending}
                  title="Approve"
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-red-500
                    transition-colors hover:bg-red-100 active:scale-95 disabled:opacity-40"
                  onClick={() => handleReject(member.muid)}
                  disabled={approveMember.isPending}
                  title="Remove"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
