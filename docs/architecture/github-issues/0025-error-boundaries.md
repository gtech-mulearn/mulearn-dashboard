# Add error boundaries to dashboard sections

| | |
|---|---|
| ID | 0025 |
| Phase / milestone | Phase 2: Serving and runtime |
| Module | app-shell |
| Size | M |
| Labels | arch, phase:2, module:app-shell, type:feature, size:M |
| Depends on | 0001 |
| Backend | none |
| Blocks | none |
| Repos | mulearn-dashboard |

## Why

Each route group already has an `error.tsx`, and four sections have their own. On the dashboard home and in side panels, though, one failing widget still takes down the whole page ([11-reliability-and-observability.md](../11-reliability-and-observability.md#error-boundaries)).

## Before you start

- Issue 0001 must be merged.
- Read `src/lib/error-handling/AppErrorBoundary.tsx`, `src/components/ui/errors/SectionErrorFallback.tsx`, and the widgets on the dashboard home (`src/features/home/components/`) and in `src/components/dashboard/`.

## What to do

1. Add `SectionErrorBoundary` in `src/components/layout/`, built on `AppErrorBoundary` and TanStack Query's `QueryErrorResetBoundary`. It renders the existing `SectionErrorFallback`, whose retry button resets the failed queries.
2. Wrap each separately loaded widget on the dashboard home, and each side panel, in it.
3. It logs through the existing error-logging service.
4. Add tests: a throwing widget shows the retry state, and its siblings still render.

## Acceptance criteria

- [ ] One failing widget leaves the rest of the page usable.
- [ ] Retry refetches only that widget's data.

## How to test

```sh
bun run test src/components src/features/home
bun run lint
bun run typecheck
```

## Out of scope

- Reporting to an external service (issue 0026).

## Notes for reviewers

Check route-group `error.tsx` files are unchanged, and that a boundary never swallows an error silently.
