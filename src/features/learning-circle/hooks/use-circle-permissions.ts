/**
 * Learning Circle Permissions Hook
 *
 * 📍 src/features/learning-circle/hooks/use-circle-permissions.ts
 *
 * Single source of truth for all role-based access control within a learning circle.
 * Derives permissions from circle detail data and user profile.
 *
 * Role derivation:
 *   - owner:  userProfile.muid === circle.created_by.muid
 *   - lead:   member entry with is_leader === true (and not owner)
 *   - member: any other circle member
 *   - null:   not a member / data not loaded
 */

"use client";

import { useMemo } from "react";
import { useUserProfile } from "@/features/profile";
import type { CircleMember, LearningCircleDetail } from "../schemas";

export type CircleRole = "owner" | "lead" | "member" | null;

export interface CirclePermissions {
  role: CircleRole;

  // Owner exclusive
  canEditCircle: boolean;
  canDeleteCircle: boolean;
  canManageMembers: boolean;
  canSendInvites: boolean;
  canTransferLead: boolean;

  // Owner OR Lead
  canCreateMeeting: boolean;
  canEditMeeting: boolean;
  canDeleteMeeting: boolean;
  canSubmitReport: boolean;
  canViewAttendeeReport: boolean;
}

/**
 * Derives the current user's role in a circle.
 *
 * Checks ownership via `created_by.muid`, then checks `is_leader` flag
 * from the members list to determine lead status.
 */
function deriveRole(
  circle: LearningCircleDetail | undefined,
  members: CircleMember[] | undefined,
  userMuid: string | undefined,
): CircleRole {
  if (!circle || !userMuid) return null;

  // Check ownership
  if (circle.created_by?.muid === userMuid) return "owner";

  // Check if user is in members list
  if (!members) return null;
  const memberEntry = members.find((m) => m.muid === userMuid);
  if (!memberEntry) return null;

  // Check lead status
  if (memberEntry.is_leader) return "lead";

  return "member";
}

/**
 * Derives UI permissions from the current user's role within a specific circle.
 *
 * Usage:
 * ```tsx
 * const { data: circle } = useCircleDetail(circleId);
 * const { data: members } = useCircleMembers(circleId);
 * const permissions = useCirclePermissions(circle, members);
 *
 * {permissions.canEditCircle && <Button>Edit</Button>}
 * ```
 */
export function useCirclePermissions(
  circle: LearningCircleDetail | undefined,
  members: CircleMember[] | undefined,
): CirclePermissions {
  const { data: userProfile } = useUserProfile();

  return useMemo(() => {
    const role = deriveRole(circle, members, userProfile?.muid);
    const isOwner = role === "owner";
    const isLead = role === "lead";
    const isOwnerOrLead = isOwner || isLead;

    return {
      role,

      // Owner exclusive
      canEditCircle: isOwner,
      canDeleteCircle: isOwner,
      canManageMembers: isOwner,
      canSendInvites: isOwner,
      canTransferLead: isOwner,

      // Owner OR Lead
      canCreateMeeting: isOwnerOrLead,
      canEditMeeting: isOwnerOrLead,
      canDeleteMeeting: isOwnerOrLead,
      canSubmitReport: isOwnerOrLead,
      canViewAttendeeReport: isOwnerOrLead,
    };
  }, [circle, members, userProfile?.muid]);
}
