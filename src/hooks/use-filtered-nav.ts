/**
 * useFilteredNav Hook
 *
 * 📍 src/hooks/use-filtered-nav.ts
 *
 * Filters navigation items based on the current user's permissions and roles.
 * Returns items grouped by section, already filtered for visibility.
 *
 * This hook bridges nav-config.ts with the RBAC system:
 *   - Items with `permission` → checked via `usePermissions().can()`
 *   - Items with `roles` → checked via `usePermissions().hasRole()`
 *   - Items with neither → visible to all authenticated users
 */

"use client";

import { useMemo } from "react";
import { useMentorStatus } from "@/features/mentor/hooks";
import { usePermissions } from "@/hooks/use-permissions";
import { ROLES } from "@/lib/auth/roles";
import {
  type DynamicNavContext,
  NAV_ITEMS,
  type NavItem,
} from "@/lib/nav-config";

interface UseFilteredNavReturn {
  /** Main navigation items visible to the current user */
  mainItems: NavItem[];
  /** Management/admin items visible to the current user */
  managementItems: NavItem[];
  /** Bottom section items visible to the current user */
  bottomItems: NavItem[];
  /** Whether permissions are still loading */
  isLoading: boolean;
}

export function useFilteredNav(): UseFilteredNavReturn {
  const {
    can,
    hasRole,
    roles,
    isLoading: permissionsLoading,
  } = usePermissions();

  const isMentor = hasRole([ROLES.MENTOR]);
  const { data: mentorStatus, isLoading: mentorStatusLoading } =
    useMentorStatus(isMentor);

  const isMentorVerified = isMentor
    ? mentorStatus?.status === "APPROVED"
    : false;

  const dynamicContext: DynamicNavContext = useMemo(
    () => ({ isMentorVerified }),
    [isMentorVerified],
  );

  const filtered = useMemo(() => {
    const visible = NAV_ITEMS.filter((item) => {
      // No restriction → visible to all authenticated users
      if (
        !item.permission &&
        (!item.roles || item.roles.length === 0) &&
        !item.dynamicCheck
      ) {
        return true;
      }

      // Permission-based check
      if (item.permission) {
        return can(item.permission);
      }

      // Role-based check (static + dynamic)
      if (item.roles && item.roles.length > 0) {
        if (hasRole(item.roles)) {
          if (item.dynamicCheck)
            return item.dynamicCheck(roles, dynamicContext);
          return true;
        }
        if (item.dynamicCheck) return item.dynamicCheck(roles, dynamicContext);
        return false;
      }

      // Dynamic-only check (no static roles)
      if (item.dynamicCheck) return item.dynamicCheck(roles, dynamicContext);

      return false;
    });

    return {
      mainItems: visible.filter((item) => item.section === "main"),
      managementItems: visible.filter((item) => item.section === "management"),
      bottomItems: visible.filter((item) => item.section === "bottom"),
    };
  }, [can, hasRole, roles, dynamicContext]);

  const isLoading = permissionsLoading || (isMentor && mentorStatusLoading);

  return {
    ...filtered,
    isLoading,
  };
}
