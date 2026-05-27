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
  "users:verify": [ROLES.ADMIN],
  "users:export_csv": [ROLES.ADMIN],

  // ── Organization Management ──────────────────────────────
  "orgs:list": [ROLES.ADMIN],
  "orgs:manage": [ROLES.ADMIN],
  "orgs:verify": [ROLES.ADMIN],
  "orgs:transfer": [ROLES.ADMIN],

  // ── Campus Management ────────────────────────────────────
  "campus:manage": [ROLES.CAMPUS_LEAD, ROLES.LEAD_ENABLER],
  "campus:view_dashboard": [ROLES.CAMPUS_LEAD, ROLES.LEAD_ENABLER, ROLES.ADMIN],
  "campus:change_student_type": [ROLES.CAMPUS_LEAD, ROLES.LEAD_ENABLER],
  "campus:transfer_role": [ROLES.CAMPUS_LEAD],

  // ── Zonal & District ─────────────────────────────────────
  "zonal:view": [ROLES.ADMIN, ROLES.ZONAL_CAMPUS_LEAD],
  "district:view": [ROLES.ADMIN, ROLES.DISTRICT_CAMPUS_LEAD],

  // ── Interest Groups ──────────────────────────────────────
  "ig:manage": [ROLES.ADMIN],
  "ig:lead": [ROLES.ADMIN],
  "ig:export_csv": [ROLES.ADMIN],

  // ── Tasks ─────────────────────────────────────────────────
  "tasks:manage": [ROLES.ADMIN],
  "tasks:create": [ROLES.ADMIN],
  "tasks:bulk_import": [ROLES.ADMIN],
  "task_type:manage": [ROLES.ADMIN],

  // ── Karma ─────────────────────────────────────────────────
  "karma_voucher:manage": [ROLES.ADMIN],
  "karma_voucher:bulk_import": [ROLES.ADMIN],

  // ── Achievements ──────────────────────────────────────────
  "achievements:manage": [ROLES.ADMIN],
  "achievements:issue": [ROLES.ADMIN],
  "achievements:bulk_issue": [ROLES.ADMIN],

  // ── Events & Hackathons ───────────────────────────────────
  "events:manage": [
    ROLES.ADMIN,
    ROLES.CAMPUS_LEAD,
    ROLES.LEAD_ENABLER,
    ROLES.COMPANY,
    ROLES.ENABLER,
    ROLES.ZONAL_CAMPUS_LEAD,
    ROLES.DISTRICT_CAMPUS_LEAD,
  ],
  "events:manage_co_owners": [
    ROLES.ADMIN,
    ROLES.CAMPUS_LEAD,
    ROLES.LEAD_ENABLER,
    ROLES.COMPANY,
    ROLES.ENABLER,
    ROLES.ZONAL_CAMPUS_LEAD,
    ROLES.DISTRICT_CAMPUS_LEAD,
  ],
  "events:accept_collaboration": [
    ROLES.ADMIN,
    ROLES.CAMPUS_LEAD,
    ROLES.COMPANY,
  ],
  "events:reject_collaboration": [
    ROLES.ADMIN,
    ROLES.CAMPUS_LEAD,
    ROLES.COMPANY,
  ],
  "hackathons:manage": [ROLES.ADMIN],

  // ── Roles Management ──────────────────────────────────────
  "roles:manage": [ROLES.ADMIN],

  // ── URL Shortener ─────────────────────────────────────────
  "url_shortener:manage": [ROLES.ADMIN, ROLES.ASSOCIATE],

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
  "lc_meetup:verify": [ROLES.ADMIN],

  // ── Coupon ────────────────────────────────────────────────
  "coupon:manage": [ROLES.ADMIN],

  // ── Task Reports ──────────────────────────────────────────
  "task_reports:view": [ROLES.ADMIN, ROLES.APPRAISER],

  // ── Company ───────────────────────────────────────────────
  "company:profile:view": [ROLES.COMPANY, ROLES.ADMIN],
  "company:profile:edit": [ROLES.COMPANY],
  "company:jobs:view": [ROLES.COMPANY, ROLES.ADMIN],
  "company:jobs:manage": [ROLES.COMPANY],
  "company:verification:manage": [ROLES.ADMIN],
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
 * Dynamic permission checks for permissions that can't be expressed
 * as static role values (e.g. IG leads with per-IG role strings).
 */
export const DYNAMIC_PERMISSION_CHECKS: Partial<
  Record<Permission, (roles: readonly string[]) => boolean>
> = {
  "ig:lead": (roles) =>
    roles.some((r) => r.endsWith(" IGLead")) || roles.includes(ROLES.ADMIN),

  "events:manage": (roles) =>
    roles.some((r) => r.endsWith(" IGLead") || r.endsWith(" CampusLead")),

  "events:manage_co_owners": (roles) =>
    roles.some((r) => r.endsWith(" IGLead") || r.endsWith(" CampusLead")),

  "events:accept_collaboration": (roles) =>
    roles.some((r) => r.endsWith(" IGLead") || r.endsWith(" CampusLead")),

  "events:reject_collaboration": (roles) =>
    roles.some((r) => r.endsWith(" IGLead") || r.endsWith(" CampusLead")),
};

/**
 * Check if a user's roles satisfy a specific permission.
 * Checks static roles first, then dynamic predicates.
 * This is a pure function — no React dependency.
 */
export function hasPermission(
  userRoles: readonly string[],
  permission: Permission,
): boolean {
  const requiredRoles = PERMISSIONS[permission];
  if (requiredRoles.some((role) => userRoles.includes(role))) return true;
  return DYNAMIC_PERMISSION_CHECKS[permission]?.(userRoles) ?? false;
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
