# ADR-009: Page access: token roles now, the backend's grants later

Status: Accepted
Date: 2026-11-21
Implementation status at dev 6d6cb30b: in place, in layers: `src/proxy.ts` decodes the token's roles and checks `src/lib/auth/route-access.ts`; 43 server pages call `requireRole` (`src/lib/auth/server.ts`); components use `RoleGate` and the `PERMISSIONS` map; navigation uses `src/hooks/use-filtered-nav.ts`.

## Context

Page access in the dashboard decides which pages render; it doesn't protect data, which the backend checks on every call. Users hold several roles at once (a student who is also a mentor and a campus lead), so every check has to consider all of them.

The backend is moving authorization to scoped grants and policies ([backend ADR-007](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/adr/ADR-007-scoped-grants-and-policies.md)) and treats role names in tokens as a display hint for clients. No backend issue yet lets the dashboard ask for the signed-in user's grants (a need raised with the maintainers).

## Options considered

- **Keep today's layers until the backend exposes grants, then decide page access from grants.**
- **Decide from grants now.** There is no endpoint to read them.

## Decision

- Keep today's layers (the route map, `requireRole`, `RoleGate`). Each takes its roles from a named group in `src/lib/auth/roles.ts` or a `PERMISSIONS` entry, never from role names written inline.
- Decide access from the union of every role the user holds, and test that rule in every layer.
- Move to grants in the Phase 5 epic, once a backend endpoint returns them.

## Consequences

- Page gating stays a convenience, never a security boundary; the docs say so wherever it appears.

## Revisit when

- The backend publishes an endpoint for the caller's grants.

## Related ADRs

- [ADR-008: Token storage](ADR-008-token-storage.md)
