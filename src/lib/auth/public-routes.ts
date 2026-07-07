/**
 * Public Dashboard Routes
 *
 * 📍 src/lib/auth/public-routes.ts
 *
 * Single source of truth for `/dashboard/*` routes that are viewable WITHOUT
 * authentication. Consumed by the edge gate (src/proxy.ts) and the client gate
 * (src/app/(dashboard)/onboarding-guard.tsx) so the carve-out is defined once.
 *
 * Matching mirrors the helpers in proxy.ts: a route matches when the pathname
 * equals it exactly or starts with `${route}/` (covers dynamic sub-paths like
 * /dashboard/mujourney/<muid> and /dashboard/interest-groups/<id>).
 */

// Prefix routes: these and any sub-path under them are public.
const PUBLIC_DASHBOARD_PREFIXES = [
  "/dashboard/mujourney",
  "/dashboard/search",
  "/dashboard/interest-groups",
];

export function isPublicDashboardRoute(pathname: string): boolean {
  // Public profile pages: /profile/<slug> (2 segments).
  // /dashboard/profile (2 segments) stays protected (the user's own profile).
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length === 2 && parts[0] === "profile") {
    return true;
  }

  // Legacy fallback for old /dashboard/profile/<slug> route
  if (
    parts.length === 3 &&
    parts[0] === "dashboard" &&
    parts[1] === "profile"
  ) {
    return true;
  }

  return PUBLIC_DASHBOARD_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
