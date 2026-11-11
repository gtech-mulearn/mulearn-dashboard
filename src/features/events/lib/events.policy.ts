import { ROLES } from "@/lib/auth/roles";
import type { EventScope, OrganizerType } from "../types";

export type ApprovalTier = "mentor" | "campus" | "company" | "admin";

/** The single status→tier source of truth (mirrors Django approval chain). */
const STATUS_TIER: Record<string, ApprovalTier> = {
  pending_mentor_approval: "mentor",
  pending_campus_approval: "campus",
  pending_approval: "admin",
};

/**
 * The approval tier for an event's current status. A company event's first
 * stage (`pending_mentor_approval`, reached when a company mentor submits it)
 * is decided by the company owner or an accepted co-admin through
 * events/company/<id>/approve|reject/ — the mentor endpoint refuses company
 * events (release 1.91).
 */
export function resolveApprovalTier(
  status: string,
  organiserType?: string | null,
): ApprovalTier | null {
  const tier = STATUS_TIER[status] ?? null;
  if (tier === "mentor" && organiserType === "company") return "company";
  return tier;
}

export interface ApprovalContext {
  organiserType?: string | null;
  /** The event's organiser organisation (`event.organiser_org`). */
  organiserOrgId?: string | null;
  /** Company org ids the viewer owns or co-administers
   *  (organizer-options `can_create_as_company`). */
  manageableCompanyOrgIds?: readonly string[];
}

interface OrganizerLike {
  type?: string | null;
  organiser_type?: string | null;
  company?: { id?: string | null } | null;
  organiser_company?: { id?: string | null } | null;
}

/** Build the approval context from an event's organiser, whichever field
 *  names the API used (`type`/`company` or `organiser_type`/`organiser_company`). */
export function approvalContextFor(
  organizer: OrganizerLike | null | undefined,
  manageableCompanyOrgIds: readonly string[],
): Required<ApprovalContext> {
  return {
    organiserType: organizer?.type ?? organizer?.organiser_type ?? null,
    organiserOrgId:
      organizer?.company?.id ?? organizer?.organiser_company?.id ?? null,
    manageableCompanyOrgIds,
  };
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
 *  whether to surface the approve/reject UI. Admin/is_staff may act at every
 *  tier except the company tier, which only the company's owner or an
 *  accepted co-admin may decide. */
export function canApproveStatus(
  status: string,
  roles: string[],
  isStaff: boolean,
  ctx: ApprovalContext = {},
): boolean {
  const tier = resolveApprovalTier(status, ctx.organiserType);
  if (!tier) return false;
  if (tier === "company") {
    return (
      !!ctx.organiserOrgId &&
      !!ctx.manageableCompanyOrgIds?.includes(ctx.organiserOrgId)
    );
  }
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
