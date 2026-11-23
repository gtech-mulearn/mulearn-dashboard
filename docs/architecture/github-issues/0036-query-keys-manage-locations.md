# Replace the inline query keys in manage-locations

| | |
|---|---|
| ID | 0036 |
| Phase / milestone | Phase 1: Foundations |
| Module | organizations |
| Size | S |
| Labels | arch, phase:1, module:organizations, type:chore, size:S |
| Depends on | 0016 |
| Backend | none |
| Blocks | none |
| Repos | mulearn-dashboard |

## Why

`manage-locations` writes query keys as inline arrays in 4 files, although it has a factory (`locationQueryKeys` in `src/features/manage-locations/hooks/query-keys.ts`). Invalidations then miss keys the factory changes ([ADR-004](../adr/ADR-004-server-state-and-ui-state.md)).

## Before you start

- Issue 0016 must be merged.
- Find the inline keys: the `src/features/manage-locations/` lines in `scripts/allowlists/query-keys.txt`.

## What to do

1. Replace each inline key with a `locationQueryKeys` entry, adding entries to the factory where needed.
2. Make every invalidation use the factory.
3. Remove the feature's lines from `scripts/allowlists/query-keys.txt`.

## Acceptance criteria

- [ ] No inline query key is left in `src/features/manage-locations/`.
- [ ] Editing a location still refreshes the lists that show it.

## How to test

```sh
bun scripts/check-query-keys.ts
bun run test src/features/manage-locations
```

## Out of scope

- Other features' keys.

## Notes for reviewers

Check each replaced key is the same array as before, so cached data still matches.
