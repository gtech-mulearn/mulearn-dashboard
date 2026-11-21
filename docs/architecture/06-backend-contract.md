# The backend contract

How the dashboard talks to the backend today, what the backend is changing, and what each change means for the dashboard. Facts about the dashboard describe `dev` at 6d6cb30b. The backend's plan is in its own docs ([backend architecture](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/README.md)); the backend issues named here are files in its `github-issues/` folder.

## How the dashboard talks to the backend

- **Every call goes through `src/api`.** `publicApiClient` sends no token. `apiClient` sends `Authorization: Bearer <access token>`, refreshes once on expiry and retries. `authedFetch` does the same, returning the raw response; 4 uploads use it, and the other 12 send `FormData` through `apiClient` with `isFormData: true`. Paths come from `src/api/endpoints.ts`, or from a feature's `api/paths.ts` once its group has moved.
- **The browser calls the API host directly.** The host routes `/api/v1/auth/...` to the authserver and the rest to the backend, so every request is cross-origin. That makes the backend's CORS settings part of the contract.
- **A few server-rendered pages** call the backend from the server through `requireAuth` (`src/lib/auth/server.ts`).

## The envelope

Every backend response today is an envelope:

```json
{ "hasError": false, "statusCode": 200, "message": { "general": [] }, "response": { } }
```

- Data is under `response`. Messages are under `message`, usually `message.general`.
- **Token failures** are recognised by `isTokenExpired` in `src/api/client.ts`: a 401, `statusCode 1000` in the envelope, or a "token expired" or "token invalid" message. The client then refreshes once and retries.
- **The backend will add two keys** to every envelope (backend issue 0019): `code` and `requestId`. `code` is `"ok"` on success, `validation_error` for invalid input, or `<module>.<reason>` for a domain error, such as `events.not_bookmarkable`. Every other key and value stays the same. New module endpoints return validation errors under `message.fields`; legacy endpoints keep today's shape.
- **The dashboard reads both new keys when present** and ignores their absence, so no flag is needed ([ADR-006](adr/ADR-006-one-api-client-and-error-model.md)).

## Rules for requests

- **Never send a field the backend hasn't declared.** Legacy backend serializers reject unknown keys, so a new field makes the request fail on any backend that doesn't have it yet. A change that sends a new field is behind a `NEXT_PUBLIC_FEATURE_<NAME>` flag, turned on per environment once that environment's backend accepts it ([ADR-011](adr/ADR-011-flags-for-new-sends.md)).
- **Never add a request header without the backend's CORS allowing it.** The browser's preflight fails otherwise. The same goes for reading a response header other than the simple ones. The 12-week plan sends no new header, and reads one: `Retry-After` on a 429 (issue 0043). The browser can read it only once the backend exposes it; until then, the dashboard waits 30 s. The request id is read from the envelope body.
- **Page through results, at most 100 rows per request.** The backend plans to cap `perPage` at 200, then 100 (its Phase 8).

## Idempotency

