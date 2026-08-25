import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { endpoints } from "@/api/endpoints";
import { publicServerClient } from "@/api/server";
import { clearWhatsNewCookie } from "@/app/(dashboard)/whats-new-actions";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  const issuer = process.env.NEXT_PUBLIC_OIDC_ISSUER;
  const clientId = process.env.NEXT_PUBLIC_OIDC_CLIENT_ID;
  const useOidc = process.env.OIDC_ENABLED === "true" && issuer && clientId;

  if (refreshToken && useOidc) {
    // Revoke at the provider, not just locally.
    //
    // Dropping our own cookies ends the session in THIS app only. The refresh
    // token would still be valid, and — more visibly — the provider session
    // would still be live, so "sign out" followed by "sign in" would walk
    // straight back in without asking for a password. That is not a logout.
    try {
      await fetch(new URL("/oauth/revoke_token/", issuer), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          token: refreshToken,
          token_type_hint: "refresh_token",
          client_id: clientId,
        }),
        signal: AbortSignal.timeout(5_000),
      });
    } catch (error) {
      // Never block a logout on the network. Clearing the cookies below still
      // signs them out here, and the token expires on its own. Failing to log
      // out because a request timed out would be worse than a delayed
      // revocation.
      console.error("Token revocation failed:", error);
    }
  } else if (refreshToken) {
    try {
      await publicServerClient.post(
        endpoints.auth.logout,
        { refreshToken },
        z.unknown(),
      );
    } catch (error) {
      console.error("Backend logout request failed:", error);
    }
  }

  // Must mirror the attributes used when setting these cookies
  // (lib/auth/token-store.ts) so the deletions actually match.
  const cookieOptions = {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
  };
  cookieStore.delete({ name: "accessToken", ...cookieOptions });
  cookieStore.delete({ name: "refreshToken", ...cookieOptions });
  cookieStore.delete({ name: "isAuthenticated", ...cookieOptions });
  cookieStore.delete({ name: "tempToken", ...cookieOptions });

  await clearWhatsNewCookie();

  return NextResponse.json({ success: true });
}
