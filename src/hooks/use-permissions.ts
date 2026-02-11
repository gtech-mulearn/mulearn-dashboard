/**
 * usePermissions Hook
 *
 * 📍 src/hooks/use-permissions.ts
 *
 * Client-side hook for checking user permissions and roles.
 * Provides memoized helper functions for granular access control.
 *
 * This is the recommended way to check permissions in client components.
 * For conditional rendering, prefer `<RoleGate>` component instead.
 */

"use client";

import { useMemo } from "react";
import { useUserInfo } from "@/features/auth";
import { type Permission, hasPermission, hasAnyRole } from "@/lib/auth";

// ─── Return Type ────────────────────────────────────────────

interface UsePermissionsReturn {
  /** The user's roles. Empty array if not authenticated. */
  roles: readonly string[];

  /** The user's dynamic types. Empty array if none. */
  dynamicTypes: readonly string[];

  /** Whether user data is still loading. */
  isLoading: boolean;

  /** Whether the user is authenticated. */
  isAuthenticated: boolean;

  /**
   * Check if the user has a specific permission.
   *
   * @example
   * ```ts
   * const { can } = usePermissions();
   * if (can("users:manage")) { showAdminPanel(); }
   * ```
   */
  can: (permission: Permission) => boolean;

  /**
   * Check if the user has ANY of the given permissions.
   *
   * @example
   * ```ts
   * const { canAny } = usePermissions();
   * if (canAny(["campus:manage", "campus:view_dashboard"])) { ... }
   * ```
   */
  canAny: (permissions: Permission[]) => boolean;

  /**
   * Check if the user has ALL of the given permissions.
   *
   * @example
   * ```ts
   * const { canAll } = usePermissions();
   * if (canAll(["users:read", "users:write"])) { ... }
   * ```
   */
  canAll: (permissions: Permission[]) => boolean;

  /**
   * Check if the user has any of the specified roles.
   *
   * @example
   * ```ts
   * const { hasRole } = usePermissions();
   * if (hasRole([ROLES.ADMIN, ROLES.FELLOW])) { ... }
   * ```
   */
  hasRole: (allowedRoles: readonly string[]) => boolean;
}

// ─── Hook ───────────────────────────────────────────────────

export function usePermissions(): UsePermissionsReturn {
  const { data: user, isLoading } = useUserInfo();

  const roles = useMemo(() => user?.roles ?? [], [user?.roles]);
  const dynamicTypes = useMemo(
    () => user?.dynamic_type ?? [],
    [user?.dynamic_type],
  );

  const can = useMemo(() => {
    return (permission: Permission): boolean => {
      if (!user) return false;
      return hasPermission(user.roles, permission);
    };
  }, [user]);

  const canAny = useMemo(() => {
    return (permissions: Permission[]): boolean => {
      if (!user) return false;
      return permissions.some((p) => hasPermission(user.roles, p));
    };
  }, [user]);

  const canAll = useMemo(() => {
    return (permissions: Permission[]): boolean => {
      if (!user) return false;
      return permissions.every((p) => hasPermission(user.roles, p));
    };
  }, [user]);

  const hasRoleFn = useMemo(() => {
    return (allowedRoles: readonly string[]): boolean => {
      if (!user) return false;
      return hasAnyRole(user.roles, allowedRoles);
    };
  }, [user]);

  return {
    roles,
    dynamicTypes,
    isLoading,
    isAuthenticated: !!user,
    can,
    canAny,
    canAll,
    hasRole: hasRoleFn,
  };
}
