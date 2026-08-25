/**
 * Refreshing an OIDC session.
 *
 * 📍 src/lib/auth/oidc-refresh.ts
 *
 * Server-side only. The refresh token is held in an httpOnly cookie, so this
 * cannot run in the browser — which is the point (audit finding F12).
 *
 * ROTATION IS NOT OPTIONAL HERE
 * ----------------------------
 * The provider is configured with ROTATE_REFRESH_TOKEN, so presenting a
 * refresh token CONSUMES it and returns a replacement. Two consequences the
 * caller must respect:
 *
 *   1. The new refresh token has to be stored. Keeping the old one means the
 *      next refresh presents a token that has already been spent.
 *   2. Presenting a spent token is treated as theft — the provider revokes the
 *      entire token family and signs the person out everywhere. That is the
 *      desired behaviour for a stolen token and a self-inflicted logout if we
 *      drop the replacement on the floor.
 *
 * So a failed refresh must clear the cookies and send the person to sign in
 * again, never retry with the same token.
 */

export interface RefreshedSession {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class RefreshFailed extends Error {}

/**
 * Exchange a refresh token for a new pair.
 *
 * @throws RefreshFailed when the provider refuses or is unreachable. The caller
 *   must clear the session rather than retry.
 */
export async function refreshOidcSession(
  refreshToken: string,
  { issuer, clientId }: { issuer: string; clientId: string },
): Promise<RefreshedSession> {
  let response: Response;
  try {
    response = await fetch(new URL("/oauth/token/", issuer), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
      }),
      // A hanging provider must not hold a request open. Refresh sits in front
      // of ordinary navigation, so a slow failure here is felt on every page.
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new RefreshFailed("provider unreachable");
  }

  if (!response.ok) {
    // Includes the case where this token was already spent — the provider has
    // now revoked the family. Nothing to retry.
    throw new RefreshFailed(`provider returned ${response.status}`);
  }

  let body: {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
  try {
    body = await response.json();
  } catch {
    throw new RefreshFailed("provider returned a non-JSON response");
  }

  if (!body.access_token || !body.refresh_token) {
    // A response without a replacement refresh token would leave us holding a
    // spent one. Treat it as a failure rather than storing half a session.
    throw new RefreshFailed("provider returned an incomplete token set");
  }

  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token,
    expiresIn: body.expires_in ?? 15 * 60,
  };
}
