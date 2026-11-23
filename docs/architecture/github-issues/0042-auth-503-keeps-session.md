# Keep the session through temporary 503s from the auth routes

| | |
|---|---|
| ID | 0042 |
| Phase / milestone | Phase 2: Serving and runtime |
| Module | auth-and-access |
| Size | M |
| Labels | arch, phase:2, module:auth-and-access, type:feature, size:M, core-review |
| Depends on | 0018 |
| Backend | none |
| Blocks | 0044 |
| Repos | mulearn-dashboard |

## Why

The backend's load tests expect its auth routes to answer 503 within 2.5 s when the authserver is slow, instead of hanging; the change that makes that true has no owner yet ([06-backend-contract.md](../06-backend-contract.md#what-the-dashboard-needs-from-the-backend)). Behind nginx ([backend 0045](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/0045-rollout-digest-deploys.md)), a 502 or 504 can also come from the gateway. Today the dashboard treats any failed refresh as signed out, on three paths:
- in the browser, `doRefresh` in `src/api/refresh.client.ts` returns `null` for any failure, and `request()` in `src/api/client.ts` then clears the tokens and sends the user to sign-in;
- the refresh route, `src/app/api/auth/refresh/route.ts`, clears every auth cookie when the refresh fails for any reason;
- `getServerUser` in `src/lib/auth/server.ts` returns `null` on any error, so `requireAuth` and `requireRole` send the user to sign-in.

A short authserver outage would sign everyone out ([08-auth-and-access.md](../08-auth-and-access.md#refresh)).

## Before you start

- Issue 0018 must be merged.
- Read [Refresh](../08-auth-and-access.md#refresh) and [When the backend is slow or failing](../11-reliability-and-observability.md#when-the-backend-is-slow-or-failing).
- Read the three files above, and `src/api/refresh.server.ts`.

## What to do

1. **Tell refused from unavailable.** Make `refreshAccessTokenServer` (`src/api/refresh.server.ts`) and `doRefresh` return a result: `{ status: "ok", token }`, `{ status: "refused" }` (a 401 or 403, or a success without a token), or `{ status: "unavailable" }` (a 502, 503 or 504, a network error, or a timeout). Keep the callers of `refreshAccessToken()` working.
2. **In the browser.** When refresh is unavailable, keep the tokens, wait about 2 s, and try once more. If it is still unavailable, throw an `ApiError` with `kind: "unavailable"`, and don't sign out. Only a refused refresh signs out, as today.
3. **The refresh route.** When refresh is unavailable, leave the cookies alone, and answer with a short "can't reach sign-in, retrying" page: status 503, a `Retry-After` header, and a retry link back to the same route. Don't redirect to the return path: the expired token would send the user straight back here.
4. **`getServerUser`.** Return `null` only when the backend says the session is invalid (a 401). For a 502, 503 or 504, or a network error, throw an `ApiError` with `kind: "unavailable"`, so the route group's `error.tsx` shows a retry instead of the sign-in page. List every caller of `getServerUser` in the pull request, with what it now does.
5. If `ApiError` has no `kind` field yet, add it as an optional `"timeout" | "unavailable" | "upload_too_large" | "rate_limited"`. Issues 0022, 0042 and 0043 share it; whichever lands first adds it.
6. **Tests** for each path, with a fake `fetch`:
   - a 503 keeps the session, and shows the retry state;
   - a 401 still signs out;
   - the browser retries an unavailable refresh once, not in a loop.

## Acceptance criteria

- [ ] With the refresh endpoint answering 503, the user stays signed in on all three paths, and sees a retry.
- [ ] A refused refresh still signs the user out, as today.
- [ ] No path retries in a loop.

## How to test

```sh
bun run test src/api src/lib/auth src/app/api
bun run lint
bun run typecheck
```

## Out of scope

- Cross-tab refresh (issue 0023).
- Cookie options (issue 0024).

## Notes for reviewers

Two reviewers: this is the session path. Check that "unavailable" never stands in for signed in: once the access token has expired, pages still need a successful refresh before they load data.
