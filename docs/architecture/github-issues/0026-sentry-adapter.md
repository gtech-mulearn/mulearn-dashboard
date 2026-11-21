# Add a Sentry adapter to the error-logging service

| | |
|---|---|
| ID | 0026 |
| Phase / milestone | Phase 2: Serving and runtime |
| Module | shared-lib |
| Size | M |
| Labels | arch, phase:2, module:shared-lib, type:feature, size:M |
| Depends on | 0001 |
| Backend | none |
| Blocks | 0027, 0028 |
| Repos | mulearn-dashboard |

## Why

Nobody sees a failure unless a user reports it. The error-logging service (`src/lib/error-handling/error-logging.service.ts`) already strips personal fields and takes pluggable adapters, so a reporting adapter fits without new scrubbing logic ([ADR-014](../adr/ADR-014-observability.md)).

## Before you start

- Issue 0001 must be merged.
- Read `src/lib/error-handling/error-logging.service.ts` (`LoggerAdapter`, the personal-field list), `src/lib/error-handling/AppErrorBoundary.tsx` and `config/env.ts`.

## What to do

1. Add `@sentry/nextjs` (pinned), initialised in the browser only when the new optional variable `NEXT_PUBLIC_SENTRY_DSN` is set. Add it to `config/env.ts` as optional, and to `.env.example`, empty.
2. Forward it in `.github/workflows/staging-deploy.yml`. The build step's `env:` block passes only the two `NEXT_PUBLIC_*` variables today; add `NEXT_PUBLIC_SENTRY_DSN: ${{ vars.NEXT_PUBLIC_SENTRY_DSN }}`.
3. Add a Sentry `LoggerAdapter`, and register it in the error-logging service.
4. Scrub before anything leaves the browser:
   - in `beforeSend`, run the existing personal-field scrubbing, and drop request bodies, cookies and headers;
   - in `beforeBreadcrumb`, drop console breadcrumbs, and strip query strings from fetch and navigation breadcrumbs.
5. Report errors only: no tracing, no session replay. Set `tracePropagationTargets: []`, so no `sentry-trace` or `baggage` header is added to backend calls (the backend's CORS doesn't allow them today).
6. `logSchemaMismatch` in `src/api/errors.ts` logs only in development today. Also send each mismatch to `errorLogger.logError`, sampled at 10%, with the endpoint and the failing field paths, never the values.
7. Add tests with Sentry mocked:
   - nothing is sent when the variable is unset;
   - personal fields and query strings never reach an event or a breadcrumb;
   - a backend call carries no trace header;
   - a schema mismatch is reported without values.

## Acceptance criteria

- [ ] With `NEXT_PUBLIC_SENTRY_DSN` unset, no reporting code runs and no request leaves the browser.
- [ ] With it set, a thrown error is reported, without personal fields.
- [ ] Backend calls carry no `sentry-trace` or `baggage` header.
- [ ] The staging workflow forwards the variable.
- [ ] The build passes, and the bundle grows only by the SDK.

## How to test

```sh
bun run test src/lib/error-handling
bun run lint
bun run typecheck
bun run build
```

## Out of scope

- Creating the Sentry project and setting the key (issue 0027).
- Attaching request ids (issue 0028).

## Notes for reviewers

Check nothing in `beforeSend` can include a token, a cookie or a request body.
