# ADR-008: Token storage

Status: Accepted
Date: 2026-11-21
Implementation status at dev 6d6cb30b: in place: after sign-in, `src/lib/auth/token-store.ts` sets the access token (15 minutes) and the refresh token (7 days) as cookies from JavaScript (`sameSite: lax`, `secure` in production); `src/api/server.ts` re-sets the access cookie as `httpOnly` after a server-side refresh, and `src/app/api/auth/refresh/route.ts` sets it without.

## Context

Because the browser calls the backend directly ([ADR-007](ADR-007-browser-calls-backend-directly.md)), the tokens live in the browser. Cookies set from JavaScript can be read by any script running on the page, so the defence is keeping untrusted script off the page: rendered markdown is sanitised (`rehype-sanitize`), and content is never inserted as raw HTML.

The backend's later key-separation work ([backend ADR-046](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/adr/ADR-046-tokens-keys-service-clients.md), phase 2) brings rotating refresh tokens with reuse detection, revocation such as logout-everywhere, and tokens other services can verify with public keys. It is deferred, with no date.

## Options considered

- **Keep the cookies as they are, harden the page against injected script, and revisit with the backend's phase 2.**
- **Move both tokens to cookies scripts can't read now.** Needs the server-side proxy back ([ADR-001](ADR-001-one-app-strict-feature-modules.md), option 2).
- **Keep tokens only in memory.** Every reload signs the user out unless refresh moves server-side.

## Decision

- Keep today's storage.
- Make the cookie options consistent: one helper sets every token cookie, with the same lifetime and flags on every path.
- Treat any way of getting script onto the page as a release blocker: no raw HTML insertion, sanitised markdown, a Content-Security-Policy as a later hardening step.
- Revisit when the backend starts backend ADR-046 phase 2.

## Consequences

- The refresh flow must be safe with several tabs before rotation arrives ([ADR-010](ADR-010-single-flight-refresh.md)).

## Revisit when

- The backend starts backend ADR-046 phase 2.
- A review finds a path for untrusted script onto the page.

## Related ADRs

- [ADR-007: The browser calls the backend directly](ADR-007-browser-calls-backend-directly.md)
- [ADR-009: Page access: token roles now, the backend's grants later](ADR-009-page-access.md)
- [ADR-010: One token refresh at a time, across tabs](ADR-010-single-flight-refresh.md)
