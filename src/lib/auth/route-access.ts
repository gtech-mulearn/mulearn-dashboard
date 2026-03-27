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

import { ROLES } from "./roles";

// ─── Types ──────────────────────────────────────────────────

export interface RouteConfig {
  /** Roles allowed to access this route. Empty = any authenticated user. */
  roles: readonly string[];
}

// ─── Route Access Map ──────────────────────────────────────

export const routeAccessMap: Record<string, RouteConfig> = {
  // ── Public Dashboard (any authenticated user) ────────────
  "/dashboard": { roles: [] },
  "/dashboard/profile": { roles: [] },
  "/dashboard/leaderboard": { roles: [] },
  "/dashboard/learning-circles": { roles: [] },
  "/dashboard/ig": { roles: [] },
  "/dashboard/campus": { roles: [] },
  "/dashboard/search": { roles: [] },
  "/dashboard/settings": { roles: [] },
  "/dashboard/hackathon": { roles: [] },
  "/dashboard/events": { roles: [] },
  "/dashboard/connect-discord": { roles: [] },
  "/dashboard/refer": { roles: [] },

  // ── Campus Lead Dashboard ────────────────────────────────
  "/dashboard/campus/manage": {
    roles: [ROLES.CAMPUS_LEAD, ROLES.LEAD_ENABLER],
  },

  // ── Zonal Dashboard ──────────────────────────────────────
  "/dashboard/zonal": {
    roles: [ROLES.ADMIN, ROLES.FELLOW, ROLES.ZONAL_CAMPUS_LEAD],
  },

  // ── District Dashboard ───────────────────────────────────
  "/dashboard/district": {
    roles: [ROLES.ADMIN, ROLES.FELLOW, ROLES.DISTRICT_CAMPUS_LEAD],
  },

  // ── Interest Group Dashboard ─────────────────────────────
  "/dashboard/interest-groups": {
    roles: [ROLES.ADMIN, ROLES.FELLOW, ROLES.IG_LEAD],
  },

  // ── Admin Routes ─────────────────────────────────────────
  // Broad admin prefix — catches any /dashboard/admin/* route
  "/dashboard/admin": {
    roles: [ROLES.ADMIN],
  },

  // ── Management Routes (Admin + Fellow) ───────────────────
  "/dashboard/management": {
    roles: [ROLES.ADMIN, ROLES.FELLOW],
  },
  "/dashboard/management/user-management": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/user-role-verification": {
    roles: [ROLES.ADMIN, ROLES.FELLOW],
  },
  "/dashboard/management/manage-achievements": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/manage-interest-groups": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/manage-roles": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/organizations": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/verify-organizations": {
    roles: [ROLES.ADMIN, ROLES.FELLOW],
  },
  "/dashboard/management/karma-voucher": {
    roles: [ROLES.ADMIN, ROLES.FELLOW],
  },
  "/dashboard/management/lc-meetup-verification": {
    roles: [ROLES.ADMIN, ROLES.FELLOW],
  },
  "/dashboard/management/college-levels": {
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
  "/dashboard/management/manage-departments": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/affiliation": {
    roles: [ROLES.ADMIN],
  },
  "/dashboard/management/organization-transfer": {
    roles: [ROLES.ADMIN],
  },

  // ── URL Shortener (broader access) ───────────────────────
  "/dashboard/url-shortener": {
    roles: [ROLES.ADMIN, ROLES.FELLOW, ROLES.ASSOCIATE],
  },

  // ── Task Management ──────────────────────────────────────
  "/dashboard/tasks": {
    roles: [ROLES.ADMIN],
  },

  // ── Events Management ────────────────────────────────────
  "/dashboard/events/manage": {
    roles: [ROLES.ADMIN, ROLES.FELLOW],
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
