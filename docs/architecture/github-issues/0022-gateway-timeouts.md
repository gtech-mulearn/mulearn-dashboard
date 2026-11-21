# Handle gateway timeouts without breaking long calls

| | |
|---|---|
| ID | 0022 |
| Phase / milestone | Phase 2: Serving and runtime |
| Module | api-client |
| Size | M |
| Labels | arch, phase:2, module:api-client, type:feature, size:M, core-review |
| Depends on | 0018 |
| Backend | none |
| Blocks | 0044 |
| Repos | mulearn-dashboard |

## Why

The backend is moving behind nginx, which cuts reads at 10 s on `/api/` and at 30 s on admin paths, and answers every 5xx with a JSON envelope. It reaches dev-server and staging first ([backend 0045](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/0045-rollout-digest-deploys.md), week 7), then production ([backend 0047](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/0047-rollout-gunicorn-cutover.md)). Today the API client has no timeout of its own, a 504 shows the generic error, and the query client retries it three times. Some calls already take long: 19 `responseType: "blob"` downloads in 13 files, and the admin reports. A client timeout must not break any call that works today ([11-reliability-and-observability.md](../11-reliability-and-observability.md#when-the-backend-is-slow-or-failing)).

The other new limits have their own issues: 503s from the auth routes (0042), and the 10 MB upload cap and 429 (0043).

## Before you start

- Issue 0018 must be merged.
- Read [Limits that are coming](../06-backend-contract.md#limits-that-are-coming).
- Read `request()` in `src/api/client.ts`, and the query client's retry rule in `src/app/providers.tsx` (no retry on a 4xx, up to three retries otherwise).
- Find the long calls: `grep -rn 'responseType: "blob"' src`, plus the admin report and export calls.

## What to do

1. **Mark the long calls first.** Add a per-call `timeoutMs` option to `request()`. Give every blob download and every admin report or export call `timeoutMs: 32_000`, a little more than the backend's 30 s on admin paths. List each marked call in the pull request.
2. **Default timeout.** Abort any other call after 12 s, a little more than the backend's 10 s, so the backend answers first when it can. Clear the timer when the call settles, on every path, including refresh-and-retry.
3. **Error kind.** A client timeout, a 504 or a 502 becomes an `ApiError` with a client-side `kind: "timeout"`. Keep it separate from the backend's `code` (issue 0018), which still comes only from the envelope. If `ApiError` has no `kind` field yet, add it as an optional `"timeout" | "unavailable" | "upload_too_large" | "rate_limited"`. Issues 0022, 0042 and 0043 share it; whichever lands first adds it.
4. **Retries.** In `src/app/providers.tsx`, retry a `timeout` at most once, and keep today's rule for everything else. Mutations never retry on their own.
5. **Message.** Error states and toasts show "This is taking too long" with a retry, through `getApiResponseError`.
6. **Tests** in `src/api/client.test.ts`, with fake timers and a fake `fetch`:
   - an unmarked call aborts at 12 s;
   - a marked call is still running at 12 s, and aborts at 32 s;
   - the timer is cleared on success;
   - an aborted call never triggers a token refresh;
   - a 504 with a JSON envelope keeps the envelope's `code`, and gets `kind: "timeout"`.

## Acceptance criteria

- [ ] Every blob download and admin report or export call is marked, and listed in the pull request.
- [ ] Against a backend you can reach, every page and download you checked still works (list them in the pull request).
- [ ] An unmarked call that doesn't answer within 12 s ends in the "taking too long" state, with a retry.
- [ ] A timeout is retried at most once.
- [ ] Every other error behaves as before.

## How to test

```sh
bun run test src/api src/app
bun run lint
bun run typecheck
```

## Out of scope

- 503s from the auth routes (issue 0042).
- The upload limit and 429 (issue 0043).
- Error boundaries (issue 0025).

## Notes for reviewers

Two reviewers: this changes every call. Check that a timed-out call can't be retried both by the query client and by its caller.