The backend's API standards say POSTs that create or charge will require an `Idempotency-Key` header, a client-chosen UUID, so a retry replays the first response instead of running twice ([backend API standards](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/07-api-standards.md#idempotency)). For the dashboard:
- **Nothing sends it yet.** Today's endpoints don't ask for it, and the backend's CORS doesn't allow the header ([What the dashboard needs from the backend](#what-the-dashboard-needs-from-the-backend)).
- **Until then, protect writes as today:** keep a submit button disabled while its mutation runs, and never retry a mutation on its own.
- **When a new endpoint requires it,** the feature's `api/` function creates one key per user action, not per network attempt, and reuses it on a retry. Sending the header is a new send, behind a flag ([ADR-011](adr/ADR-011-flags-for-new-sends.md)).

## Limits that are coming

| Limit | Value | Arrives with | Dashboard behaviour |
|---|---|---|---|
| Request time on `/api/` | 10 s at nginx, 9 s inside the app | backend 0033; dev-server and staging with 0045 (week 7), production with 0047 | A cut-off request shows a "took too long" state with a retry, and is retried at most once; known long calls get a longer client limit (issue 0022) |
| Request time on admin paths | 30 s at nginx, 29 s inside the app | the same | The same |
| Request body | 10 MB | the same | A request whose files add up to more than 10 MB is refused before upload, with a clear message (issue 0043) |
| Slow authserver | auth routes answer 503 within 2.5 s instead of hanging (backend 0038's load-test target) | backend Phase 2 | A 503 on sign-in or refresh is temporary: retry once, never sign out, in the browser and on the server (issue 0042) |
| 5xx responses | always a JSON envelope | backend 0047 | Parsed like any other error |
| Rate limits | 429 with `Retry-After` | backend Phase 5 | Show the wait from `Retry-After` (30 s when it can't be read), and don't retry on its own; a business 429, such as the open-collaboration limit, keeps the backend's message (issue 0043) |
| Page size | `perPage` capped at 200, then 100 | backend Phase 8 | Already paging at 100 |

## The change tracker

One row per backend change a browser can observe, with what the dashboard does about it.

| Backend | What changes for clients | Dashboard modules | Dashboard action |
|---|---|---|---|
| [backend 0017](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/0017-domain-error-registry.md) | Errors carry registered codes of the form `area.reason` (with 400, 401, 403, 404, 409, 422, 429 and 503 classes) | api-client | [0018](github-issues/0018-api-error-model.md) Read `code`, `requestId` and field errors in the API client |
| [backend 0018](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/0018-request-context-and-json-logs.md) | Every response carries an `X-Request-Id` header; a valid incoming `X-Request-Id` is reused | api-client | no dashboard change (the dashboard reads `requestId` from the body, backend 0019; reading the header cross-origin would need it exposed by CORS) |
| [backend 0019](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/0019-envelope-code-and-exception-handler.md) | Every envelope gains `code` (`ok` on success) and `requestId`; new module views return validation errors under `message.fields`; unhandled errors become a JSON 500 envelope; token failures unchanged | api-client (every feature through it) | [0018](github-issues/0018-api-error-model.md) Read `code`, `requestId` and field errors in the API client |
| [backend 0026](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/0026-base-api-views.md) | New base views for module endpoints only | none | no dashboard change (no existing route changes) |
| [backend 0031](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/0031-landing-stats-over-http.md) | `GET /api/v1/public/landing-stats/` replaces the landing-statistics WebSocket | none | no dashboard change (the dashboard doesn't use landing statistics) |
| [backend 0032](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/0032-health-endpoints.md) | New unauthenticated `/healthz/live` and `/healthz/ready` routes outside `/api/v1/` | none | no dashboard change (the dashboard doesn't call them) |
| [backend 0033](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/0033-gunicorn-and-nginx-config.md) | Behind nginx: reads cut at 10 s on `/api/` and 30 s on admin paths, in-app deadline 9 s / 29 s, request bodies capped at 10 MB | api-client; every feature that uploads | [0022](github-issues/0022-gateway-timeouts.md) Handle gateway timeouts without breaking long calls; [0043](github-issues/0043-upload-limit-and-429.md) Refuse uploads over 10 MB and handle 429 |
| [backend 0038](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/0038-k6-load-tests.md) | Load-test expectation: when the authserver is slow, auth routes fail within 2.5 s with 503 instead of hanging | api-client, auth-and-access | [0042](github-issues/0042-auth-503-keeps-session.md) Keep the session through temporary 503s from the auth routes (a 503 on sign-in or refresh is retryable, never a sign-out) |
| [backend 0045](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/0045-rollout-digest-deploys.md) | dev-server and staging deploy the gunicorn image behind nginx, so the 0033 limits and JSON 5xx reach them before production | api-client; uploads | [0022](github-issues/0022-gateway-timeouts.md) Handle gateway timeouts without breaking long calls; [0042](github-issues/0042-auth-503-keeps-session.md) Keep the session through temporary 503s from the auth routes; [0043](github-issues/0043-upload-limit-and-429.md) Refuse uploads over 10 MB and handle 429; [0044](github-issues/0044-release-before-nginx.md) Release the time-limit handling to staging and production before the backend's nginx move (released to staging before backend 0045 deploys) |
| [backend 0034](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/0034-retire-channels-and-daphne.md) | Channels, Daphne and every WebSocket route removed | none | no dashboard change (the dashboard opens no WebSocket) |
| [backend 0040](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/0040-drf-3-17.md) | DRF 3.17; responses pinned by characterization tests | all | [0034](github-issues/0034-staging-smoke-suite.md) Add a staging smoke suite for login and the core pages |
| [backend 0042](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/0042-django-5-2.md) | Django 5.2 after a two-week staging soak | all | [0034](github-issues/0034-staging-smoke-suite.md) Add a staging smoke suite for login and the core pages |
| [backend 0047](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/0047-rollout-gunicorn-cutover.md) | Production moves to gunicorn behind nginx: the 0033 limits go live and every 5xx is a JSON envelope | api-client; uploads | [0022](github-issues/0022-gateway-timeouts.md) Handle gateway timeouts without breaking long calls; [0043](github-issues/0043-upload-limit-and-429.md) Refuse uploads over 10 MB and handle 429; [0044](github-issues/0044-release-before-nginx.md) Release the time-limit handling to staging and production before the backend's nginx move |
| [backend 0085](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/0085-appraise-and-reverse.md) | Appraisal and reversal commands inside `contributions` | none | no dashboard change (legacy routes and responses unchanged) |
| [backend 0091](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/0091-internal-contributions-api.md) | The internal contributions API for the Discord bot | none | no dashboard change (service clients only) |
| [backend 0095](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/0095-ledger-writes-flag-and-utils-karma.md) | `utils/karma.py` writes the ledger behind a flag | none | no dashboard change (responses pinned by characterization tests) |
| [backend 0096](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/0096-move-learning-circle-karma-writes.md) | Learning-circle karma writes move | none | no dashboard change (responses pinned) |
| [backend 0097](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/0097-move-intern-karma-writes.md) | Intern karma writes move | none | no dashboard change (responses pinned) |
| [backend 0098](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/0098-move-profile-karma-write.md) | The profile karma write moves | none | no dashboard change (responses pinned) |
| [backend 0099](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/0099-move-signup-and-referral-wallet-writes.md) | The signup wallet write moves | none | no dashboard change (responses pinned) |
| [backend 0101](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/0101-bot-heartbeat-endpoint.md) | The bot heartbeat endpoint | none | no dashboard change (service clients only) |
| [epic:phase-5-identity-and-access](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/epics/phase-5-identity-and-access.md) | Default deny (every public view explicit, then authenticated by default); policies replace role-name checks; rate-limit keys and Turnstile on web signup and OTP; key separation phase 1 (upload tickets for the media worker) | auth-and-access, api-client, every feature that calls the backend anonymously, uploads | epic phase-5-identity-and-access (and now: [0033](github-issues/0033-anonymous-calls-list.md) List every anonymous backend call the dashboard makes; [0043](github-issues/0043-upload-limit-and-429.md) Refuse uploads over 10 MB and handle 429) |
| [epic:phase-6-gamification-and-notifications](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/epics/phase-6-gamification-and-notifications.md) | Leaderboards switch to period totals behind a flag after a published diff; the notifications pipeline | gamification, notifications | epic phase-6-gamification-and-notifications |
| [epic:phase-7-people-and-privacy](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/epics/phase-7-people-and-privacy.md) | Consent records at signup, an age gate, rights workflows | people, auth-and-access (sign-up) | epic phase-7-people-and-privacy |
| [epic:phase-8-api-standards-and-rewards](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/epics/phase-8-api-standards-and-rewards.md) | Generated OpenAPI; `X-App-Version` then minimum version (426); `perPage` capped at 200 then 100; exports as jobs; `Deprecation`/`Sunset` headers; dashboard polling at 120 s with ETag; vouchers with unguessable codes and single-use redemption | api-client, every list page, exports, rewards | epic phase-8-api-standards-and-rewards (and now: [0030](github-issues/0030-page-intern-lists.md) Page the intern lists at 100 rows; [0031](github-issues/0031-page-organisation-lists.md) Page the organisation lists at 100 rows; [0032](github-issues/0032-page-task-type-list.md) Page the task-type list at 100 rows) |
| [epic:later-on-demand](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/epics/later-on-demand.md) | RS256 tokens with JWKS, rotating refresh tokens with reuse detection, revocation (backend ADR-046 phase 2) | auth-and-access | epic later-on-demand |
| [epic:phase-4-contributions-cutover](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/epics/phase-4-contributions-cutover.md) | The bot switches to the internal API; reconciliation; true-up | none | no dashboard change (bot and backend only) |
| [epic:phase-0-security-hardening](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/epics/phase-0-security-hardening.md) | Tracked privately by the maintainers | unknown | no dashboard change known (the maintainers confirm whether any client-visible change comes from it) |

## What the dashboard needs from the backend

These aren't covered by a backend issue yet. The maintainers decide them:

1. **The signed-in user's grants.** An endpoint that returns the caller's verified grants and scopes, so page access can stop reading token roles ([ADR-009](adr/ADR-009-page-access.md)).
2. **CORS for new headers.** The allowed request headers must include `Idempotency-Key`, `traceparent`, `X-App-Version` and `If-None-Match` before the dashboard sends them. The exposed response headers must include `X-Request-Id`, `Retry-After`, `ETag`, `Deprecation` and `Sunset` before the dashboard can read them. Until `Retry-After` is exposed, the dashboard waits 30 s after a 429.
3. **Fast failure when the authserver is slow.** The backend's load tests expect auth routes to answer 503 within 2.5 s; the change that makes that true needs an owner. Until it lands, the dashboard still treats a 502, 503 or 504 from the auth routes as temporary (issue 0042).

## Keeping the tracker true

- When a backend issue changes something a browser can observe, it gets a row here in the same pull request that adds the backend issue, or in the next dashboard docs update.
- A row names the dashboard issue that follows the change, or says "no dashboard change" with the reason.
- The docs check fails if a backend change listed by the maintainers has no row.
