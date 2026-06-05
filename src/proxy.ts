/**
 * Next.js Proxy
 *
 * 📍 src/proxy.ts
 *
 * Route protection with 2-tier authentication and authorization:
 *   Tier 1: Cookie existence check (is user logged in?)
 *   Tier 2: JWT role extraction + route-access map (does user have the right role?)
 *
 * This is Layer 1 of the 4-layer RBAC system.
 * It runs on the edge before any page renders.
 *
 * IMPORTANT: JWT is decoded (base64) here, NOT verified (no secret key on edge).
 * Verification happens at the backend API layer (Layer 4).
 * This layer prevents unauthorized page renders, not unauthorized data access.
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ─── Inline Route Access Map ───────────────────────────────
// We inline the route config here because middleware runs on the edge
// and cannot import from arbitrary modules in all deployment targets.
// This is kept in sync with src/lib/auth/route-access.ts.

interface RouteConfig {
  roles: readonly string[];
}

const ROLE_VALUES = {
  ADMIN: "Admins",
  DISCORD_MODERATOR: "Discord Moderator",
  FELLOW: "Fellow",
  ASSOCIATE: "Associate",
  ZONAL_CAMPUS_LEAD: "Zonal Campus Lead",
  DISTRICT_CAMPUS_LEAD: "District Campus Lead",
  CAMPUS_LEAD: "Campus Lead",
  LEAD_ENABLER: "Lead Enabler",
  ENABLER: "Enabler",
  TECH_TEAM: "Tech Team",
  IG_LEAD: "IG Lead",
  INTERN: "Intern",
  COMPANY: "Company",
  MENTOR: "Mentor",
} as const;

/**
 * Routes that require specific roles.
 * Routes NOT listed here but under /dashboard = any authenticated user.
 * Empty roles array = any authenticated user.
 */
const ROLE_PROTECTED_ROUTES: Record<string, RouteConfig> = {
  // Campus Lead
  "/dashboard/campus/manage": {
    roles: [ROLE_VALUES.CAMPUS_LEAD, ROLE_VALUES.LEAD_ENABLER],
  },

  // Zonal/District
  "/dashboard/zonal": {
    roles: [ROLE_VALUES.ADMIN, ROLE_VALUES.ZONAL_CAMPUS_LEAD],
  },
  "/dashboard/district": {
    roles: [ROLE_VALUES.ADMIN, ROLE_VALUES.DISTRICT_CAMPUS_LEAD],
  },

  // Intern
  "/dashboard/intern": {
    roles: [ROLE_VALUES.ADMIN, ROLE_VALUES.INTERN],
  },

  // Admin-only
  "/dashboard/admin": { roles: [ROLE_VALUES.ADMIN] },

  // Management
  "/dashboard/management": { roles: [ROLE_VALUES.ADMIN] },
  "/dashboard/management/user-management": { roles: [ROLE_VALUES.ADMIN] },
  "/dashboard/management/manage-achievements": { roles: [ROLE_VALUES.ADMIN] },
  "/dashboard/management/manage-intern": {
    roles: [ROLE_VALUES.ADMIN, ROLE_VALUES.ASSOCIATE],
  },
  "/dashboard/management/manage-interest-groups": {
    roles: [ROLE_VALUES.ADMIN],
  },
  "/dashboard/management/manage-roles": { roles: [ROLE_VALUES.ADMIN] },
  "/dashboard/management/organizations": { roles: [ROLE_VALUES.ADMIN] },
  "/dashboard/management/college-levels": { roles: [ROLE_VALUES.ADMIN] },
  "/dashboard/management/manage-locations": { roles: [ROLE_VALUES.ADMIN] },
  "/dashboard/management/channels": { roles: [ROLE_VALUES.ADMIN] },
  "/dashboard/management/error-log": {
    roles: [ROLE_VALUES.ADMIN, ROLE_VALUES.TECH_TEAM],
  },
  "/dashboard/management/discord-moderation": {
    roles: [ROLE_VALUES.ADMIN, ROLE_VALUES.DISCORD_MODERATOR],
  },
  "/dashboard/management/dynamic-type": { roles: [ROLE_VALUES.ADMIN] },
  "/dashboard/management/manage-skills": { roles: [ROLE_VALUES.ADMIN] },
  "/dashboard/management/manage-launchpad": { roles: [ROLE_VALUES.ADMIN] },
  "/dashboard/management/manage-departments": { roles: [ROLE_VALUES.ADMIN] },
  "/dashboard/management/affiliation": { roles: [ROLE_VALUES.ADMIN] },
  "/dashboard/management/organization-transfer": {
    roles: [ROLE_VALUES.ADMIN],
  },

  // URL Shortener (broader access)
  "/dashboard/url-shortener": {
    roles: [ROLE_VALUES.ADMIN, ROLE_VALUES.ASSOCIATE],
  },

  "/dashboard/edit-ig": {
    roles: [ROLE_VALUES.ADMIN],
    // dynamic: any "{code} IGLead" role — handled in middleware below
  },

  // Tasks
  "/dashboard/tasks": { roles: [ROLE_VALUES.ADMIN] },

  // Events Management
  "/dashboard/manage-events": {
    roles: [
      ROLE_VALUES.ADMIN,
      ROLE_VALUES.CAMPUS_LEAD,
      ROLE_VALUES.LEAD_ENABLER,
      ROLE_VALUES.COMPANY,
      ROLE_VALUES.ENABLER,
      ROLE_VALUES.MENTOR,
      ROLE_VALUES.ZONAL_CAMPUS_LEAD,
      ROLE_VALUES.DISTRICT_CAMPUS_LEAD,
    ],
    // dynamic: any "{code} IGLead" or "{code} CampusLead" — handled in middleware below
  },

  // Company Dashboard
  "/dashboard/company": {
    roles: [ROLE_VALUES.COMPANY],
  },

  // Mentor Dashboard
  "/dashboard/mentor": {
    roles: [ROLE_VALUES.MENTOR],
  },
};

