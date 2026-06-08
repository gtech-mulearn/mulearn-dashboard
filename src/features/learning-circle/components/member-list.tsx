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
  useCircleMembers,
  useJoinRequests,
  useRespondToJoinRequest,
} from "../hooks";

// TODO: avatar gradient palette — no semantic token for multi-color identity gradients; needs design decision
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
      bg: "bg-brand-purple",
      text: "text-primary-foreground",
      dot: "bg-brand-purple",
    };
  if (karma >= 500)
    return {
      label: "Pro",
      bg: "bg-warning",
      text: "text-primary-foreground",
      dot: "bg-warning",
    };
  if (karma >= 100)
    return {
      label: "Active",
      bg: "bg-success",
      text: "text-primary-foreground",
      dot: "bg-success",
    };
  return {
    label: "New",
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground/40",
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
  const { data: membersData, isLoading } = useCircleMembers(circleId);
  const members = membersData?.members ?? [];

  // Only the lead/creator may view and action pending join requests (mirrors the
  // backend `_is_lead_or_creator` gate on GET/PATCH join/<id>/).
  const canManageRequests =
    permissions.role === "owner" || permissions.role === "lead";
  const { data: joinRequests = [] } = useJoinRequests(
    circleId,
    canManageRequests,
  );
  const respondToRequest = useRespondToJoinRequest(circleId);

  const handleAccept = (linkId: string) => {
    respondToRequest.mutate({ link_id: linkId, action: "accept" });
  };
  const handleRejectRequest = (linkId: string) => {
    respondToRequest.mutate({ link_id: linkId, action: "reject" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
          <Spinner className="relative h-6 w-6 text-primary" />
        </div>
      </div>
    );
  }

  if (!membersData || (members.length === 0 && joinRequests.length === 0)) {
    return (
      <div className="lc-fade-in flex flex-col items-center justify-center rounded-[16px] bg-muted px-8 py-14">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-md">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <p className="text-[14px] font-bold text-foreground">No members yet</p>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Members will appear here once they join
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-3 gap-y-5 sm:grid-cols-1">
      {/* Pending join requests — visible to the lead/creator only */}
      {canManageRequests && joinRequests.length > 0 && (
        <div className="rounded-[16px] border border-warning/30 bg-warning/5 p-3">
          <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-warning">
            Pending requests ({joinRequests.length})
          </p>
          <div className="flex flex-col gap-3">
            {joinRequests.map((req) => (
              <div
                key={req.link_id}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#6366F1] to-[#4F46E5] text-[13px] font-bold text-primary-foreground">
                    {req.full_name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-foreground">
                      {req.full_name}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {req.muid}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => handleAccept(req.link_id)}
                    disabled={respondToRequest.isPending}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-success/10 text-success transition-colors hover:bg-success/20 active:scale-95 disabled:opacity-40"
                    title="Accept"
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRejectRequest(req.link_id)}
                    disabled={respondToRequest.isPending}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20 active:scale-95 disabled:opacity-40"
                    title="Reject"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Member Button acts as first list item */}
      {permissions.canSendInvites && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onInviteClick}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-3 border-dashed border-border text-muted-foreground hover:border-primary hover:bg-primary/10 hover:text-primary transition-colors"
            title="Invite Member"
          >
            <Plus className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <button
              type="button"
              className="text-[14px] font-semibold text-foreground cursor-pointer hover:text-primary bg-transparent border-none p-0"
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
                    className="rounded-full object-cover ring-2 ring-card"
                  />
                ) : (
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br ${getAvatarGradient(member.full_name)} text-[14px] font-bold text-primary-foreground ring-2 ring-card`}
                  >
                    {member.full_name.charAt(0)}
                  </div>
                )}
                {member.is_leader && (
                  <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-warning ring-2 ring-card">
                    <Crown className="h-[9px] w-[9px] text-primary-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-foreground leading-tight pb-0.5">
                  {member.full_name}
                </p>
                <p className="text-[12px] font-medium text-muted-foreground leading-tight">
                  {member.is_leader
                    ? "Lead"
                    : `${member.ig_karma?.toLocaleString() || 0} karma`}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
