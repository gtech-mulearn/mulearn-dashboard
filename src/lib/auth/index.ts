/**
 * Auth Library Index
 *
 * 📍 src/lib/auth/index.ts
 *
 * Public API for the auth library.
 * Import from `@/lib/auth` — never from internal files.
 *
 * Note: server.ts is NOT re-exported here because it uses
 * `next/headers` which is only available in Server Components.
 * Import server utilities directly: `import { requireRole } from "@/lib/auth/server"`
 */

// Permissions
export {
  getRolesForPermission,
  hasAnyRole,
  hasPermission,
  PERMISSIONS,
  type Permission,
} from "./permissions";
// Public dashboard routes (used by middleware + client guard)
export { isPublicDashboardRoute } from "./public-routes";
// Return-path (`ruri`) sanitiser — used by the refresh route + login client
export { sanitizeReturnPath } from "./return-path";
// Role-Based Routing
export { getRoleHomePath } from "./role-routing";
// Roles
export {
  ADMIN_ROLES,
  ASSOCIATE_MANAGEMENT_ROLES,
  CAMPUS_MANAGEMENT_ROLES,
  COMMUNITY_SETTINGS_HUB_ROLES,
  DISCORD_MODERATION_ROLES,
  DISTRICT_ROLES,
  FELLOW_MANAGEMENT_ROLES,
  INTERN_MANAGEMENT_ROLES,
  igCampusLeadRole,
  igLeadRole,
  MANAGEMENT_HUB_ROLES,
  MANAGEMENT_ROLES,
  ROLES,
  type RoleKey,
  type RoleValue,
  SYSTEM_CONFIG_HUB_ROLES,
  TECH_ROLES,
  USER_MANAGEMENT_HUB_ROLES,
  ZONAL_ROLES,
} from "./roles";
// Route Access (used by middleware)
export {
  findRouteConfig,
  type RouteConfig,
  routeAccessMap,
} from "./route-access";

// Token Store (migrated from src/lib/auth.ts)
export { authStore } from "./token-store";
