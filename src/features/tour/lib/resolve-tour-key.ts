/**
 * Resolve Tour Key
 *
 * 📍 src/features/tour/lib/resolve-tour-key.ts
 *
 * Maps a user's roles to the tour they should see (or `null` for no tour).
 * Priority order intentionally mirrors `src/lib/auth/role-routing.ts`
 * (`getRoleHomePath`) — the tour a user gets must match the home route they
 * actually land on, or the launch condition (`pathname === home route`,
 * §6.1 of docs/features/tour.md) never fires.
 */

import { hasIgLeadRole, ROLES } from "@/lib/auth/roles";
import type { TourKey } from "../types";

/**
 * Every role §4/§5 grants a tour to — a "member" role, in the sense that it
 * gets a dashboard shell to tour. Roles outside this set (Discord Moderator,
 * Ex Official, Appraiser, Bot Dev, Tech Team, Campus Activation Team,
 * Suspended — §4 "No tour, no nav item, not in scope") are purely
 * permission-scoped: they'd otherwise fall through `getRoleHomePath`'s
 * `/dashboard` default and incorrectly pick up the `dashboard` tour when
 * held on their own, with no accompanying member role.
 */
const TOUR_ELIGIBLE_ROLES: readonly string[] = [
  ROLES.STUDENT,
  ROLES.PRE_MEMBER,
  ROLES.FELLOW,
  ROLES.MENTOR,
  ROLES.COMPANY,
  ROLES.IG_LEAD,
  ROLES.ENABLER,
  ROLES.INTERN,
  ROLES.INTERN_LEAD,
  ROLES.CAMPUS_LEAD,
  ROLES.LEAD_ENABLER,
  ROLES.ZONAL_CAMPUS_LEAD,
  ROLES.DISTRICT_CAMPUS_LEAD,
];

/**
 * Admin and Associate explicitly get no tour (power users, highest nav
 * churn, self-explanatory console) — but only when held on their own. If
 * paired with a tour-eligible role (e.g. Admin + Campus Lead), that role's
 * tour still shows.
 */
export function resolveTourKey(roles: readonly string[]): TourKey | null {
  const hasEligibleRole =
    TOUR_ELIGIBLE_ROLES.some((r) => roles.includes(r)) || hasIgLeadRole(roles);

  if (
    (roles.includes(ROLES.ADMIN) || roles.includes(ROLES.ASSOCIATE)) &&
    !hasEligibleRole
  ) {
    return null;
  }

  if (!hasEligibleRole) {
    return null;
  }

  if (roles.includes(ROLES.ZONAL_CAMPUS_LEAD)) {
    return "zonal";
  }

  if (roles.includes(ROLES.DISTRICT_CAMPUS_LEAD)) {
    return "district";
  }

  if (roles.includes(ROLES.CAMPUS_LEAD) || roles.includes(ROLES.LEAD_ENABLER)) {
    return "campus";
  }

  if (roles.includes(ROLES.INTERN) || roles.includes(ROLES.INTERN_LEAD)) {
    return "intern";
  }

  // Mentor takes priority over Company for a user holding both roles.
  if (roles.includes(ROLES.MENTOR)) {
    return "mentor";
  }

  if (roles.includes(ROLES.COMPANY)) {
    return "company";
  }

  return "dashboard";
}

/** Home route each tour key launches on — must match `getRoleHomePath`. */
export const TOUR_HOME_ROUTE: Record<TourKey, string> = {
  dashboard: "/dashboard",
  intern: "/dashboard",
  campus: "/dashboard",
  zonal: "/dashboard",
  district: "/dashboard",
  mentor: "/dashboard",
  company: "/dashboard",
};
