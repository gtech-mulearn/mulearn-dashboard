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
import { usePermissions } from "@/hooks/use-permissions";
import { NAV_ITEMS, type NavItem } from "@/lib/nav-config";

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
  const { can, hasRole, isLoading } = usePermissions();

  const filtered = useMemo(() => {
    const isVisible = (item: NavItem): boolean => {
      // No restriction → visible to all authenticated users
      if (!item.permission && (!item.roles || item.roles.length === 0)) {
        return true;
      }

      // Permission-based check
      if (item.permission && can(item.permission)) {
        return true;
      }

      // Role-based check
      if (item.roles && item.roles.length > 0 && hasRole(item.roles)) {
        return true;
      }

      return false;
    };

    const filterItems = (items: readonly NavItem[]): NavItem[] => {
      return items.filter(isVisible).map((item) => {
        if (item.children) {
          const filteredChildren = filterItems(item.children);
          // If the item itself is visible (checked by filter above)
          // we return it with its filtered children.
          return {
            ...item,
            children: filteredChildren,
          };
        }
        return item;
      });
    };

    const visibleItems = filterItems(NAV_ITEMS);

    return {
      mainItems: visibleItems.filter((item) => item.section === "main"),
      managementItems: visibleItems.filter(
        (item) => item.section === "management",
      ),
      bottomItems: visibleItems.filter((item) => item.section === "bottom"),
    };
  }, [can, hasRole]);

  return {
    ...filtered,
    isLoading,
  };
}
