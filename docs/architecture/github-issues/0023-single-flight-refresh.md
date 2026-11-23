# Make token refresh single-flight across tabs

| | |
|---|---|
| ID | 0023 |
| Phase / milestone | Phase 2: Serving and runtime |
| Module | auth-and-access |
| Size | M |
| Labels | arch, phase:2, module:auth-and-access, type:feature, size:M, core-review |
| Depends on | 0001 |
| Backend | none |
| Blocks | none |
| Repos | mulearn-dashboard |

## Why

Inside one tab, concurrent refreshes already share one promise (`inFlight` in `src/api/refresh.client.ts`). Across tabs, each tab refreshes on its own, so two tabs call the authserver at once. Today that only doubles the calls. Once the backend rotates refresh tokens with reuse detection (its key-separation phase 2), the second refresh looks like a stolen token and ends the session ([ADR-010](../adr/ADR-010-single-flight-refresh.md)).

## Before you start

- Issue 0001 must be merged.
- Read [Refresh](../08-auth-and-access.md#refresh), `src/api/refresh.client.ts` and `src/lib/auth/token-store.ts`.

## What to do

1. Wrap the refresh in `src/api/refresh.client.ts` in a Web Locks lock: `navigator.locks.request("mulearn-token-refresh", ...)`.
2. Inside the lock, read the access token again. If another tab has already replaced the one this tab started with, use it and skip the network call.
3. After a refresh, post `{type: "refreshed"}` on a `BroadcastChannel("mulearn-auth")`. After a refused refresh, post `{type: "signed-out"}`, and have every tab go to sign-in when it receives it.
4. Keep the in-tab `inFlight` promise. Where `navigator.locks` doesn't exist, fall back to today's behaviour.
5. Add tests with small fakes for `navigator.locks` and `BroadcastChannel` (jsdom has neither):
   - two refreshes in two "tabs" make one network call;
   - a refused refresh signs out every tab;
   - without locks, behaviour is as today.

## Acceptance criteria

- [ ] With two tabs open and an expired token, one refresh call is made (check the network panel and paste a screenshot).
- [ ] Signing out, or a refused refresh, signs out every tab.
- [ ] Browsers without Web Locks behave as today.

## How to test

```sh
bun run test src/api
bun run lint
bun run typecheck
```

## Out of scope

- Moving refresh to the server.
- Changing cookie options (issue 0024).
- The server-side refresh in `src/app/api/auth/refresh/route.ts`, which runs when a page loads with an expired token. It runs outside the browser and can't take the lock, so it can still race a tab's refresh. Issue 0042 handles its failures; it is revisited with the backend's key-separation phase 2.

## Notes for reviewers

Two reviewers: this is the session path. Check that a lock never stays held after an exception.
