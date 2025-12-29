/**
 * Next.js Middleware
 *
 * 📍 src/middleware.ts
 *
 * Route protection and authentication middleware.
 * Uses HTTP-only cookies for session validation.
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ============================================
// Route Configuration
// ============================================

/**
 * Public routes - accessible without authentication
 */
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

/**
 * Auth routes - redirect to dashboard if already logged in
 */
const authRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

/**
 * Onboarding routes - require auth but not complete profile
 */
const onboardingRoutes = ["/onboarding/organization", "/onboarding/interests"];

/**
 * Protected routes - require authentication
 * Note: All routes not in publicRoutes are considered protected
 */
const protectedRoutePatterns = [
  "/dashboard",
  "/profile",
  "/settings",
  "/admin",
];

// ============================================
// Helper Functions
// ============================================

function _isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isAuthRoute(pathname: string): boolean {
  return authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isOnboardingRoute(pathname: string): boolean {
  return onboardingRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutePatterns.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

/**
 * Check if user is authenticated by looking for session cookie
 * In production, this would validate the cookie with the backend
 */
function isAuthenticated(request: NextRequest): boolean {
  // Check for access token cookie
  const accessToken = request.cookies.get("accessToken");
  const refreshToken = request.cookies.get("refreshToken");

  // User is authenticated if either token exists
  // The actual token validation happens on API calls
  return !!(accessToken?.value || refreshToken?.value);
}

// ============================================
// Middleware
// ============================================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = isAuthenticated(request);

  // Skip middleware for static assets and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // If user is logged in and tries to access auth routes, redirect to dashboard
  if (isLoggedIn && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is not logged in and tries to access protected routes
  if (!isLoggedIn && isProtectedRoute(pathname)) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the original destination for redirect after login
    loginUrl.searchParams.set("ruri", pathname.replace("/", ""));
    return NextResponse.redirect(loginUrl);
  }

  // Allow onboarding routes for authenticated users who haven't completed onboarding
  if (isOnboardingRoute(pathname)) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Allow access to onboarding
    return NextResponse.next();
  }

  return NextResponse.next();
}

// ============================================
// Matcher Configuration
// ============================================

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
