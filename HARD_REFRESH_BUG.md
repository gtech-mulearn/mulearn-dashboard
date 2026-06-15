# Hard Refresh → Login Redirect: Root Cause & Fix Plan

## The Core Problem

On hard refresh, users get kicked to `/login` even though their cookies are valid. This is caused by **three separate but related issues** that compound each other.

---

## Issue 1: `hasToken` Race in `useUserInfo` (Primary Cause)

**File:** `src/features/auth/hooks/use-session.ts:26-29`

```ts
const hasToken =
  typeof window !== "undefined"
    ? !!(authStore.getAccessToken() || authStore.getRefreshToken())
    : false;
```

`authStore.getAccessToken()` calls `Cookies.get()` from `js-cookie`. This reads `document.cookie`. During React hydration (the first client render after SSR), there is a narrow window where React is reconciling the server HTML with the client — and the component runs synchronously. If `Cookies.get()` returns `undefined` at that moment (which it can, due to hydration timing or `SameSite=strict` restrictions), `hasToken` evaluates to `false`.

**Consequence:** TanStack Query sees `enabled: false`. The `fetchUserInfo` query **never fires**. `isLoading` stays `false`, `isError` stays `false`, `data` stays `undefined`.

---

## Issue 2: Silent "Loader Trap" in `OnboardingGuard` (Amplifier)

**File:** `src/app/(dashboard)/onboarding-guard.tsx:55-68`

```ts
// Line 55-59: shows loader while isLoading
if (isLoading) return <Loader />;

// Line 63-67: also shows loader when no user
if (isError || !user) return <Loader />;
```

When Issue 1 hits:
- `isLoading = false` (query was never started, so TanStack Query marks it as idle)
- `isError = false`
- `user = undefined`

The component hits the `!user` branch at line 63 and renders `<Loader />` — **forever**. No redirect fires. No error is thrown. The user sees a spinner that never resolves.

The `useEffect` at line 31 does fire a `router.replace("/login")` only when `isError === true`. But since the query never ran, `isError` stays `false`, so **the redirect never triggers**. The user is stuck.

---

## Issue 3: Middleware Passes but Client Doesn't Know Refresh Happened (Secondary Cause)

**File:** `src/proxy.ts:166-172`

```ts
// No accessToken but refreshToken present — redirect through the
// server-side refresh endpoint so roles can be verified after refresh.
const refreshUrl = new URL("/api/auth/refresh", request.url);
refreshUrl.searchParams.set("ruri", pathname.slice(1));
return NextResponse.redirect(refreshUrl);
```

**File:** `src/app/api/auth/refresh/route.ts:43-48`

The server-side refresh route correctly sets a new `accessToken` cookie via `cookieStore.set(...)`. However `cookieStore.set` in Next.js App Router route handlers sets the cookie in the **HTTP response** — but `js-cookie` on the client reads from `document.cookie`. There is a timing gap:

1. Middleware redirects to `/api/auth/refresh`
2. Server sets new `accessToken` cookie in response headers
3. Browser follows the redirect back to `/dashboard`
4. Next.js page starts hydrating
5. React runs `useUserInfo` synchronously during hydration
6. `Cookies.get("accessToken")` may read stale state if the browser hasn't fully committed the new cookie yet

This is less common but explains cases where the refresh visibly succeeds (no spinner) but the page still redirects.

---

## Issue 4: Catch-All `catch` Block Clears Tokens Aggressively

**File:** `src/api/client.ts:279-289`

```ts
} catch {
  authStore.clearTokens();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
  throw new ApiError(...);
}
```

The outer `catch` around the token refresh logic catches **any** error — including network errors, JSON parse failures, timeout errors — and responds by clearing tokens and redirecting to login. If `fetchUserInfo` fails due to a transient network error on hard refresh (common while the page is still loading resources), this nukes the session entirely.

---

## The Full Failure Chain on Hard Refresh

