/**
 * Role Constants
 *
 * 📍 src/lib/auth/roles.ts
 *
 * Single source of truth for all role values.
 * These MUST match the backend `RoleType` enum values exactly
 * (see: mulearnbackend/utils/types.py → class RoleType).
 *
 * If a role is renamed on the backend, update it HERE and
 * everything downstream (permissions, route-access, components) updates automatically.
 */

// ─── Role Values ────────────────────────────────────────────
// Each value is the exact string stored in the JWT payload's `roles` array.

export const ROLES = {
  ADMIN: "Admins",
  DISCORD_MODERATOR: "Discord Moderator",
  EX_OFFICIAL: "Ex Official",
  FELLOW: "Fellow",
  ASSOCIATE: "Associate",
  ZONAL_CAMPUS_LEAD: "Zonal Campus Lead",
  APPRAISER: "Appraiser",
  COMPANY: "Company",
  DISTRICT_CAMPUS_LEAD: "District Campus Lead",
  MENTOR: "Mentor",
  INTERN: "Intern",
  CAMPUS_LEAD: "Campus Lead",
  BOT_DEV: "Bot Dev",
  PRE_MEMBER: "Pre Member",
  SUSPENDED: "Suspended",
  STUDENT: "Student",
  ENABLER: "Enabler",
  TECH_TEAM: "Tech Team",
  IG_LEAD: "IG Lead",
  CAMPUS_ACTIVATION_TEAM: "Campus Activation Team",
  LEAD_ENABLER: "Lead Enabler",
} as const;

/** Union type of all role string values */
export type RoleValue = (typeof ROLES)[keyof typeof ROLES];

/** Union type of all role keys */
export type RoleKey = keyof typeof ROLES;

// ─── Dynamic Role Helpers ──────────────────────────────────
// Some roles are generated dynamically per-IG on the backend.
// e.g., "WebDev CampusLead", "AI IGLead"

/**
 * Build a dynamic IG Campus Lead role string.
 * Matches: `RoleType.IG_CAMPUS_LEAD_ROLE(ig_code)` on backend.
 */
export function igCampusLeadRole(igCode: string): string {
  return `${igCode} CampusLead`;
}

/**
 * Build a dynamic IG Lead role string.
 * Matches: `RoleType.IG_LEAD_ROLE(ig_code)` on backend.
 */
export function igLeadRole(igCode: string): string {
  return `${igCode} IGLead`;
}

/**
 * Returns true if any role in the array is a dynamic IG lead role.
 * e.g. "WEBDEV IGLead", "AI IGLead" — NOT the static "IG Lead" constant.
 */
export function hasIgLeadRole(roles: readonly string[]): boolean {
  return roles.some((r) => r.endsWith(" IGLead"));
}

// ─── Role Group Presets ────────────────────────────────────
// Commonly used role combinations. Use these instead of
// repeating arrays of roles across the codebase.

/** Roles with full platform administration access */
export const ADMIN_ROLES = [ROLES.ADMIN] as const;

/** Roles that can perform management tasks (admin-level) */
export const MANAGEMENT_ROLES = [ROLES.ADMIN, ROLES.ASSOCIATE] as const;

/** Roles that can manage campus-level operations */
export const CAMPUS_MANAGEMENT_ROLES = [
  ROLES.CAMPUS_LEAD,
  ROLES.LEAD_ENABLER,
  ROLES.ENABLER,
] as const;

/** Roles that can view zonal dashboards */
export const ZONAL_ROLES = [ROLES.ADMIN, ROLES.ZONAL_CAMPUS_LEAD] as const;

/** Roles that can view district dashboards */
export const DISTRICT_ROLES = [
  ROLES.ADMIN,
  ROLES.DISTRICT_CAMPUS_LEAD,
] as const;

/**
 * Roles that can view IG dashboards (static values only).
 * NOTE: Dynamic IG leads ("{igCode} IGLead") are NOT in this array.
 * Use `hasIgLeadRole(userRoles)` for dynamic checks.
 */
export const IG_ROLES = [ROLES.ADMIN] as const;

/** Roles with technical access (error logs, debugging tools) */
export const TECH_ROLES = [ROLES.ADMIN, ROLES.TECH_TEAM] as const;
