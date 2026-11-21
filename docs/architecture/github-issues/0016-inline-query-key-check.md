# Check for inline query keys in CI

| | |
|---|---|
| ID | 0016 |
| Phase / milestone | Phase 1: Foundations |
| Module | platform |
| Size | M |
| Labels | arch, phase:1, module:platform, type:chore, size:M |
| Depends on | 0001 |
| Backend | none |
| Blocks | 0020, 0036, 0037 |
| Repos | mulearn-dashboard |

## Why

Most features keep their query keys in a factory (`hooks/query-keys.ts`), but 92 inline key arrays remain in 26 files at 6d6cb30b, 40 of them in invalidations. An inline key can drift from the factory, so an invalidation misses and stale data shows after an edit. A CI check stops new inline keys ([ADR-004](../adr/ADR-004-server-state-and-ui-state.md)).

## Before you start

- Issue 0001 must be merged.
- Read [Query keys](../05-data-fetching-and-state.md#query-keys).

## What to do

1. Create `scripts/check-query-keys.ts`. It scans `src/**/*.{ts,tsx}` for `queryKey: [` where the array starts with a string literal, and counts them per file. An invalidation's `queryKey: [` is one of these, so count each array once.
2. Compare with a new `scripts/allowlists/query-keys.txt`: `<file> | <count>` per line. Exit 1 when a file isn't listed, when its count is higher than listed, or when a listed count is higher than the real one (so the list shrinks as keys are replaced). Follow the [Rules for the check scripts](README.md#rules-for-the-check-scripts).
3. Seed the list from the pull request's base commit, and record the totals (92 in 26 files at 6d6cb30b).
4. Add `scripts/check-query-keys.test.ts` with fixtures: a factory key passes, a new inline key fails, a lower count without a list update fails.
5. Add a step to the `lint` job in `.github/workflows/ci.yml` that runs `bun scripts/check-query-keys.ts`.

## Acceptance criteria

- [ ] The CI step passes on this pull request.
- [ ] On a throwaway branch, a new inline key fails the step and names the file.

## How to test

```sh
bun run test scripts/check-query-keys.test.ts
bun scripts/check-query-keys.ts
```

## Out of scope

- Replacing the existing inline keys (issues 0036, 0037, and later changes).

## Notes for reviewers

Check that keys built from a factory call (`eventKeys.detail(id)`) are never counted.
