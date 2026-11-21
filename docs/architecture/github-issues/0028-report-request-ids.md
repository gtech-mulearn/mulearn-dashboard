# Attach `code` and `requestId` to error reports

| | |
|---|---|
| ID | 0028 |
| Phase / milestone | Phase 2: Serving and runtime |
| Module | api-client |
| Size | S |
| Labels | arch, phase:2, module:api-client, type:feature, size:S |
| Depends on | 0018, 0026 |
| Backend | none |
| Blocks | none |
| Repos | mulearn-dashboard |

## Why

A report is far more useful when it can be matched to backend logs. Once issues 0018 and 0026 land, `ApiError` carries the backend's `code` and `requestId`, and errors reach Sentry; the two need joining ([ADR-014](../adr/ADR-014-observability.md)).

## Before you start

- Issues 0018 and 0026 must be merged.

## What to do

1. When an `ApiError` is reported, attach as tags: its `endpoint` (from issue 0018, with ids in the path replaced by a placeholder, and no query values), the HTTP status, `code`, `kind` when present, and `requestId`.
2. Never attach request or response bodies.
3. Add tests: the tags are set, and no body appears.

## Acceptance criteria

- [ ] A reported API error carries endpoint, status, `code` and `requestId` (when present).
- [ ] No body or personal field is attached.

## How to test

```sh
bun run test src/api src/lib/error-handling
```

## Out of scope

- Sending a `traceparent` header (waits for the backend's CORS).

## Notes for reviewers

Check ids inside paths are replaced with a placeholder.
