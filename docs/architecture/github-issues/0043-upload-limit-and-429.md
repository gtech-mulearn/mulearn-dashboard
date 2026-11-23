# Refuse uploads over 10 MB and handle 429

| | |
|---|---|
| ID | 0043 |
| Phase / milestone | Phase 2: Serving and runtime |
| Module | api-client |
| Size | M |
| Labels | arch, phase:2, module:api-client, type:feature, size:M |
| Depends on | 0018 |
| Backend | none |
| Blocks | 0044 |
| Repos | mulearn-dashboard |

## Why

Behind nginx, the backend caps request bodies at 10 MB, and rate-limits some routes with 429 and a `Retry-After` header ([backend 0045](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/0045-rollout-digest-deploys.md)). Today the image pickers check their 5 MB limit (`src/lib/constants/upload.ts`), but nothing checks a whole request, so a form with several files can go over and fail only after it has been sent. Uploads go through `apiClient` with `isFormData: true` (12 calls) and through `authedFetch` (4 calls in 3 files), and a 429 shows the generic error.

One 429 is already a business rule, not rate limiting: `createCollaboration` in `src/features/company-jobs/api/jobs.api.ts` gets it at five open posts, and its message must still show ([06-backend-contract.md](../06-backend-contract.md#limits-that-are-coming)).

## Before you start

- Issue 0018 must be merged.
- Read [Limits that are coming](../06-backend-contract.md#limits-that-are-coming).
- Read `request()` and `authedFetch` in `src/api/client.ts`, `src/lib/constants/upload.ts`, and the 413 handling in `src/features/profile/api/profile.api.ts`.
- Find the uploads: `grep -rn "isFormData: true" src` and `grep -rn "authedFetch(" src`.

## What to do

1. Add `MAX_REQUEST_BODY_MB = 10` to `src/lib/constants/upload.ts`, next to the image limit.
2. **Before sending.** In `request()` when `isFormData` is set, and in `authedFetch` when the body is a `FormData`, add up the sizes of its `File` and `Blob` values. Over the limit, throw an `ApiError` with status 413, `kind: "upload_too_large"` and the message "This upload is too large (10 MB maximum)", without sending.
3. **A 413 from the server** gets the same `kind`. Keep the feature messages that already exist, like the cover-image one in `profile.api.ts`.
4. **429.** Give it `kind: "rate_limited"`, and `retryAfter` in seconds, read from `Retry-After` (seconds or an HTTP date). When the header is missing or can't be read, use 30 s: the browser can read it only once the backend exposes it to CORS. Show the backend's message when the envelope has one (this keeps `createCollaboration`'s), otherwise "Too many attempts, try again in N seconds".
5. Don't retry a 413 or a 429 automatically. Today's retry rule already skips every 4xx; keep it.
6. If `ApiError` has no `kind` field yet, add it as an optional `"timeout" | "unavailable" | "upload_too_large" | "rate_limited"`. Issues 0022, 0042 and 0043 share it; whichever lands first adds it.
7. **Tests** in `src/api/client.test.ts`:
   - a 12 MB `FormData` is refused before `fetch` is called, on both paths;
   - a 9 MB one is sent;
   - a server 413 gets the `kind`;
   - a 429 with seconds, with a date, and without the header (30 s);
   - a 429 with a backend message keeps it.

## Acceptance criteria

- [ ] A request over 10 MB is refused before upload, with the size message, through both `request()` and `authedFetch`.
- [ ] A 429 shows its wait, or 30 s when the header can't be read.
- [ ] Creating a sixth open collaboration still shows the backend's message.
- [ ] Every other error behaves as before.

## How to test

```sh
bun run test src/api src/features/profile src/features/company-jobs
bun run lint
bun run typecheck
```

## Out of scope

- Changing the image limit.
- Resizing or compressing files before upload.

## Notes for reviewers

Check every file in a form is counted, not just the first, and that a refused upload never reaches the refresh-and-retry path.
