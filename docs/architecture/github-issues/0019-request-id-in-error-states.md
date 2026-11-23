# Show the request id in error states

| | |
|---|---|
| ID | 0019 |
| Phase / milestone | Phase 1: Foundations |
| Module | app-shell |
| Size | M |
| Labels | arch, phase:1, module:app-shell, type:feature, size:M |
| Depends on | 0018 |
| Backend | none |
| Blocks | none |
| Repos | mulearn-dashboard |

## Why

When something fails, support can trace it in the backend's logs only with the request id. Once issue 0018 lands, `ApiError` carries it, but nothing shows it. Errors reach users in two ways: the error fallbacks in `src/components/ui/errors/` (`GlobalErrorFallback`, `SectionErrorFallback`, `InlineErrorFallback`), and toasts. There are 465 `toast.error(` calls, about 100 files build their message with `getApiResponseError` (`src/hooks/use-get-error.ts`), and there is no shared toast helper ([11-reliability-and-observability.md](../11-reliability-and-observability.md)).

## Before you start

- Issue 0018 must be merged.
- Read `src/components/ui/errors/`, `src/hooks/use-get-error.ts`, and how `src/app/(dashboard)/error.tsx` uses `SectionErrorFallback`.

## What to do

1. In `SectionErrorFallback` and `InlineErrorFallback`, when the error is an `ApiError` with a `requestId`, show "Request id: <id>" under the message, with a copy button.
2. Make `getApiResponseError` return the request id with the message, keeping its current return shape for callers that only want the text.
3. Add `toastApiError(error)` in `src/hooks/use-get-error.ts`: it shows the message and, when there is one, the request id. Use it in one feature (`events`) as the example; other features adopt it when they're next changed.
4. Show nothing extra when there's no request id.

## Acceptance criteria

- [ ] An error fallback or a `toastApiError` toast for an error with a request id shows it and copies it.
- [ ] Errors without one look exactly as before.
- [ ] Existing `getApiResponseError` callers compile and behave as before.

## How to test

```sh
bun run test src/components/ui src/hooks src/features/events
bun run lint
bun run typecheck
```

## Out of scope

- Replacing every `toast.error(` call (each feature adopts the helper when next changed).
- New illustrations (the design system's work).

## Notes for reviewers

Check the id is selectable text, and that screen readers announce it with the message.
