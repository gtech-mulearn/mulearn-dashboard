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

// Roles
export {
  ROLES,
  type RoleValue,
  type RoleKey,
  igCampusLeadRole,
  igLeadRole,
  ADMIN_ROLES,
  MANAGEMENT_ROLES,
  CAMPUS_MANAGEMENT_ROLES,
  ZONAL_ROLES,
  DISTRICT_ROLES,
  TECH_ROLES,
} from "./roles";

// Permissions
export {
  PERMISSIONS,
  type Permission,
  getRolesForPermission,
  hasPermission,
  hasAnyRole,
} from "./permissions";

// Route Access (used by middleware)
export {
  routeAccessMap,
  findRouteConfig,
  type RouteConfig,
} from "./route-access";

// Token Store (migrated from src/lib/auth.ts)
export { authStore } from "./token-store";
