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

import {
  ADMIN_ROLES,
  CAMPUS_SETTINGS_ROLES,
  COMMUNITY_SETTINGS_HUB_ROLES,
  DISCORD_MODERATION_ROLES,
  DISTRICT_ROLES,
  FELLOW_MANAGEMENT_ROLES,
  INTERN_MANAGEMENT_ROLES,
  MANAGEMENT_HUB_ROLES,
  MANAGEMENT_ROLES,
  ROLES,
  SYSTEM_CONFIG_HUB_ROLES,
  TECH_ROLES,
  USER_MANAGEMENT_HUB_ROLES,
  ZONAL_ROLES,
} from "./roles";

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
    roles: ZONAL_ROLES,
  },

  // ── District Dashboard ───────────────────────────────────
  "/dashboard/district": {
    roles: DISTRICT_ROLES,
  },

  // ── Intern Dashboard ─────────────────────────────
  "/dashboard/intern": {
    roles: [ROLES.ADMIN, ROLES.INTERN, ROLES.INTERN_LEAD],
  },

  "/dashboard/intern/minutes": {
    roles: [ROLES.ADMIN, ROLES.INTERN, ROLES.INTERN_LEAD],
  },

  // ── Interest Group Dashboard ─────────────────────────────
  // Kept in step with IG_ROLES in roles.ts, which gates the sidebar entry —
  // a nav item the middleware then redirects away from is a dead link.
  "/dashboard/edit-ig": {
    roles: [ROLES.ADMIN, ROLES.IG_LEAD],
    dynamicCheck: (roles) => roles.some((r) => r.endsWith(" IGLead")),
  },

  // ── Management Routes ─────────────────────────────────────
  "/dashboard/management": {
    roles: MANAGEMENT_HUB_ROLES,
  },
  "/dashboard/management/user-management": {
    roles: USER_MANAGEMENT_HUB_ROLES,
  },
  "/dashboard/management/verification": {
    roles: FELLOW_MANAGEMENT_ROLES,
  },
  "/dashboard/management/session-verification": {
    roles: ADMIN_ROLES,
  },
  "/dashboard/management/community": {
    roles: COMMUNITY_SETTINGS_HUB_ROLES,
  },
  "/dashboard/management/system": {
    roles: SYSTEM_CONFIG_HUB_ROLES,
  },
  "/dashboard/management/system/features": {
    roles: MANAGEMENT_ROLES,
  },
  "/dashboard/management/notifications": {
    roles: ADMIN_ROLES,
  },
  "/dashboard/management/homepage": {
    roles: MANAGEMENT_ROLES,
  },
  "/dashboard/management/manage-users": {
    roles: ADMIN_ROLES,
  },
  "/dashboard/management/role-verification": {
    roles: FELLOW_MANAGEMENT_ROLES,
  },
  "/dashboard/management/mentor-verification": {
    roles: ADMIN_ROLES,
  },
  "/dashboard/management/manage-achievements": {
    roles: ADMIN_ROLES,
  },
  "/dashboard/management/manage-interns": {
    roles: INTERN_MANAGEMENT_ROLES,
  },
  "/dashboard/management/manage-interns/minutes": {
    roles: [ROLES.ADMIN, ROLES.ASSOCIATE, ROLES.INTERN, ROLES.INTERN_LEAD],
  },
  "/dashboard/management/manage-interest-groups": {
    roles: FELLOW_MANAGEMENT_ROLES,
  },
  "/dashboard/management/manage-roles": {
    roles: ADMIN_ROLES,
  },
  "/dashboard/management/organizations": {
    roles: MANAGEMENT_ROLES,
  },
  "/dashboard/management/organizations/list": {
    roles: ADMIN_ROLES,
  },
  "/dashboard/management/organizations/transfer": {
    roles: ADMIN_ROLES,
  },
  "/dashboard/management/organizations/verify": {
    roles: FELLOW_MANAGEMENT_ROLES,
  },
  "/dashboard/management/organizations/departments": {
    roles: FELLOW_MANAGEMENT_ROLES,
  },
  "/dashboard/management/organizations/affiliation": {
    roles: MANAGEMENT_ROLES,
  },
  "/dashboard/management/verify-organizations": {
    roles: ADMIN_ROLES,
  },
  "/dashboard/management/karma-voucher": {
    roles: FELLOW_MANAGEMENT_ROLES,
  },
  "/dashboard/management/lc-meetup-verification": {
    roles: ADMIN_ROLES,
  },
  "/dashboard/management/college-levels": {
    roles: FELLOW_MANAGEMENT_ROLES,
  },
  "/dashboard/management/tasks": {
    roles: ADMIN_ROLES,
  },
  "/dashboard/management/tasks/bulk-import": {
    roles: ADMIN_ROLES,
  },
  "/dashboard/management/tasks/create": {
    roles: ADMIN_ROLES,
  },
  "/dashboard/management/tasks/edit": {
    roles: ADMIN_ROLES,
  },
  "/dashboard/management/tasks/task-type": {
    roles: ADMIN_ROLES,
  },
  "/dashboard/management/tasks/task-verification": {
    roles: ADMIN_ROLES,
  },
  "/dashboard/management/manage-locations": {
    roles: ADMIN_ROLES,
  },
  "/dashboard/management/channels": {
    roles: MANAGEMENT_ROLES,
  },
  "/dashboard/management/discord-moderation": {
    roles: DISCORD_MODERATION_ROLES,
  },
  "/dashboard/management/error-log": {
    roles: TECH_ROLES,
  },
  "/dashboard/management/dynamic-type": {
    roles: ADMIN_ROLES,
  },
  "/dashboard/management/manage-skills": {
    roles: ADMIN_ROLES,
  },
  "/dashboard/management/manage-launchpad": {
    roles: ADMIN_ROLES,
  },
  "/dashboard/management/manage-companies": {
    roles: ADMIN_ROLES,
  },
  "/dashboard/management/manage-departments": {
    roles: ADMIN_ROLES,
  },
  "/dashboard/management/affiliation": {
    roles: ADMIN_ROLES,
  },
  "/dashboard/management/organization-transfer": {
    roles: ADMIN_ROLES,
  },

  // ── Weekly Twitches (Admin + Associate + IG Leads) ───────
  "/dashboard/management/weekly-twitches": {
    roles: [
      ROLES.ADMIN,
      ROLES.ASSOCIATE,
      ROLES.IG_LEAD,
      ROLES.ZONAL_CAMPUS_LEAD,
      ROLES.DISTRICT_CAMPUS_LEAD,
    ],
  },

  // ── URL Shortener (broader access) ───────────────────────
  "/dashboard/url-shortener": {
    roles: MANAGEMENT_ROLES,
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
