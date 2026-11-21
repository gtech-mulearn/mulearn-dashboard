# Move the learning-circle endpoints into the learning-circle feature

| | |
|---|---|
| ID | 0039 |
| Phase / milestone | Phase 1: Foundations |
| Module | communities |
| Size | S |
| Labels | arch, phase:1, module:communities, type:chore, size:S |
| Depends on | 0017 |
| Backend | none |
| Blocks | none |
| Repos | mulearn-dashboard |

## Why

Learning circles use the `learningCircle` group of `src/api/endpoints.ts` 40 times. Following the `events` pattern (issue 0017), the group moves into the feature ([05-data-fetching-and-state.md](../05-data-fetching-and-state.md)).

## Before you start

- Issue 0017 must be merged; follow its pattern.
- Check who uses the group: `grep -rn "endpoints.learningCircle" src`.

## What to do

1. Create `src/features/learning-circle/api/paths.ts` (`learningCirclePaths`) with the group's entries that only the feature uses.
2. Switch the feature to it. Entries that code outside the feature uses stay in `src/api/endpoints.ts`.
3. Remove the moved entries from `src/api/endpoints.ts`.

## Acceptance criteria

- [ ] Every learning-circle call uses the same URL as before.
- [ ] The moved entries are gone from `src/api/endpoints.ts`.

## How to test

```sh
bun run lint
bun run typecheck
bunx vitest run src/features/learning-circle
```

## Out of scope

- Other groups.

## Notes for reviewers

Check no URL changed.
