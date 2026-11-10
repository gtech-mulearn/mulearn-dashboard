/**
 * Member List Component
 *
 * 📍 src/features/learning-circle/components/member-list.tsx
 *
 * "Project Roles"-style member grid with karma tier badges,
 * colored avatar placeholders, and hover-reveal actions.
 */

"use client";

import { Crown, Plus, UserMinus, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useUserInfo } from "@/features/auth/hooks";
import {
  type CirclePermissions,
  useCircleMembers,
  useRemoveMember,
} from "../hooks";
import type { CircleMember } from "../schemas";

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
  const { data: userInfo } = useUserInfo();
  const removeMember = useRemoveMember(circleId);
  const [memberToKick, setMemberToKick] = useState<CircleMember | null>(null);
  const members = membersData?.members ?? [];

  const handleConfirmKick = () => {
    if (!memberToKick) return;
    removeMember.mutate(
      { muid: memberToKick.muid },
      { onSuccess: () => setMemberToKick(null) },
    );
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

  if (!membersData || members.length === 0) {
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
      {/* Invite Member Button acts as first list item */}
      {permissions.canSendInvites && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onInviteClick}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-3 border-dashed border-border text-muted-foreground hover:border-primary hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
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
        const profileHref = member.muid ? `/profile/${member.muid}` : null;
        const karmaText = `${member.ig_karma?.toLocaleString() || 0} karma`;

        const cardContent = (
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
                <div
                  className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-warning ring-2 ring-card"
                  title="Circle Lead"
                >
                  <Crown className="h-[9px] w-[9px] text-primary-foreground" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-foreground leading-tight pb-0.5 group-hover:text-primary transition-colors">
                {member.full_name}
              </p>
              <p className="text-[12px] font-medium text-muted-foreground leading-tight flex items-center gap-1">
                {member.is_leader && (
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    Lead •{" "}
                  </span>
                )}
                <span>{karmaText}</span>
              </p>
            </div>
          </div>
        );

        const canKick =
          permissions.canManageMembers &&
          !member.is_leader &&
          member.muid !== userInfo?.muid;

        return (
          <div
            key={member.id}
            className="group flex min-w-0 items-center justify-between transition-all duration-200 lc-slide-up"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            {profileHref ? (
              <Link
                href={profileHref}
                className="flex-1 min-w-0 cursor-pointer"
              >
                {cardContent}
              </Link>
            ) : (
              <div className="flex-1 min-w-0">{cardContent}</div>
            )}
            {canKick && (
              <button
                type="button"
                onClick={() => setMemberToKick(member)}
                className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 cursor-pointer"
                title="Remove member"
              >
                <UserMinus className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      })}

      <Dialog
        open={memberToKick !== null}
        onOpenChange={(open) => !open && setMemberToKick(null)}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Remove member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-bold text-foreground">
                {memberToKick?.full_name}
              </span>{" "}
              from this circle? They will need to request to join again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setMemberToKick(null)}
              disabled={removeMember.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmKick}
              disabled={removeMember.isPending}
            >
              {removeMember.isPending && <Spinner className="mr-2 h-4 w-4" />}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
