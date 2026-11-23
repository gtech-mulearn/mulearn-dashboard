# ADR-014: Browser errors with request ids

Status: Accepted
Date: 2026-11-21
Implementation status at dev 6d6cb30b: not started: no error-reporting service is installed.

## Context

When a page fails, nobody sees it unless a user reports it. The backend is adding Sentry and request ids ([backend ADR-012](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/adr/ADR-012-opentelemetry-sentry-json-logs.md)); every envelope will carry a `requestId` (backend 0019).

## Options considered

- **Sentry in the browser, with the backend's `requestId` attached to each failed call.**
- **No reporting.** Today's state.

## Decision

- Report unhandled errors and failed calls to Sentry, attaching `requestId` and the endpoint, never personal data.
- Sending a `traceparent` header waits for the backend to allow it through CORS ([ADR-011](ADR-011-flags-for-new-sends.md)).
- The project and its key are set up by a maintainer.

## Consequences

- A support request with a request id can be traced to backend logs.

## Revisit when

- Reporting volume or cost needs sampling rules.

## Related ADRs

- [ADR-006: One API client and one error model](ADR-006-one-api-client-and-error-model.md)
- [ADR-011: Per-environment build flags for anything newly sent](ADR-011-flags-for-new-sends.md)
