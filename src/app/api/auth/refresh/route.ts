/**
 * Token Refresh Route Handler
 *
 * 📍 src/app/api/auth/refresh/route.ts
 *
 * Called by middleware when a role-protected route is accessed but the
 * accessToken cookie is absent (expired) while a refreshToken is still present.
 *
 * Flow:
 *   1. Read refreshToken from cookies.
 *   2. Exchange it for a new accessToken via the backend.
 *   3. Set the new accessToken as a server-side cookie.
 *   4. Redirect the user back to the originally requested route (ruri param).
 *
 * If refresh fails, redirect to /login.
 *
 * The `ruri` round trip preserves the original query string (see
 * lib/auth/return-path.ts). An OAuth callback like
 * /dashboard/connect-discord?code=… is worthless once `code` is dropped.
 */

import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { refreshAccessTokenServer } from "@/api/refresh.server";
import { sanitizeReturnPath } from "@/lib/auth/return-path";

/**
 * Redirect to a path on whatever origin the browser is already on.
 *
 * Deliberately NOT `NextResponse.redirect(new URL(path, request.url))`. On
 * Netlify's Next runtime `request.url` inside a route handler is rebuilt from
 * the deploy's own URL — the immutable `<deploy-id>--<site>.netlify.app`
 * permalink — not the custom domain that was requested. Resolving against it
 * emitted an absolute, cross-origin Location that moved users off
 * app.mulearn.org mid-session: their auth cookies stayed on the original
 * origin, the Discord callback (whose redirect_uri is fixed to app.mulearn.org)
 * came back to a different origin than the one holding them, and every
 * subsequent history entry — so every Back press — was stuck on a frozen build.
 *
 * A relative Location is valid per RFC 7231 §7.1.2 and the browser resolves it
 * against the current origin, which sidesteps having to trust a forwarded-host
 * header to reconstruct the public URL.
 *
 * `path` must be same-origin: a leading "/" and never "//" (protocol-relative).
 * Every caller below builds it from sanitizeReturnPath, which guarantees an
 * allowlisted, slash-stripped path.
 */
function redirectToPath(path: string): NextResponse {
  return new NextResponse(null, {
    status: 307,
    headers: { Location: path },
  });
}

/** `/login?ruri=…`, with the return path encoded as a single query value. */
function loginPathWithReturn(returnPath: string): string {
  return `/login?${new URLSearchParams({ ruri: returnPath })}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawPath = searchParams.get("ruri") ?? "dashboard";
  const returnPath = sanitizeReturnPath(rawPath);

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  // Clear every auth cookie before redirecting to /login. The proxy treats a
  // lingering (even expired) accessToken as "logged in" and bounces /login back
  // to /dashboard, so leaving it behind would create a redirect loop.
  const clearAuthCookies = () => {
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    cookieStore.delete("isAuthenticated");
  };

  if (!refreshToken) {
    clearAuthCookies();
    return redirectToPath(loginPathWithReturn(returnPath));
  }

  try {
    const newAccessToken = await refreshAccessTokenServer(refreshToken);

    if (!newAccessToken) {
      throw new Error("No access token in refresh response");
    }

    const isProduction = process.env.NODE_ENV === "production";

    cookieStore.set("accessToken", newAccessToken, {
      httpOnly: false,
      // Must match authStore.setTokens' 15-minute accessToken lifetime —
      // otherwise the cookie outlives the JWT it holds and browsers keep
      // presenting an already-expired token until this cookie itself expires.
      expires: new Date(Date.now() + 15 * 60 * 1000),
      secure: isProduction,
      sameSite: "lax",
      path: "/",
    });

    cookieStore.set("isAuthenticated", "true", {
      expires: new Date(Date.now() + 86_400_000),
      secure: isProduction,
      sameSite: "lax",
      path: "/",
    });

    return redirectToPath(`/${returnPath}`);
  } catch {
    clearAuthCookies();
    return redirectToPath(loginPathWithReturn(returnPath));
  }
}