```
User hard-refreshes /dashboard/home
        ↓
Middleware (proxy.ts) runs on edge
  → isAuthenticated() = true (cookies exist in request)
  → If accessToken missing but refreshToken exists:
      → redirect to /api/auth/refresh → new accessToken set → redirect back
  → Page allowed through
        ↓
Next.js SSR renders page shell (server-side, no JS)
        ↓
React hydrates on client — runs synchronously
  → useUserInfo() called
  → hasToken = Cookies.get("accessToken") — may be undefined during hydration
  → TanStack Query: enabled = false
  → Query never fires
        ↓
OnboardingGuard renders:
  isLoading = false, isError = false, user = undefined
  → hits `if (isError || !user)` → returns <Loader />
  → useEffect fires but isError = false → no redirect
        ↓
User sees infinite spinner OR...
        ↓
If hasToken WAS true but token was actually expired:
  → fetchUserInfo fires → 401 response
  → client.ts catch block → clearTokens() + window.location.href = "/login"
  → User redirected to login
```

---

## Fix Plan

### Fix 1: Add Loading State for Token Initialization (Critical)

In `use-session.ts`, use `useState` with `useEffect` to defer the `hasToken` check until after mount, so it never evaluates during SSR/hydration.

```ts
// src/features/auth/hooks/use-session.ts

export function useUserInfo() {
  const [hasToken, setHasToken] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);

  useEffect(() => {
    setHasToken(!!(authStore.getAccessToken() || authStore.getRefreshToken()));
    setTokenChecked(true);
  }, []);

  return useQuery({
    queryKey: authKeys.userInfo(),
    queryFn: fetchUserInfo,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: tokenChecked && hasToken,
  });
}
```

The query now waits until after hydration to evaluate the cookie. No more false-negative `hasToken`.

---

### Fix 2: Redirect to Login When Query is Disabled and Not Loading (Critical)

In `OnboardingGuard`, the current code shows `<Loader />` when `!user` — but never redirects if the query is idle/disabled. Add an explicit redirect for this state.

```ts
// src/app/(dashboard)/onboarding-guard.tsx

const { data: user, isLoading, isError, fetchStatus } = useUserInfo();

useEffect(() => {
  if (isPublicProfile) return;
  if (isLoading) return;
  if (isError) {
    router.replace("/login");
    return;
  }
  // Query is not loading and not erroring, but there is no user
  // and no in-flight fetch — means token was absent, redirect to login
  if (!user && fetchStatus === "idle") {
    router.replace("/login");
    return;
  }
  // ... rest of onboarding logic
}, [user, isLoading, isError, fetchStatus, router, isPublicProfile]);
```

`fetchStatus === "idle"` from TanStack Query tells you the query is disabled (not running). This distinguishes "loading" from "will never load".

---

### Fix 3: Scope the Aggressive Catch in `client.ts` (Important)

**File:** `src/api/client.ts:279-289`

The outer `catch` should only clear tokens and redirect if the error is specifically an auth failure, not any error:

```ts
} catch (err) {
  // Only nuke session if it's an auth error, not a network/parse error
  if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
    authStore.clearTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }
  throw err instanceof ApiError
    ? err
    : new ApiError(res.status, "Unauthorized - redirecting to login", rawData);
}
```

This prevents transient network failures from destroying a valid session.

---

### Fix 4: Verify Cookie Availability After Server Refresh (Minor)

**File:** `src/app/api/auth/refresh/route.ts`

The server sets `accessToken` correctly. No change needed here — this is a browser/timing issue resolved by Fix 1 (deferred token check after mount means cookie is always committed by the time `Cookies.get()` runs).

---

## Priority Order

| # | Fix | Impact | Effort |
|---|-----|--------|--------|
| 1 | Defer `hasToken` evaluation to post-mount in `use-session.ts` | Eliminates primary cause | Low |
| 2 | Add `fetchStatus === "idle"` redirect in `OnboardingGuard` | Eliminates infinite spinner | Low |
| 3 | Scope catch block in `client.ts` to auth errors only | Prevents session wipe on network errors | Low |
| 4 | Server refresh cookie timing | Already handled by Fix 1 | N/A |

Fixes 1 and 2 together should eliminate the hard refresh bug in all cases.
