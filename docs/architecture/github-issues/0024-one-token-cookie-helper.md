# Set every token cookie through one helper

| | |
|---|---|
| ID | 0024 |
| Phase / milestone | Phase 2: Serving and runtime |
| Module | auth-and-access |
| Size | M |
| Labels | arch, phase:2, module:auth-and-access, type:chore, size:M, core-review |
| Depends on | 0001 |
| Backend | none |
| Blocks | none |
| Repos | mulearn-dashboard |

## Why

The same token cookies are set three ways:
- after sign-in, `src/lib/auth/token-store.ts` sets the access token (15 minutes) and the refresh token (7 days) from JavaScript;
- after a server-side refresh, `src/api/server.ts` re-sets the access cookie as `httpOnly` for 24 hours;
- `src/app/api/auth/refresh/route.ts` sets it readable, for 15 minutes.

Which options a user ends up with depends on which path ran last, and a cookie can outlive its token ([ADR-008](../adr/ADR-008-token-storage.md)).

## Before you start

- Issue 0001 must be merged.
- Read [Tokens](../08-auth-and-access.md#tokens) and every place that sets or clears a token cookie: `grep -rn "accessToken\|refreshToken" src --include=*.ts --include=*.tsx | grep -i "set\|delete\|remove"`.

## What to do

1. Create `src/lib/auth/token-cookies.ts` with one options object per cookie (name, lifetime, `httpOnly`, `sameSite: "lax"`, `secure` in production, `path: "/"`), plus helpers for the client (`js-cookie`) and the server (`cookies()`).
2. Choose the options, and state the choice in the pull request:
   - the access cookie stays readable by the page, which needs it for the bearer header, with a 15-minute lifetime everywhere;
   - the refresh cookie keeps today's sign-in behaviour.

   List any path whose behaviour changes.
3. Route every place that sets or clears a token cookie through the helpers, including sign-out.
4. Add tests: each path produces the same options.

## Acceptance criteria

- [ ] Every token cookie is set and cleared through `src/lib/auth/token-cookies.ts`.
- [ ] The access cookie has the same lifetime and flags on every path.
- [ ] Sign-in, refresh (client and server) and sign-out still work.

## How to test

```sh
bun run test src/lib/auth src/api src/app/api
bun run lint
bun run typecheck
```

## Out of scope

- Moving tokens out of reach of page scripts (revisited with the backend's key-separation phase 2, [ADR-008](../adr/ADR-008-token-storage.md)).

## Notes for reviewers

Two reviewers: this is the session path. Check OAuth returns still work (they need `sameSite: "lax"`).
