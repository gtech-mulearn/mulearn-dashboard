/**
 * Permission Definitions
 *
 * 📍 src/lib/auth/permissions.ts
 *
 * Maps granular permission keys to the roles that grant them.
 * Use permissions instead of raw roles in components and hooks
 * for better readability and easier maintenance.
 *
 * Pattern: "domain:action" → [roles that have this permission]
 *
 * When the backend adds a new role or changes access rules,
 * update only this file — all components using `usePermissions()`
 * and `<RoleGate>` will automatically reflect the change.
 */

import { ROLES, type RoleValue } from "./roles";

// ─── Permission Map ────────────────────────────────────────

export const PERMISSIONS = {
  // ── User Management ──────────────────────────────────────
  "users:list": [ROLES.ADMIN],
  "users:read": [ROLES.ADMIN],
  "users:write": [ROLES.ADMIN],
  "users:delete": [ROLES.ADMIN],
  "users:verify": [ROLES.ADMIN, ROLES.FELLOW],
  "users:export_csv": [ROLES.ADMIN],

  // ── Organization Management ──────────────────────────────
  "orgs:list": [ROLES.ADMIN],
  "orgs:manage": [ROLES.ADMIN],
  "orgs:verify": [ROLES.ADMIN, ROLES.FELLOW],
  "orgs:transfer": [ROLES.ADMIN],

  // ── Campus Management ────────────────────────────────────
  "campus:manage": [ROLES.CAMPUS_LEAD, ROLES.LEAD_ENABLER],
  "campus:view_dashboard": [ROLES.CAMPUS_LEAD, ROLES.LEAD_ENABLER, ROLES.ADMIN],
  "campus:change_student_type": [ROLES.CAMPUS_LEAD, ROLES.LEAD_ENABLER],
  "campus:transfer_role": [ROLES.CAMPUS_LEAD],

  // ── Zonal & District ─────────────────────────────────────
  "zonal:view": [ROLES.ADMIN, ROLES.FELLOW, ROLES.ZONAL_CAMPUS_LEAD],
  "district:view": [ROLES.ADMIN, ROLES.FELLOW, ROLES.DISTRICT_CAMPUS_LEAD],

  // ── Interest Groups ──────────────────────────────────────
  "ig:manage": [ROLES.ADMIN],
  "ig:lead": [ROLES.IG_LEAD, ROLES.ADMIN],
  "ig:export_csv": [ROLES.ADMIN],

  // ── Tasks ─────────────────────────────────────────────────
  "tasks:manage": [ROLES.ADMIN],
  "tasks:create": [ROLES.ADMIN],
  "tasks:bulk_import": [ROLES.ADMIN],
  "task_type:manage": [ROLES.ADMIN],

  // ── Karma ─────────────────────────────────────────────────
  "karma_voucher:manage": [ROLES.ADMIN, ROLES.FELLOW],
  "karma_voucher:bulk_import": [ROLES.ADMIN],

  // ── Achievements ──────────────────────────────────────────
  "achievements:manage": [ROLES.ADMIN],
  "achievements:issue": [ROLES.ADMIN, ROLES.FELLOW],
  "achievements:bulk_issue": [ROLES.ADMIN],

  // ── Events & Hackathons ───────────────────────────────────
  "events:manage": [ROLES.ADMIN],
  "hackathons:manage": [ROLES.ADMIN],

  // ── Roles Management ──────────────────────────────────────
  "roles:manage": [ROLES.ADMIN],

  // ── URL Shortener ─────────────────────────────────────────
  "url_shortener:manage": [ROLES.ADMIN, ROLES.FELLOW, ROLES.ASSOCIATE],

  // ── Error Log ─────────────────────────────────────────────
  "errors:view": [ROLES.ADMIN, ROLES.TECH_TEAM],

  // ── Dynamic Type ──────────────────────────────────────────
  "dynamic_type:manage": [ROLES.ADMIN],

  // ── Channels ──────────────────────────────────────────────
  "channels:manage": [ROLES.ADMIN],

  // ── Discord Moderation ────────────────────────────────────
  "discord:moderate": [ROLES.ADMIN, ROLES.DISCORD_MODERATOR],

  // ── Locations ─────────────────────────────────────────────
  "locations:manage": [ROLES.ADMIN],

  // ── Skills ────────────────────────────────────────────────
  "skills:manage": [ROLES.ADMIN],

  // ── College Levels ────────────────────────────────────────
  "college_levels:manage": [ROLES.ADMIN],

  // ── Affiliation ───────────────────────────────────────────
  "affiliation:manage": [ROLES.ADMIN],

  // ── Departments ───────────────────────────────────────────
  "departments:manage": [ROLES.ADMIN],

  // ── Launchpad ─────────────────────────────────────────────
  "launchpad:manage": [ROLES.ADMIN],

  // ── LC Meetup Verification ────────────────────────────────
  "lc_meetup:verify": [ROLES.ADMIN, ROLES.FELLOW],

  // ── Coupon ────────────────────────────────────────────────
  "coupon:manage": [ROLES.ADMIN],

  // ── Task Reports ──────────────────────────────────────────
  "task_reports:view": [ROLES.ADMIN, ROLES.APPRAISER],
} as const;

// ─── Types ──────────────────────────────────────────────────

/** Union type of all permission keys */
export type Permission = keyof typeof PERMISSIONS;

/** Get the role array for a permission */
export function getRolesForPermission(
  permission: Permission,
): readonly RoleValue[] {
  return PERMISSIONS[permission];
}

/**
 * Check if a user's roles satisfy a specific permission.
 * This is a pure function — no React dependency.
 */
export function hasPermission(
  userRoles: readonly string[],
  permission: Permission,
): boolean {
  const requiredRoles = PERMISSIONS[permission];
  return requiredRoles.some((role) => userRoles.includes(role));
}

/**
 * Check if a user's roles include any of the given roles.
 * Use this for direct role checks (not permission-based).
 */
export function hasAnyRole(
  userRoles: readonly string[],
  allowedRoles: readonly string[],
): boolean {
  return allowedRoles.some((role) => userRoles.includes(role));
}
