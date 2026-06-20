import { getBaseUrl } from "./base-url.server";

export async function refreshAccessTokenServer(
  refreshToken: string,
): Promise<string | null> {
  const res = await fetch(`${getBaseUrl()}/api/v1/auth/get-access-token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  return data?.response?.accessToken ?? null;
}
