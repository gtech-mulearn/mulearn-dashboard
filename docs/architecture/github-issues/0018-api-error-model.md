# Read `code`, `requestId` and field errors in the API client

| | |
|---|---|
| ID | 0018 |
| Phase / milestone | Phase 1: Foundations |
| Module | api-client |
| Size | M |
| Labels | arch, phase:1, module:api-client, type:feature, size:M, needs-backend |
| Depends on | 0001 |
| Backend | 0019 |
| Blocks | 0019, 0022, 0028, 0042, 0043 |
| Repos | mulearn-dashboard |

## Why

The backend adds two keys to every response envelope (backend 0019): `code`, which is `"ok"` or a stable error code such as `validation_error`, and `requestId`. New backend endpoints also return validation errors under `message.fields`. Today `ApiError` keeps the raw envelope in `.data`, but nothing reads the new keys, and messages come from `extractDjangoMessage`. One error model in the API client reads them, so error states can show a request id, forms can show field errors, and reports can name the endpoint ([ADR-006](../adr/ADR-006-one-api-client-and-error-model.md), [06-backend-contract.md](../06-backend-contract.md#the-envelope)).

## Before you start

- Issue 0001 must be merged.
- Read [The envelope](../06-backend-contract.md#the-envelope).
- Read `src/api/errors.ts` (`ApiError`, `extractDjangoMessage`), `src/api/client.ts` (`request()`, `isTokenExpired`, `authedFetch`), `src/api/server.ts` and `src/lib/schemas/api-response.ts`.
- `authedFetch` returns a raw `Response`; its callers build their own errors: `src/features/profile/api/profile.api.ts` (two places), `src/features/projects/api/projects.api.ts` and `src/features/manage-ig/api/impact-projects.api.ts`.
- Backend 0019 must be merged on the backend's `dev`. Until a backend you can reach sends the new keys, test with fixtures copied from backend 0019 and the backend's API standards page.

## What to do

1. Extend `ApiError` in `src/api/errors.ts` with the optional fields `code`, `requestId`, `statusCode`, `endpoint` and `fieldErrors` (`Record<string, string[]>`), through an optional fourth constructor argument, so the 29 existing `new ApiError(` calls keep working.
2. Add `parseApiError(status: number, data: unknown, endpoint?: string): ApiError`:
   - reads `code` and `requestId` when present;
   - reads field errors from `message.fields`, flattening nested errors to dotted keys (`address.city`) and putting `non_field_errors` with the general messages;
   - takes the message as `extractDjangoMessage` does today, and when that finds none but there are field errors, uses the first field error.
3. Add `toApiError(response: Response, endpoint?: string): Promise<ApiError>` for `authedFetch` callers, and use it in the four callers above. `authedFetch` keeps returning a `Response`.
4. Use `parseApiError` in `request()` in `src/api/client.ts` (JSON and blob branches, the 403 and `hasError` paths) and in `src/api/server.ts`.
5. In `src/lib/schemas/api-response.ts`, add `code` and `requestId` as optional, and let `message.fields` through, so new-module envelopes pass the shared schema. Feature schemas for legacy endpoints don't change: those keep today's shape.
6. Keep token-expiry detection exactly as it is (401, `statusCode 1000`, or a token-expired message, in `isTokenExpired`).
7. Add tests:
   - a new `src/api/errors.test.ts`: today's envelope; one with `code` and `requestId`; a validation error with `message.fields` (nested and `non_field_errors`); a JSON 500 envelope;
   - a new `src/api/client.test.ts`, with a mocked `fetch`: a token failure still triggers one refresh and retry.

## Acceptance criteria

- [ ] Against today's envelopes, every error behaves exactly as before.
- [ ] With the new keys (fixtures), `ApiError` carries `code`, `requestId`, `endpoint` and `fieldErrors`.
- [ ] The four `authedFetch` callers build their errors with `toApiError`.
- [ ] Token-expiry handling is unchanged.

## How to test

```sh
bun run test src/api
bun run lint
bun run typecheck
```

## Out of scope

- Showing the request id in the UI (issue 0019).
- Reporting errors (issue 0028).

## Notes for reviewers

This needs no flag: it only reads optional fields. Check that nothing breaks when they're absent.
