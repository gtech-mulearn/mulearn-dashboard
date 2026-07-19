import { ROLES } from "@/lib/auth/roles";
import type { EventScope, OrganizerType } from "../types";

export type ApprovalTier = "mentor" | "campus" | "admin";

/** The single status→tier source of truth (mirrors Django approval chain). */
const STATUS_TIER: Record<string, ApprovalTier> = {
  pending_mentor_approval: "mentor",
  pending_campus_approval: "campus",
  pending_approval: "admin",
};

export function resolveApprovalTier(status: string): ApprovalTier | null {
  return STATUS_TIER[status] ?? null;
}

const CAMPUS_APPROVER_ROLES = [
  ROLES.CAMPUS_LEAD,
  ROLES.ZONAL_CAMPUS_LEAD,
  ROLES.DISTRICT_CAMPUS_LEAD,
  ROLES.ENABLER,
  ROLES.LEAD_ENABLER,
];

/** Whether this viewer may act at the event's current approval stage. The
 *  backend still authorises precisely (e.g. campus match); this only decides
 *  whether to surface the approve/reject UI. Admin/is_staff may act anywhere. */
export function canApproveStatus(
  status: string,
  roles: string[],
  isStaff: boolean,
): boolean {
  const tier = resolveApprovalTier(status);
  if (!tier) return false;
  if (isStaff || roles.includes(ROLES.ADMIN)) return true;
  if (tier === "mentor") return roles.includes(ROLES.MENTOR);
  if (tier === "campus")
    return CAMPUS_APPROVER_ROLES.some((r) => roles.includes(r));
  return false; // admin tier: only admin/is_staff (handled above)
}

/** The single organiser→allowed-scopes source of truth. Mirrors the permission
 *  matrix in the events spec: every organiser may target its own entity, and
 *  may also open the event to everyone (`global`). Escalating to a wider
 *  audience is safe here because publishing still goes through the approval
 *  chain. Company organisers only create global-audience events (there is no
 *  dedicated company scope option in the wizard). */
const ORGANISER_SCOPES: Record<OrganizerType, EventScope[]> = {
  admin: ["global", "campus", "ig", "campus_ig"],
  global_ig: ["ig", "global"],
  campus: ["campus", "global"],
  campus_ig: ["campus_ig", "campus", "global"],
  company: ["global"],
};

export function getAllowedScopes(organiserType: OrganizerType): EventScope[] {
  return ORGANISER_SCOPES[organiserType] ?? ["global"];
}
