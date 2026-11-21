# Phase 8: API standards and rewards

| | |
|---|---|
| Epic | phase-8-api-standards-and-rewards |
| Phase / milestone | Phase 8: API standards and rewards |
| Labels | arch, phase:8, type:epic |

## What it will contain

Follows the backend's Phase 8 epic ([backend Phase 8](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/epics/phase-8-api-standards-and-rewards.md)):

- **Generated types.** Generate TypeScript types from the backend's OpenAPI spec, and check every zod schema against them in CI ([ADR-005](../../adr/ADR-005-parse-at-the-boundary.md)).
- **`X-App-Version`.** Send the build's version, behind a flag, once the backend's CORS allows the header; handle the `426` minimum-version answer with a reload prompt.
- **Page caps.** Already met by the paging issues (0030–0032); confirm before the backend's caps turn on.
- **Exports as jobs.** Replace in-browser exports with the backend's export jobs and signed downloads.
- **Polling with ETag.** Poll at 120 s while visible, and accept `304` responses.
- **`Deprecation` and `Sunset` headers:** log them, so retired endpoints are found before they go. Reading them, `ETag` and `Retry-After` needs the backend's CORS to expose them.
- **Vouchers** (rewards): when the backend gives vouchers unguessable codes and single-use redemption, update the `karma-voucher` screens to match.

## Entry conditions

The backend's Phase 8 issues are written, and its CORS allows the new headers.

## Exit criteria

- Types come from the backend's spec.
- No export is built in the browser.
- The dashboard handles `426` and `304`.
