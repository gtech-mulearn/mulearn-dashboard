# ADR-010: One token refresh at a time, across tabs

Status: Accepted
Date: 2026-11-21
Implementation status at dev 6d6cb30b: partly in place: inside one tab, concurrent refreshes already share one promise (`inFlight` in `src/api/refresh.client.ts`); across tabs, each tab refreshes on its own.

## Context

When an access token expires, the client refreshes it once and retries the call. Two tabs can do this at the same moment and both call the authserver. Today that only doubles the calls. Once refresh tokens rotate with reuse detection ([backend ADR-046](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/adr/ADR-046-tokens-keys-service-clients.md), phase 2), the second refresh would look like a stolen token and end the session.

## Options considered

- **A single refresh shared across tabs** (a Web Locks API lock, with a `BroadcastChannel` to share the result).
- **Wait for the backend.** The fix would then land under time pressure.

## Decision

Keep the in-tab single flight, and make refresh single-flight across tabs now; it reduces duplicate calls today and removes a blocker for rotation later.

## Consequences

- The refresh code in `src/api/refresh.client.ts` gains a cross-tab lock and tests.
- The server-side refresh (the refresh route, used when a page loads with an expired token) stays a second path outside the lock. Issue 0042 keeps it from signing users out on a 503; it is revisited with key-separation phase 2.

## Revisit when

- Refresh moves server-side.

## Related ADRs

- [ADR-008: Token storage](ADR-008-token-storage.md)
- [ADR-006: One API client and one error model](ADR-006-one-api-client-and-error-model.md)
