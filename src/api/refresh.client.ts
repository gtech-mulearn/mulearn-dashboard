import { env } from "../../config/env";
import { authStore } from "../lib/auth";

let inFlight: Promise<string | null> | null = null;
let inFlightForToken: string | null = null;

export function refreshAccessToken(): Promise<string | null> {
  const refreshToken = authStore.getRefreshToken();
  if (!refreshToken) return Promise.resolve(null);
  if (inFlight && inFlightForToken === refreshToken) return inFlight;

  inFlightForToken = refreshToken;
  inFlight = doRefresh(refreshToken).finally(() => {
    inFlight = null;
    inFlightForToken = null;
  });
  return inFlight;
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
