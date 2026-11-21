# Reliability and observability

What the dashboard does when the backend is slow or failing, and how failures become visible. Facts describe `dev` at 6d6cb30b. The decisions are [ADR-006](adr/ADR-006-one-api-client-and-error-model.md) and [ADR-014](adr/ADR-014-observability.md).

## Today

- **Error boundaries.** `src/app/error.tsx` and `src/app/global-error.tsx` handle crashes at the top. Each route group has an `error.tsx` (`(auth)`, `(onboarding)`, `(dashboard)`), and so do four sections (company, learning circles, event management, management). `src/lib/error-handling/AppErrorBoundary.tsx` is available inside pages. The logger in `src/lib/error-handling/error-logging.service.ts` strips personal keys (email, phone, tokens, cookies) from context, and takes pluggable adapters.
- **Query retries.** Failed queries retry up to 3 times, except on a 4xx (`src/app/providers.tsx`).
- **No error reporting service** is installed, so failures are seen only when users report them.

## When the backend is slow or failing

| Situation | What the user sees | What the client does |
|---|---|---|
| A request is cut off at the backend's time limit (10 s, 30 s on admin paths) | "This is taking too long", with a retry button | A query retries once; a mutation never retries on its own; known long calls get a longer limit (issue 0022) |
| 5xx | The error state with the message and request id | A query retries as today; a mutation never retries on its own |
| 503 from sign-in or refresh | "Couldn't reach sign-in, retrying…" | Retry once after about 2 s; never sign the user out for it, in the browser or on the server (issue 0042) |
| 429 with `Retry-After` | "Too many attempts, try again in N seconds", or the backend's own message when it sends one | Show the wait (30 s when the header can't be read); no automatic retry (issue 0043) |
| A response that fails its schema | The section's error state; the page stays usable | Log the mismatch with the endpoint (today only in development; issue 0026 reports it, sampled) |
| An upload over 10 MB in total | "This upload is too large (10 MB maximum)" before upload | Refuse before sending (issue 0043) |
| Offline | A banner while offline | Pause queries; resume on reconnect |

The backend limits behind these arrive with backend issue 0033: on dev-server and staging with 0045 (week 7), on production with 0047. The dashboard's handling must be released to each environment before then, not just merged (issue 0044, [06-backend-contract.md](06-backend-contract.md)).

## Error boundaries

- **Every route group** keeps its error boundary, which keeps the shell so navigation still works.
- **Sections that load separately** (dashboard widgets, side panels) each have their own boundary, so one failing section doesn't blank the page.
- **A boundary shows `SectionErrorFallback`** (`src/components/ui/errors/`) with a retry, and reports the error.

## Error reporting

**Target** ([ADR-014](adr/ADR-014-observability.md)):
- **Sentry in the browser,** plugged in as an adapter of the existing error-logging service. That way the personal-data scrubbing stays in one place.
- **Every failed call reports** its endpoint, status, `code` and `requestId` (once the backend sends them), so a report can be matched to backend logs.
- **Never report** tokens, cookies, request bodies or personal fields.
- **Breadcrumbs** drop console output and query strings, and **no trace header** is added to backend calls (`tracePropagationTargets: []`).
- **Schema mismatches are reported too,** sampled, with the endpoint and field paths but never values. Today `logSchemaMismatch` logs them only in development.
- **A maintainer creates the Sentry project and sets its key** as a build-time variable, per environment. Staging's workflow must forward it ([Configuration](10-build-and-deployment.md#configuration)).
- **Sending a `traceparent` header** waits for the backend's CORS to allow it.

## Release health

- After each staging deploy, the staging smoke suite checks sign-in and the core pages ([12-testing-and-quality-gates.md](12-testing-and-quality-gates.md)).
- After each production release, a maintainer checks the error reports for new error types for 24 hours.
