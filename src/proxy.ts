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

// ─── FIFA Break Block (TEMPORARY) ──────────────────────────
// Kerala is celebrating football. The whole dashboard is dark until Tuesday
// morning, with no bypass for anyone — see
// docs/superpowers/specs/2026-07-20-fifa-break-block-design.md.
//
// The gate runs FIRST in `proxy()`, above every auth and RBAC branch, so no
// route, redirect or role check can leak past it. It lifts itself by the clock:
// once this instant passes the whole block becomes a dead branch and no deploy
// is needed to unlock. Delete the gate, /app/break and the `break` variant in
// state-display.tsx afterwards.
//
// Tue 21 Jul 2026, 10:00 IST == 04:30 UTC. Netlify's edge runs on UTC, so this
// is compared against `Date.now()` directly — the IST offset is applied here,
// once, and never recomputed at runtime.
const BREAK_ENDS_AT = Date.UTC(2026, 6, 21, 4, 30);

const BREAK_PAGE_PATH = "/break";

/** Exactly what the break page needs to render. Everything else is blocked. */
function isBreakPageAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname === "/favicon.ico" ||
    pathname === "/logo.webp" ||
    pathname === "/logo-dark.webp"
  );
}

function isBreakActive(): boolean {
  return Date.now() < BREAK_ENDS_AT;
}

/**
 * Serve the break page in place of the entire app.
 *
 * `/api/*` gets a JSON 503 rather than the page: a tab left open from before
 * the block would otherwise receive HTML where it expects JSON and render a
 * broken spinner instead of the message.
 *
 * Everything else is REWRITTEN, not redirected — the URL survives, so a tab
 * parked on a deep route returns to the real page after the block lifts.
 *
 * `no-store` matters on both: without it Netlify's CDN keeps serving the break
 * page after 10:00, which is the most likely way this outlives its welcome.
 */
function serveBreak(request: NextRequest): NextResponse {
  const secondsLeft = Math.max(
    1,
    Math.ceil((BREAK_ENDS_AT - Date.now()) / 1000),
  );

  if (request.nextUrl.pathname.startsWith("/api")) {
    return new NextResponse(
      JSON.stringify({
        hasError: true,
        statusCode: 503,
        message:
          "μLearn is taking a break for the football. Back Tuesday 10 AM.",
        response: {},
      }),
      {
        status: 503,
        headers: {
          "content-type": "application/json",
          "retry-after": String(secondsLeft),
          "cache-control": "no-store",
        },
      },
    );
  }

  const response = NextResponse.rewrite(new URL(BREAK_PAGE_PATH, request.url));
  response.headers.set("cache-control", "no-store, must-revalidate");
  return response;
}

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
 * Decode a JWT payload without verification.
 * Safe for edge runtime — no crypto needed.
 * Returns the parsed payload object, or null on failure.
 */
function decodeTokenPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Base64url decode the payload (middle part)
    const payload = parts[1];
    const padded = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * True when the access token is unusable: malformed, or its `expiry` claim is
 * in the past. Treated the same as a missing cookie so the recovery flow can
 * mint a fresh token via the refresh route BEFORE the page renders. Without
 * this, a present-but-expired cookie slips past recovery and the client guard
 * gets stuck bouncing /dashboard ⇄ /login (a stuck loading screen).
 */
function isAccessTokenExpired(token: string): boolean {
  const parsed = decodeTokenPayload(token);
  if (!parsed) return true;
  const expiry = parsed.expiry;
  if (typeof expiry === "string" || typeof expiry === "number") {
    const expiryDate = new Date(expiry);
    // Invalid/unparseable date → fail open (treat as not-expired) and let the
    // backend reject it, rather than risk a refresh→render→refresh loop.
    if (!Number.isNaN(expiryDate.getTime())) {
      return expiryDate < new Date();
    }
  }
  // No expiry claim → can't prove it's valid; let the backend be the judge.
  return false;
}

/**
 * Decode JWT payload without verification and return roles.
 * Returns an empty array for malformed or expired tokens.
 */
function extractRolesFromToken(token: string): string[] {
  const parsed = decodeTokenPayload(token);
  if (!parsed) return [];

  // Expired tokens grant no roles.
  const expiry = parsed.expiry;
  if (typeof expiry === "string" || typeof expiry === "number") {
    const expiryDate = new Date(expiry);
    if (!Number.isNaN(expiryDate.getTime()) && expiryDate < new Date()) {
      return [];
    }
  }

  return Array.isArray(parsed.roles) ? (parsed.roles as string[]) : [];
}

// ─── Middleware ─────────────────────────────────────────────

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── FIFA break block (TEMPORARY) ────────────────────────
  // Must stay the first branch: everything below assumes the app is open.
  if (isBreakActive() && !isBreakPageAsset(pathname)) {
    return serveBreak(request);
  }

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
    //
    // Recover when the accessToken cookie is missing OR holds an expired/
    // malformed JWT. The cookie's own lifetime (1 day) outlives the JWT's
    // expiry, so a present-but-expired cookie is the common reload case — it
    // must trigger recovery too, not slip through to a render that loops.
    const accessToken = request.cookies.get("accessToken")?.value;
    if (!accessToken || isAccessTokenExpired(accessToken)) {
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
    /*
     * API routes are excluded above, so the proxy never sees them. The FIFA
     * break gate needs them (to answer 503 instead of HTML), so they are added
     * back explicitly. Outside the break window the early-return for `/api`
     * in `proxy()` keeps behaviour byte-for-byte identical to before.
     * TEMPORARY: drop this entry with the rest of the break block.
     */
    "/api/:path*",
  ],
};
