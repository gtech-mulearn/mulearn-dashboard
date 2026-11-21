# ADR-006: One API client and one error model

Status: Accepted
Date: 2026-11-21
Implementation status at dev 6d6cb30b: partly in place: `src/api/client.ts` is the one client; it doesn't read the backend's planned `code` or `requestId` yet.

## Context

All calls go through `src/api/client.ts` (`publicApiClient`, `apiClient`, `authedFetch`). Token expiry is detected by `isTokenExpired`: a 401, `statusCode 1000`, or a token-expired or token-invalid message. One refresh and one retry follow. The backend will add a stable `code` and a `requestId` to every response envelope (backend 0019), and every 5xx will become a JSON envelope once production runs behind nginx (backend 0047).

## Options considered

- **One client that turns every failure into one `ApiError` shape.**
- **Each feature handles raw responses.** Today's error extraction is already spread; the new fields would multiply it.

## Decision

- `ApiError` carries `status`, `statusCode`, `code` (when present), `requestId` (when present), a user-facing message and field errors.
- Reading the new fields needs no gate: they're optional and ignored when absent ([06-backend-contract.md](../06-backend-contract.md)).
- Token-expiry handling stays exactly as it is.

## Consequences

- Error states can show a request id that support can trace.
- A future change in the error envelope touches one file.

## Revisit when

- The backend's error codes are stable enough to drive specific UI behaviour.

## Related ADRs

- [ADR-005: Parse every response with zod; generated types later](ADR-005-parse-at-the-boundary.md)
- [ADR-010: One token refresh at a time, across tabs](ADR-010-single-flight-refresh.md)
- [ADR-014: Browser errors with request ids](ADR-014-observability.md)
