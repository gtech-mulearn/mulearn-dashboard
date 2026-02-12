/**
 * RoleGate Component
 *
 * 📍 src/components/auth/role-gate.tsx
 *
 * Client-side component that conditionally renders children
 * based on the current user's roles or permissions.
 *
 * This is Layer 3 of the 4-layer RBAC system:
 *   1. Middleware (edge) — blocks unauthorized routes
 *   2. Server Component (server) — requireRole() prevents render
 *   3. RoleGate (client) — hides/shows UI elements ← THIS
 *   4. Backend decorator — rejects unauthorized API calls
 *
 * IMPORTANT: This component is for UX only (hiding buttons, nav items).
 * It does NOT provide security — the backend enforces actual access control.
 */

"use client";

import { type ReactNode, useMemo } from "react";
import { useUserInfo } from "@/features/auth";
import { PERMISSIONS, type Permission, hasAnyRole, hasPermission } from "@/lib/auth";

// ─── Props ──────────────────────────────────────────────────

interface RoleGateProps {
  /**
   * Render children only if the user has one of these roles.
   * Mutually exclusive with `permission`.
   */
  allowedRoles?: readonly string[];

  /**
   * Render children only if the user has this permission.
   * Mutually exclusive with `allowedRoles`.
   */
  permission?: Permission;

  /**
   * What to render when access is denied.
   * Defaults to `null` (hidden).
   */
  fallback?: ReactNode;

  /** The content to show when access is granted. */
  children: ReactNode;
}

// ─── Component ──────────────────────────────────────────────

/**
 * Conditionally renders children based on user roles or permissions.
 *
 * @example
 * ```tsx
 * // Permission-based (recommended)
 * <RoleGate permission="users:manage">
 *   <AdminPanel />
 * </RoleGate>
 *
 * // Role-based
 * <RoleGate allowedRoles={[ROLES.ADMIN, ROLES.FELLOW]}>
 *   <VerificationQueue />
 * </RoleGate>
 *
 * // With fallback
 * <RoleGate permission="campus:manage" fallback={<p>Access denied</p>}>
 *   <CampusDashboard />
 * </RoleGate>
 * ```
 */
export function RoleGate({
  allowedRoles,
  permission,
  fallback = null,
  children,
}: RoleGateProps) {
  const { data: user, isLoading } = useUserInfo();

  const hasAccess = useMemo(() => {
    if (!user) return false;

    // If no restrictions specified, grant access
    if (!permission && (!allowedRoles || allowedRoles.length === 0)) {
      return true;
    }

    // Permission-based check
    if (permission) {
      return hasPermission(user.roles, permission);
    }

    // Role-based check
    if (allowedRoles && allowedRoles.length > 0) {
      return hasAnyRole(user.roles, allowedRoles);
    }

    return false;
  }, [user, permission, allowedRoles]);

  // While loading, render nothing to avoid flash of content
  if (isLoading) return null;

  return hasAccess ? children : fallback;
}

// ─── Inverse Gate ───────────────────────────────────────────

interface RoleExcludeProps {
  /**
   * Hide children from users who have any of these roles.
   */
  excludeRoles?: readonly string[];

  /**
   * Hide children from users who have this permission.
   */
  excludePermission?: Permission;

  /** The content to show when the user does NOT have the excluded role/permission. */
  children: ReactNode;
}

/**
 * Inverse of RoleGate — hides content from specific roles.
 * Useful for hiding "upgrade" prompts from admins, etc.
 *
 * @example
 * ```tsx
 * <RoleExclude excludeRoles={[ROLES.ADMIN]}>
 *   <UpgradePrompt />
 * </RoleExclude>
 * ```
 */
export function RoleExclude({
  excludeRoles,
  excludePermission,
  children,
}: RoleExcludeProps) {
  const { data: user, isLoading } = useUserInfo();

  const isExcluded = useMemo(() => {
    if (!user) return false;

    if (excludePermission) {
      return hasPermission(user.roles, excludePermission);
    }

    if (excludeRoles && excludeRoles.length > 0) {
      return hasAnyRole(user.roles, excludeRoles);
    }

    return false;
  }, [user, excludePermission, excludeRoles]);

  if (isLoading) return null;

  return isExcluded ? null : children;
}