// ─── Route Classification ──────────────────────────────────

const AUTH_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

const ONBOARDING_ROUTES = ["/onboarding/organization", "/onboarding/interests"];

// ─── Helper Functions ──────────────────────────────────────

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isOnboardingRoute(pathname: string): boolean {
  return ONBOARDING_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isProtectedRoute(pathname: string): boolean {
  // Exclude public profile pages: /dashboard/profile/[slug]
  // Note: /dashboard/profile/ (with optional trailing slash) is protected, but /dashboard/profile/some-slug is public
  const parts = pathname.split("/").filter(Boolean);
  if (
    parts.length === 3 &&
    parts[0] === "dashboard" &&
    parts[1] === "profile"
  ) {
    return false;
  }

  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/admin")
  );
}

function isAuthenticated(request: NextRequest): boolean {
  const accessToken = request.cookies.get("accessToken");
  const refreshToken = request.cookies.get("refreshToken");
  return !!(accessToken?.value || refreshToken?.value);
}

/**
 * Decode JWT payload without verification.
 * Safe for edge runtime — no crypto needed.
 * Returns roles array from the JWT, or empty array on failure.
 */
function extractRolesFromToken(token: string): string[] {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return [];

    // Base64url decode the payload (middle part)
    const payload = parts[1];
    const padded = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(padded);
    const parsed = JSON.parse(decoded);

    // Check expiry
    if (parsed.expiry) {
      const expiry = new Date(parsed.expiry);
      if (expiry < new Date()) return [];
    }

    return Array.isArray(parsed.roles) ? parsed.roles : [];
  } catch {
    return [];
  }
}

/**
 * Find the most specific route config for a pathname.
 * Uses longest-prefix matching.
 */
function findRouteConfig(pathname: string): RouteConfig | null {
  // Exact match first
  if (ROLE_PROTECTED_ROUTES[pathname]) {
    return ROLE_PROTECTED_ROUTES[pathname];
  }

  // Longest prefix match
  const matches = Object.keys(ROLE_PROTECTED_ROUTES)
    .filter((route) => pathname.startsWith(`${route}/`) || pathname === route)
    .sort((a, b) => b.length - a.length);

  return matches.length > 0 ? ROLE_PROTECTED_ROUTES[matches[0]] : null;
}

// ─── Middleware ─────────────────────────────────────────────

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = isAuthenticated(request);

  // Skip static assets, API routes, and files with extensions
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // ── Auth routes: redirect logged-in users to dashboard ──
  if (isLoggedIn && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ── Onboarding routes: require auth only ────────────────
  if (isOnboardingRoute(pathname)) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // ── Protected routes: require login ─────────────────────
  if (isProtectedRoute(pathname)) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("ruri", pathname.replace("/", ""));
      return NextResponse.redirect(loginUrl);
    }

    // ── Role-based route protection (Layer 1 RBAC) ────────
    const routeConfig = findRouteConfig(pathname);

    if (routeConfig && routeConfig.roles.length > 0) {
      const accessToken = request.cookies.get("accessToken")?.value;

      if (accessToken) {
        const userRoles = extractRolesFromToken(accessToken);
        const hasStaticRole = routeConfig.roles.some((r) =>
          userRoles.includes(r),
        );
        // Dynamic check: per-IG/campus roles like "{code} IGLead" / "{code} CampusLead"
        const hasIgLead =
          pathname.startsWith("/dashboard/edit-ig") &&
          userRoles.some((r) => r.endsWith(" IGLead"));
        const hasEventsDynamic =
          pathname.startsWith("/dashboard/manage-events") &&
          userRoles.some(
            (r) => r.endsWith(" IGLead") || r.endsWith(" CampusLead"),
          );
        const hasAccess = hasStaticRole || hasIgLead || hasEventsDynamic;

        if (!hasAccess) {
          // Redirect to dashboard with unauthorized flag
          const url = new URL("/dashboard", request.url);
          url.searchParams.set("unauthorized", "true");
          return NextResponse.redirect(url);
        }
      } else {
        // No accessToken but refreshToken present — redirect through the
        // server-side refresh endpoint so roles can be verified after refresh.
        const refreshUrl = new URL("/api/auth/refresh", request.url);
        refreshUrl.searchParams.set("ruri", pathname.slice(1));
        return NextResponse.redirect(refreshUrl);
      }
    }
  }

  return NextResponse.next();
}

// ─── Matcher Configuration ─────────────────────────────────

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
  ],
};
