/**
 * "Sign in with μLearn" callback
 *
 * 📍 src/app/api/auth/oidc/callback/route.ts
 *
 * The identity provider redirects here with an authorization code. This
 * handler exchanges it for tokens — server-side, using the PKCE verifier held
 * in an httpOnly cookie — and stores the result.
 *
 * Why the exchange happens here and not in the browser:
 *   - the verifier must stay out of JavaScript's reach, or an XSS bug could
 *     complete the exchange itself;
 *   - the refresh token is written httpOnly, so a script on the page cannot
 *     read it. Audit finding F12 was that any XSS yielded a 7-day, unrevocable
 *     session. It cannot now.
 *
 * The access token stays JS-readable, matching how the app reads it today.
 * That is a deliberate, smaller exposure: it lives 15 minutes and cannot be
 * used to mint a new one.
 */

import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { statesMatch } from "@/lib/auth/pkce";
import { sanitizeReturnPath } from "@/lib/auth/return-path";
import {
  PKCE_RETURN_COOKIE,
  PKCE_STATE_COOKIE,
  PKCE_VERIFIER_COOKIE,
} from "../start/route";

/**
 * Same-origin redirects use a RELATIVE Location. See ../../refresh/route.ts
 * for the full reasoning: on Netlify, `request.url` inside a route handler is
 * rebuilt from the deploy permalink, so resolving against it moves people off
 * the custom domain and away from their cookies.
 */
function redirectToPath(path: string): NextResponse {
  return new NextResponse(null, { status: 307, headers: { Location: path } });
}

function failed(reason: string): NextResponse {
  // Never echo provider error text into the URL: it is attacker-influenceable
  // and would be reflected onto the page.
  return redirectToPath(`/login?error=${encodeURIComponent(reason)}`);
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const cookieStore = await cookies();

  const verifier = cookieStore.get(PKCE_VERIFIER_COOKIE)?.value;
  const expectedState = cookieStore.get(PKCE_STATE_COOKIE)?.value;
  const returnPath = sanitizeReturnPath(
    cookieStore.get(PKCE_RETURN_COOKIE)?.value ?? "dashboard",
  );

  // Single-use: clear the flow cookies before anything can fail, so a failed
  // or replayed callback cannot be retried against the same verifier.
  const clearFlow = () => {
    cookieStore.delete(PKCE_VERIFIER_COOKIE);
    cookieStore.delete(PKCE_STATE_COOKIE);
    cookieStore.delete(PKCE_RETURN_COOKIE);
  };
  clearFlow();

  if (searchParams.get("error")) {
    return failed("signin_failed");
  }

  const code = searchParams.get("code");
  if (!code || !verifier) {
    // No verifier means this callback did not originate from a flow this
    // browser started — which is precisely the CSRF case.
    return failed("signin_expired");
  }

  // `state` binds the callback to the browser that began the flow. Server-side
  // consumption alone is not enough; this is the half that closes F5.
  if (!statesMatch(searchParams.get("state"), expectedState)) {
    return failed("signin_mismatch");
  }

  const issuer = process.env.NEXT_PUBLIC_OIDC_ISSUER;
  const clientId = process.env.NEXT_PUBLIC_OIDC_CLIENT_ID;
  if (!issuer || !clientId) {
    return failed("signin_unavailable");
  }

  let tokens: {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
  try {
    const response = await fetch(new URL("/oauth/token/", issuer), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${origin}/api/auth/oidc/callback`,
        client_id: clientId,
        code_verifier: verifier,
      }),
      // The provider is a hard dependency of sign-in, but a slow one must not
      // hold a request open indefinitely (audit finding F14).
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return failed("signin_failed");
    tokens = await response.json();
  } catch {
    return failed("signin_unavailable");
  }

  if (!tokens.access_token || !tokens.refresh_token) {
    return failed("signin_failed");
  }

  const isProduction = process.env.NODE_ENV === "production";
  const base = { secure: isProduction, sameSite: "lax" as const, path: "/" };

  // httpOnly: the whole point. JavaScript cannot read this, so an XSS bug
  // cannot walk away with a long-lived session.
  cookieStore.set("refreshToken", tokens.refresh_token, {
    ...base,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60,
  });

  // Readable by the app, matching current behaviour. Short-lived and cannot
  // mint a successor on its own.
  cookieStore.set("accessToken", tokens.access_token, {
    ...base,
    httpOnly: false,
    maxAge: tokens.expires_in ?? 15 * 60,
  });

  cookieStore.set("isAuthenticated", "true", { ...base, maxAge: 86_400 });

  return redirectToPath(`/${returnPath}`);
}
