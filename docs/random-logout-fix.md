# Random Logout Fix — Access Token 15min TTL

**Verified 2026-07-21**: re-checked against current code on `dev` and against backend's official Auth API doc (Google Auth & JWT Token API Documentation). No fix applied yet — this doc is a proposal.

**Update**: backend API doc confirms `/get-access-token/` does **NOT** rotate the refreshToken — "The Refresh Token itself is returned unchanged in the response (sliding window not used)." This kills the original single-use-rotation race theory: with no rotation, N concurrent refresh calls using the same refreshToken all succeed independently (backend doesn't invalidate it after first use). So the dedup fix below is now **hardening/efficiency only**, not a confirmed root cause fix on its own. See new suspect below.

## Root cause — original theory (partially ruled out)

Backend cut accessToken TTL to 15min. Frontend refresh logic works but has **no dedup/mutex** — every parallel authenticated request that hits a 401 independently calls `refreshAccessToken()` with the same refreshToken.

Dashboard pages fire multiple react-query calls in parallel. When accessToken expires, they all 401 near-simultaneously → each fires its own refresh call. Original theory: if backend rotates/invalidates refreshToken on use, only first refresh wins, rest fail → false logout. **Backend doc confirms no rotation — this specific failure mode does not happen.** No functional harm from the race besides redundant network calls (N refresh requests instead of 1).

Still worth fixing (see Fix 1) because it's wasteful and is correct behavior regardless, but it does not by itself explain "random logout."

## Root cause — new leading suspect: 401 over-matched to "token expired"

`src/api/client.ts:29` — `isTokenExpired()`:

```ts
function isTokenExpired(status: number, data: unknown): boolean {
  if (status === 401) return true;
  ...
}
```

Any `401` response — regardless of actual reason — is treated as an expired access token, triggering refresh + one retry. If the retry also comes back non-ok, the client force-clears tokens and redirects to `/login`, indistinguishable from a real logout to the user (`src/api/client.ts:185-189`, `163-167`, `111-114`).

Backend doc's endpoint list only documents `401`/`statusCode: 1000`/text-matched messages as *token-expiry* signals for protected endpoints generically, and separately documents these **refresh-endpoint-specific** failures (`/get-access-token/`) that are unrelated to concurrency:

- Refresh token expired (>7 days) — real logout, correct to redirect.
- **`Token has been invalidated. Please log in again.`** — triggered by **global logout**: `POST /logout/` writes `global_logout:<user_id>` to Redis with current timestamp; any **refresh** token with `iat <= logout_timestamp` is permanently rejected, for the token's full remaining 7-day life. Doc: "Any refresh token issued on or before the logout timestamp will be permanently rejected."
- Wrong token type / malformed / user no longer exists — real error states.

**Suspect mechanism**: if `/logout/` is ever called unintentionally in one tab/device/flow (e.g. accidental multi-tab logout, cleanup-on-unmount bug, stale/duplicate logout request), it globally invalidates **every** refresh token for that user with `iat` at or before that moment — including tokens actively in use in other still-open sessions/tabs. Those sessions then hit `Token has been invalidated` on their next refresh and get logged out with no local trigger — this would read exactly as "random" logout to the user, and is unrelated to the 15min TTL change (TTL change just makes refresh — and thus this failure path — trigger far more often, matching the timing correlation).

**Needs verification, not yet confirmed**:
1. Search frontend for all call sites of `/logout/` — confirm none fire unexpectedly (e.g. on token-refresh failure, on unmount, on multiple tabs each running independent "session cleanup" logic).
2. Check whether any protected (non-refresh) endpoint ever returns bare `401` for a *non*-token reason (e.g. permission/role check that should be `403`) — `isTokenExpired()`'s unconditional `status === 401` branch would misfire on that too, causing a false refresh+retry+logout cycle.

## Files involved

- `src/api/refresh.client.ts` — `refreshAccessToken()`, no guard against concurrent calls (Fix 1, hardening).
- `src/api/client.ts` — 3 call sites that each independently call `refreshAccessToken()` on 401:
  - `authedFetch` line 107
  - blob branch line 157
  - JSON branch line 180
  - `isTokenExpired()` line 28-51 — unconditional `status === 401` branch, primary new suspect.
- `src/api/refresh.server.ts` — server-side equivalent, same dedup gap (lower risk, SSR requests less likely to race per-request).
- `src/lib/auth/token-store.ts` — `setTokens` (15-23), cookie expiry hardcoded to 1 day / 7 days, doesn't reflect real JWT lifetime (secondary issue, not a logout cause).
- Any frontend call site of `POST /logout/` — needs audit, not yet located in this doc. Grep `logout` across `src/` to enumerate.

## Fix 1 (hardening, not primary): single-flight dedup for refresh

**Current code** (`src/api/refresh.client.ts`, whole file, confirmed as-is):

```ts
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

    await authStore.setTokens(newAccessToken, refreshToken);
    return newAccessToken;
  } catch {
    return null;
  }
}
```

Each call runs its own full `fetch`. Three call sites in `src/api/client.ts` (107, 157, 180) each `await refreshAccessToken()` independently on 401 — no shared state between them, so N parallel 401s → N parallel refresh calls. Since backend doesn't rotate/invalidate on use, all N currently succeed — this is redundant load, not a correctness bug. Still worth fixing.

**Replace with** — wrap so concurrent callers share one in-flight promise instead of firing separate refresh requests:

```ts
import { env } from "../../config/env";
import { authStore } from "../lib/auth";

let inFlight: Promise<string | null> | null = null;

export function refreshAccessToken(): Promise<string | null> {
  if (inFlight) return inFlight;

  inFlight = doRefresh().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function doRefresh(): Promise<string | null> {
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

    await authStore.setTokens(newAccessToken, refreshToken);
    return newAccessToken;
  } catch {
    return null;
  }
}
```

No changes needed in `client.ts` — its three call sites already just `await refreshAccessToken()`, so they'll now await the same shared promise instead of racing.

## Fix 2 (retired): refreshToken rotation handling

Not needed. Backend API doc confirms `/get-access-token/` returns the refreshToken unchanged — no rotation, no single-use invalidation on this endpoint. `RefreshTokenResponseDataSchema` does not need a `refreshToken` field.

## Fix 3 (new, primary candidate): stop treating every 401 as token expiry

In `src/api/client.ts:28-51`, `isTokenExpired()` should not blindly return `true` for `status === 401`. Distinguish:

- Refresh-endpoint failures the backend documents with specific messages (`Refresh token has expired`, `Token has been invalidated. Please log in again.`, `Invalid refresh token`, `User invalid`, `Signature verification failed`) — these are genuine "must log out" states.
- A bare `401` from an unrelated protected endpoint that isn't actually about token expiry (if any such case exists on the backend — needs backend confirmation) should not silently force logout without at least surfacing the real error.

Needs backend confirmation on whether any endpoint returns `401` for reasons other than access-token expiry before finalizing this fix's exact matching logic.

## Fix 4 (optional, low priority): cookie TTL alignment

`token-store.ts:15-23` sets accessToken cookie `expires: 1` (1 day) regardless of actual 15min JWT lifetime. Not a logout cause (client always re-validates via 401), but stale cookie can outlive the JWT it holds. Low priority cosmetic fix — align to something ≥ expected session length, doesn't need to match JWT exactly since refresh flow covers expiry.

## Priority

1. Grep frontend for all `/logout/` call sites — rule in/out accidental/duplicate global-logout triggers as the actual cause.
2. Ask backend: does any protected endpoint return bare `401` for a non-expiry reason? Governs Fix 3's exact scope.
3. Apply Fix 3 once above is confirmed — this is now the leading candidate for the actual "random logout" symptom.
4. Apply Fix 1 (dedup) regardless — correct behavior, cheap, reduces redundant refresh calls even though not the root cause.
5. Fix 2 dropped — no rotation in play.
6. Fix 4 optional cleanup.
