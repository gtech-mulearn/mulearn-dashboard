# Move the tasks endpoints into the tasks feature

| | |
|---|---|
| ID | 0038 |
| Phase / milestone | Phase 1: Foundations |
| Module | learning |
| Size | S |
| Labels | arch, phase:1, module:learning, type:chore, size:S |
| Depends on | 0017 |
| Backend | none |
| Blocks | none |
| Repos | mulearn-dashboard |

## Why

The `tasks` feature's paths sit in the catch-all `admin` group of `src/api/endpoints.ts` (24 uses). Following the `events` pattern (issue 0017), they move into the feature ([05-data-fetching-and-state.md](../05-data-fetching-and-state.md)).

## Before you start

- Issue 0017 must be merged; follow its pattern.
- List the `endpoints.admin` entries `src/features/tasks/` uses, and check whether any other feature uses each one: `grep -rn "endpoints.admin.<name>" src`.

## What to do

1. Create `src/features/tasks/api/paths.ts` (`taskPaths`) with the entries only `tasks` uses, including `admin.tasks.events`.
2. Switch the feature to `taskPaths`, and remove those entries from `src/api/endpoints.ts`.
3. Entries other features also use stay where they are; list them in the pull request.

## Acceptance criteria

- [ ] Every tasks call uses the same URL as before.
- [ ] The moved entries are gone from `src/api/endpoints.ts`.

## How to test

```sh
bun run lint
bun run typecheck
bunx vitest run src/features/tasks
```

## Out of scope

- Reorganising the rest of the `admin` group.

## Notes for reviewers

Check no URL changed.
