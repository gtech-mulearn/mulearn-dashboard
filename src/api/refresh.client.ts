import { env } from "../../config/env";
import { authStore } from "../lib/auth";

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = authStore.getRefreshToken();
  if (!refreshToken) return null;

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

    // Re-store: refreshes the accessToken (and slides isAuthenticated/refresh).
    await authStore.setTokens(newAccessToken, refreshToken);
    return newAccessToken;
  } catch {
    return null;
  }
}
