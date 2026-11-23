# ADR-007: The browser calls the backend directly

Status: Accepted
Date: 2026-11-21
Implementation status at dev 6d6cb30b: in place: the server-side proxy was removed earlier in 2026 (see the header of `src/api/client.ts`).

## Context

The dashboard once routed calls through Next.js route handlers. The team removed that proxy: the browser now calls `NEXT_PUBLIC_DJANGO_API_URL` directly with a bearer token. A few server-rendered pages still call the backend from the server through `requireAuth` and `requireRole` (`src/lib/auth/server.ts`; 9 and 43 pages). Token routes (`/api/v1/auth/...`) are served by the authserver behind the same API host.

## Options considered

- **Direct browser calls** (today).
- **A server-side proxy** (the earlier design): server-side token handling, at the cost of a hop and function cost on every call.

## Decision

Keep direct browser calls. Server-side calls stay limited to pages that need them for rendering.

## Consequences

- New request headers need the backend's CORS configuration to allow them (a need raised with the maintainers; see [06-backend-contract.md](../06-backend-contract.md)).
- Token storage is a browser concern ([ADR-008](ADR-008-token-storage.md)).

## Revisit when

- The trigger in [ADR-008](ADR-008-token-storage.md) fires, or a regulatory need requires keeping tokens out of the browser.

## Related ADRs

- [ADR-001: One app with strict feature modules](ADR-001-one-app-strict-feature-modules.md)
- [ADR-008: Token storage](ADR-008-token-storage.md)
