import { env } from "../../config/env";
import { authStore, postAuthMessage } from "../lib/auth";

// One token refresh at a time, inside a tab and across tabs (ADR-010, issue 0023).
// - Inside a tab, concurrent callers share one promise (inFlight).
// - Across tabs, a Web Locks lock lets one tab refresh. A tab that waited for the lock checks
//   again: if another tab signed out, it stops; if another tab replaced the access token this tab
//   started with, it uses that one.
// - After a refresh, the tab posts "refreshed" on the auth channel; after a refused one,
//   "signed-out", and the other tabs go to sign-in (src/lib/auth/auth-channel.ts).
// - Where navigator.locks doesn't exist, the refresh runs as it did before: no lock, no message.

export const REFRESH_LOCK = "mulearn-token-refresh";

/**
 * The longest a tab holds the lock. A refresh that hasn't settled by then keeps running, but
 * releases the lock, so one stuck request can't stop every other tab from refreshing.
 */
export const LOCK_HOLD_LIMIT_MS = 15_000;

let inFlight: Promise<string | null> | null = null;
let inFlightForToken: string | null = null;

export function refreshAccessToken(): Promise<string | null> {
  const refreshToken = authStore.getRefreshToken();
  if (!refreshToken) return Promise.resolve(null);
  if (inFlight && inFlightForToken === refreshToken) return inFlight;

  const accessTokenBefore = authStore.getAccessToken();
  inFlightForToken = refreshToken;
  inFlight = refreshOnce(refreshToken, accessTokenBefore).finally(() => {
    inFlight = null;
    inFlightForToken = null;
  });
  return inFlight;
}

async function refreshOnce(
  refreshToken: string,
  accessTokenBefore: string | undefined,
): Promise<string | null> {
  const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;
  if (!locks) return doRefresh(refreshToken);

  const held = await locks.request(REFRESH_LOCK, async () => {
    // Another tab may have signed out, or refreshed, while this one waited for the lock.
    if (!authStore.getRefreshToken()) {
      return { token: Promise.resolve<string | null>(null) };
    }
    const current = authStore.getAccessToken();
    if (current && current !== accessTokenBefore) {
      return { token: Promise.resolve<string | null>(current) };
    }
    const token = doRefresh(refreshToken).then((newToken) => {
      if (!newToken) {
        // The API client signs this tab out on a null token anyway. Clearing the tokens before the
        // lock passes on means a waiting tab sees the session has ended, instead of trying again.
        authStore.clearTokens();
      }
      postAuthMessage(newToken ? "refreshed" : "signed-out");
      return newToken;
    });
    let timer: ReturnType<typeof setTimeout> | undefined;
    const limit = new Promise<void>((resolve) => {
      timer = setTimeout(resolve, LOCK_HOLD_LIMIT_MS);
    });
    await Promise.race([token, limit]);
    clearTimeout(timer);
    // Wrapped in an object, so returning releases the lock without waiting for the refresh.
    return { token };
  });
  return held.token;
}

async function doRefresh(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${env.NEXT_PUBLIC_DJANGO_API_URL}/api/v1/auth/get-access-token/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      },
    );
    if (!res.ok) return null;

    const data = await res.json().catch(() => null);
    const newAccessToken = data?.response?.accessToken ?? null;
    if (!newAccessToken) return null;
    if (authStore.getRefreshToken() !== refreshToken) return null;
    await authStore.setTokens(newAccessToken, refreshToken);
    return newAccessToken;
  } catch {
    return null;
  }
}
