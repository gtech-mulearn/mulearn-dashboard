/**
 * Server-Side Auth Utilities
 *
 * 📍 src/lib/auth/server.ts
 *
 * Functions for server-side authentication and authorization.
 * Use in Server Components, Server Actions, and Route Handlers.
 *
 * These functions call the backend API with the JWT from cookies
 * and provide strongly-typed user data with role information.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { RoleValue } from "./roles";
import type { Permission } from "./permissions";
import { hasPermission, hasAnyRole } from "./permissions";

// ─── Types ──────────────────────────────────────────────────

export interface ServerUser {
  muid: string;
  full_name: string;
  email: string;
  roles: string[];
  dynamic_type: string[];
  profile_pic: string | null;
  exist_in_guild: boolean;
  user_domains: string[];
  user_endgoals: string[];
}

// ─── Server Auth Functions ──────────────────────────────────

/**
 * Get the current authenticated user from a Server Component.
 * Fetches user info from the backend using the JWT in cookies.
 *
 * Results are cached for 60 seconds via Next.js `fetch` cache
 * and tagged with "user-info" for targeted revalidation.
 *
 * @returns The user object, or `null` if not authenticated.
 *
 * @example
 * ```tsx
 * // In a Server Component
 * const user = await getServerUser();
 * if (!user) redirect("/login");
 * ```
 */
export async function getServerUser(): Promise<ServerUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) return null;

  try {
    const backendUrl =
      process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      console.error("[auth/server] BACKEND_URL env var is not set");
      return null;
    }

    const res = await fetch(`${backendUrl}/api/v1/dashboard/user/info/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 60, tags: ["user-info"] },
    });

    if (!res.ok) {
      // Token expired or invalid — don't throw, just return null
      return null;
    }

    const data = await res.json();

    if (data.hasError) return null;

    return data.response as ServerUser;
  } catch (error) {
    console.error("[auth/server] Failed to fetch user info:", error);
    return null;
  }
}

/**
 * Require authentication in a Server Component.
 * Redirects to `/login` if not authenticated.
 *
 * @returns The authenticated user.
 *
 * @example
 * ```tsx
 * export default async function DashboardPage() {
 *   const user = await requireAuth();
 *   return <p>Welcome, {user.full_name}</p>;
 * }
 * ```
 */
export async function requireAuth(): Promise<ServerUser> {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Require specific roles in a Server Component.
 * Redirects to `/dashboard` with `unauthorized=true` if the user
 * doesn't have at least one of the required roles.
 *
 * @param allowedRoles - Array of role values. User must have at least one.
 * @returns The authenticated and authorized user.
 *
 * @example
 * ```tsx
 * import { ROLES } from "@/lib/auth";
 *
 * export default async function AdminPage() {
 *   const user = await requireRole([ROLES.ADMIN]);
 *   // This code only runs for admins
 * }
 * ```
 */
export async function requireRole(
  allowedRoles: readonly string[],
): Promise<ServerUser> {
  const user = await requireAuth();

  if (allowedRoles.length > 0 && !hasAnyRole(user.roles, allowedRoles)) {
    redirect("/dashboard?unauthorized=true");
  }

  return user;
}

/**
 * Require a specific permission in a Server Component.
 * Redirects to `/dashboard` with `unauthorized=true` if the user
 * doesn't have the required permission.
 *
 * @param permission - A permission key from the PERMISSIONS map.
 * @returns The authenticated and authorized user.
 *
 * @example
 * ```tsx
 * export default async function UserManagementPage() {
 *   const user = await requirePermission("users:list");
 *   // This code only runs for roles that have users:list permission
 * }
 * ```
 */
export async function requirePermission(
  permission: Permission,
): Promise<ServerUser> {
  const user = await requireAuth();

  if (!hasPermission(user.roles, permission)) {
    redirect("/dashboard?unauthorized=true");
  }

  return user;
}
