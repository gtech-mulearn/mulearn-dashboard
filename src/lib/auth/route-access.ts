/**
 * Route Access Map
 *
 * src/lib/auth/route-access.ts
 *
 * Maps URL paths to the roles required to access them.
 * Used by Next.js middleware for edge-level route protection.
 *
 * Rules:
 * - Empty `roles` array = any authenticated user can access
 * - Non-empty `roles` array = user must have at least one matching role
 * - Routes not in this map but under /dashboard = any authenticated user
 * - More specific routes take precedence over general ones
 */

import { CAMPUS_SETTINGS_ROLES, ROLES } from "./roles";

// ─── Types ──────────────────────────────────────────────────

export interface RouteConfig {
  /** Roles allowed to access this route. Empty = any authenticated user. */
  roles: readonly string[];
  /**
   * Optional predicate for roles that can't be expressed as static strings
   * (e.g. dynamic IG lead roles like "{igCode} IGLead").
   * Access is granted when EITHER `roles` OR `dynamicCheck` passes.
   */
  dynamicCheck?: (userRoles: readonly string[]) => boolean;
}

// ─── Route Access Map ──────────────────────────────────────

export const routeAccessMap: Record<string, RouteConfig> = {
  // ── Public Dashboard (any authenticated user) ────────────
  "/dashboard": { roles: [] },
  "/dashboard/profile": { roles: [] },
  "/dashboard/leaderboard": { roles: [] },
  "/dashboard/learning-circles": { roles: [] },
  "/dashboard/interest-groups": { roles: [] },
  "/dashboard/campus": { roles: [] },
  "/dashboard/search": { roles: [] },
  "/dashboard/settings": { roles: [] },
  "/dashboard/settings/organization": { roles: CAMPUS_SETTINGS_ROLES },
  "/dashboard/hackathon": { roles: [] },
  "/dashboard/events": { roles: [] },
  "/dashboard/connect-discord": { roles: [] },
  "/dashboard/refer": { roles: [] },
  "/dashboard/weekly-twitches": { roles: [] },

  // ── Campus Lead Dashboard ────────────────────────────────
  "/dashboard/campus/manage": {
    roles: [ROLES.CAMPUS_LEAD, ROLES.LEAD_ENABLER, ROLES.ENABLER],
  },

  // ── Zonal Dashboard ──────────────────────────────────────
  "/dashboard/zonal": {
    roles: [ROLES.ADMIN, ROLES.ZONAL_CAMPUS_LEAD],
  },

  // ── District Dashboard ───────────────────────────────────
  "/dashboard/district": {
    roles: [ROLES.ADMIN, ROLES.DISTRICT_CAMPUS_LEAD],
  },

  // ── Intern Dashboard ─────────────────────────────
  "/dashboard/intern": {
    roles: [ROLES.ADMIN, ROLES.INTERN, ROLES.INTERN_LEAD],
  },

  "/dashboard/intern/minutes": {
    roles: [ROLES.ADMIN, ROLES.INTERN, ROLES.INTERN_LEAD],
  },

  // ── Interest Group Dashboard ─────────────────────────────
  "/dashboard/edit-ig": {
    roles: [ROLES.ADMIN],
    dynamicCheck: (roles) => roles.some((r) => r.endsWith(" IGLead")),
  },

  // ── Management Routes (Admin only) ───────────────────────
  "/dashboard/management": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/user-management": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/verification": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/session-verification": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/community": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/system": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/notifications": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/manage-users": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/role-verification": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/mentor-verification": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/manage-achievements": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/manage-interns": {
    roles: [ROLES.ADMIN, ROLES.ASSOCIATE],
  },
  "/dashboard/management/manage-interns/minutes": {
    roles: [ROLES.ADMIN, ROLES.ASSOCIATE, ROLES.INTERN, ROLES.INTERN_LEAD],
  },
  "/dashboard/management/manage-interest-groups": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/manage-interest-groups": {
    roles: [ROLES.ADMIN, ROLES.IG_LEAD],
  },
  "/dashboard/management/manage-roles": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/organizations": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/verify-organizations": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/karma-voucher": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/lc-meetup-verification": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/college-levels": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/tasks": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/tasks/bulk-import": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/tasks/create": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/tasks/edit": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/tasks/task-type": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/tasks/task-verification": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/manage-locations": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/channels": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/discord-moderation": {
    roles: [ROLES.ADMIN, ROLES.DISCORD_MODERATOR],
  },
  "/dashboard/management/error-log": {
    roles: [ROLES.ADMIN, ROLES.TECH_TEAM],
  },
  "/dashboard/management/dynamic-type": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/manage-skills": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/manage-launchpad": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/manage-companies": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/manage-departments": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/affiliation": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/organization-transfer": {
    roles: [ROLES.ADMIN],
  },

  // ── Weekly Twitches (Admin + Associate + IG Leads) ───────
  "/dashboard/management/weekly-twitches": {
    roles: [ROLES.ADMIN, ROLES.ASSOCIATE, ROLES.IG_LEAD],
  },

  // ── URL Shortener (broader access) ───────────────────────
  "/dashboard/url-shortener": {
    roles: [ROLES.ADMIN, ROLES.ASSOCIATE],
  },

  // ── Events Management ────────────────────────────────────
  "/dashboard/manage-events": {
    roles: [
      ROLES.ADMIN,
      ROLES.CAMPUS_LEAD,
      ROLES.LEAD_ENABLER,
      ROLES.COMPANY,
      ROLES.ENABLER,
      ROLES.MENTOR,
      ROLES.ZONAL_CAMPUS_LEAD,
      ROLES.DISTRICT_CAMPUS_LEAD,
    ],
    dynamicCheck: (roles) =>
      roles.some((r) => r.endsWith(" IGLead") || r.endsWith(" CampusLead")),
  },

  // ── Jobs Dashboard ───────────────────────────────────────
  "/dashboard/jobs": {
    // The non-empty array triggers the proxy middleware check.
    // The actual authorization logic is handled by dynamicCheck, which grants
    // broad access to the community while blocking Mentors and Companies
    // (Companies use /dashboard/company/jobs instead).
    roles: [ROLES.ADMIN],
    dynamicCheck: (roles) =>
      !roles.some((r) => r === ROLES.MENTOR || r === ROLES.COMPANY),
  },

  // ── Mentor Dashboard ────────────────────────────────────
  "/dashboard/mentor": {
    roles: [ROLES.MENTOR],
  },

  // ── Company Dashboard ───────────────────────────────────
  "/dashboard/company": {
    roles: [ROLES.COMPANY],
  },
  "/dashboard/company/ig-requests": {
    roles: [ROLES.COMPANY],
  },
};

// ─── Route Matching ─────────────────────────────────────────

/**
 * Find the most specific route config that matches the given pathname.
 * Uses longest-prefix matching so `/dashboard/admin/users` matches
 * `/dashboard/admin` if there's no more specific entry.
 *
 * @returns The matching RouteConfig, or `null` if no match found.
 */
export function findRouteConfig(pathname: string): RouteConfig | null {
  // 1. Exact match
  if (routeAccessMap[pathname]) {
    return routeAccessMap[pathname];
  }

  // 2. Longest prefix match
  const matchingRoutes = Object.keys(routeAccessMap)
    .filter((route) => pathname.startsWith(`${route}/`) || pathname === route)
    .sort((a, b) => b.length - a.length); // longest first

  return matchingRoutes.length > 0 ? routeAccessMap[matchingRoutes[0]] : null;
}
