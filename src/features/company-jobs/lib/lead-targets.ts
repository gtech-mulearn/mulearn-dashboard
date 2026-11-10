import { hasIgLeadRole, ROLES } from "@/lib/auth/roles";
import type { CollabTargetType } from "../types";

export interface LeadTarget {
  type: CollabTargetType;
  /** target_org_id: the campus Organization id, or the InterestGroup id. */
  orgId: string;
  label: string;
}

const IG_LEAD_SUFFIX = " IGLead";

/**
 * Campuses and IGs the user can answer a collaboration for — the same rule
 * the backend's _can_respond_as_target applies: "Campus Lead" for their
 * verified campus, "{code} IGLead" per IG ("{code} CampusIGLead" excluded).
 */
export function leadTargets(
  roles: readonly string[],
  context: {
    campus?: { orgId: string; name: string } | null;
    igs: { id: string; name: string; code?: string | null }[];
  },
): LeadTarget[] {
  const targets: LeadTarget[] = [];
  if (roles.includes(ROLES.CAMPUS_LEAD) && context.campus?.orgId) {
    targets.push({
      type: "CAMPUS",
      orgId: context.campus.orgId,
      label: context.campus.name,
    });
  }
  if (hasIgLeadRole(roles)) {
    const codes = new Set(
      roles
        .filter((r) => r.endsWith(IG_LEAD_SUFFIX))
        .map((r) => r.slice(0, -IG_LEAD_SUFFIX.length)),
    );
    for (const ig of context.igs) {
      if (ig.code && codes.has(ig.code)) {
        targets.push({ type: "IG", orgId: ig.id, label: ig.name });
      }
    }
  }
  return targets;
}
