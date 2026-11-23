# Replace the inline query keys in manage-ig

| | |
|---|---|
| ID | 0037 |
| Phase / milestone | Phase 1: Foundations |
| Module | communities |
| Size | S |
| Labels | arch, phase:1, module:communities, type:chore, size:S |
| Depends on | 0016 |
| Backend | none |
| Blocks | none |
| Repos | mulearn-dashboard |

## Why

`manage-ig` writes query keys as inline arrays in 4 files. It has a factory for impact projects (`impactProjectsKeys` in `src/features/manage-ig/hooks/impact-projects-query-keys.ts`), but not for the rest ([ADR-004](../adr/ADR-004-server-state-and-ui-state.md)).

## Before you start

- Issue 0016 must be merged.
- Find the inline keys: the `src/features/manage-ig/` lines in `scripts/allowlists/query-keys.txt`.

## What to do

1. Create the feature's factory in `src/features/manage-ig/hooks/query-keys.ts` (`manageIgKeys`), and keep `impactProjectsKeys` where it is or re-export it from there.
2. Replace each inline key and invalidation with factory entries.
3. Remove the feature's lines from `scripts/allowlists/query-keys.txt`.

## Acceptance criteria

- [ ] No inline query key is left in `src/features/manage-ig/`.
- [ ] Editing an interest group still refreshes the views that show it.

## How to test

```sh
bun scripts/check-query-keys.ts
bun run test src/features/manage-ig
```

## Out of scope

- Other features' keys.

## Notes for reviewers

Check each replaced key is the same array as before, so cached data still matches.
