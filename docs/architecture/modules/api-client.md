# api-client

Describes `dev` at 6d6cb30b (17 Nov 2026), and what changes.

## Purpose

The one way the dashboard talks to the backend: the client, the endpoints, errors, refresh and timeouts.

## Backend module

Every backend module, through [the backend contract](../06-backend-contract.md).

## Feature folders and routes

- Code: `src/api/` (`client.ts`, `endpoints.ts`, `errors.ts`, `refresh.client.ts`, `refresh.server.ts`, `server.ts`).

## Page access

Not applicable: this is a shared layer.

## Backend endpoints called today

Not applicable: a shared layer.

## Imported from outside

- Shared layer: imported throughout the app. It must never import a feature ([Import rules](../04-module-rules.md#import-rules), rule 4).

## What changes

- [0018](../github-issues/0018-api-error-model.md) Read `code`, `requestId` and field errors in the API client
- [0022](../github-issues/0022-gateway-timeouts.md) Handle gateway timeouts without breaking long calls
- [0028](../github-issues/0028-report-request-ids.md) Attach `code` and `requestId` to error reports
- [0033](../github-issues/0033-anonymous-calls-list.md) List every anonymous backend call the dashboard makes
- [0043](../github-issues/0043-upload-limit-and-429.md) Refuse uploads over 10 MB and handle 429
- Backend changes that touch it: backend 0017, backend 0018, backend 0019, backend 0033, backend 0038, backend 0045, backend 0047, backend `epic:phase-5-identity-and-access`, backend `epic:phase-8-api-standards-and-rewards` ([the change tracker](../06-backend-contract.md#the-change-tracker)).

## Tests this module needs

- `ApiError` tests with and without `code` and `requestId` (issue 0018).
- Timeout tests with a fake transport, and long calls marked (issue 0022).
- Upload-limit and 429 tests, for `apiClient` uploads and `authedFetch` (issue 0043).
- A check that every anonymous call is listed (issue 0033).

## Open questions

- The backend needs in [06-backend-contract.md](../06-backend-contract.md): CORS for new headers, and an owner for the fast-failing auth routes.
