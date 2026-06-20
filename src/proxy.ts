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
import { isPublicDashboardRoute } from "@/lib/auth/public-routes";
import { findRouteConfig } from "@/lib/auth/route-access";

// ─── Single Source of Truth ────────────────────────────────
// The route→role map and role constants live in src/lib/auth (route-access.ts,
// roles.ts) and are imported here. Both modules are pure TS object literals with
// no Node/edge-incompatible dependencies, so they bundle safely into the proxy.
// Do NOT re-inline the map here — keep one source of truth.

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
  // Public dashboard routes (mujourney, search, interest-groups, public
  // profile) are viewable without auth — single source of truth in public-routes.ts.
  if (isPublicDashboardRoute(pathname)) {
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

    // ── Access-token recovery (ALL protected routes) ─────
    // isLoggedIn is true when EITHER accessToken or refreshToken exists. When
    // the short-lived accessToken (and the client-readable isAuthenticated
    // flag) have expired but the longer-lived refreshToken survives, restore
    // them via the server refresh endpoint BEFORE rendering. This MUST run for
    // "any authenticated user" routes (roles: []) too — not only role-gated
    // ones. Otherwise the page renders, the client guard sees no isAuthenticated
    // flag and pushes to /login, and the proxy bounces /login back to /dashboard
    // (refreshToken still present) — an infinite redirect loop that presents as
    // a stuck loading screen.
    const accessToken = request.cookies.get("accessToken")?.value;
    if (!accessToken) {
      const refreshUrl = new URL("/api/auth/refresh", request.url);
      refreshUrl.searchParams.set("ruri", pathname.slice(1));
      return NextResponse.redirect(refreshUrl);
    }

    // ── Role-based route protection (Layer 1 RBAC) ────────
    const routeConfig = findRouteConfig(pathname);

    if (routeConfig && routeConfig.roles.length > 0) {
      const userRoles = extractRolesFromToken(accessToken);
      const hasStaticRole = routeConfig.roles.some((r) =>
        userRoles.includes(r),
      );
      // Dynamic check: per-IG/campus roles like "{code} IGLead" /
      // "{code} CampusLead" — defined alongside the route in route-access.ts.
      const hasDynamicRole = routeConfig.dynamicCheck?.(userRoles) ?? false;
      const hasAccess = hasStaticRole || hasDynamicRole;

      if (!hasAccess) {
        // Redirect to dashboard with unauthorized flag
        const url = new URL("/dashboard", request.url);
        url.searchParams.set("unauthorized", "true");
        return NextResponse.redirect(url);
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
