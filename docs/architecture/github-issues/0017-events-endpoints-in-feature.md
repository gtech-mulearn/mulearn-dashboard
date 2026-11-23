# Move the events endpoints into the events feature

| | |
|---|---|
| ID | 0017 |
| Phase / milestone | Phase 1: Foundations |
| Module | events |
| Size | S |
| Labels | arch, phase:1, module:events, type:chore, size:S, good first issue |
| Depends on | none |
| Backend | none |
| Blocks | 0038, 0039 |
| Repos | mulearn-dashboard |

## Why

Every backend path lives in one 1,768-line file, `src/api/endpoints.ts`, so every feature's change touches the same shared file. Moving each feature's paths into the feature keeps changes local ([05-data-fetching-and-state.md](../05-data-fetching-and-state.md)). This issue does it for `events`, as the pattern for the rest.

## Before you start

- Read [The path of a piece of data](../05-data-fetching-and-state.md#the-path-of-a-piece-of-data).
- Find the `events` group in `src/api/endpoints.ts`, and its users: `grep -rn "endpoints.events" src`. One file outside `src/features/events/` uses it at 6d6cb30b (`src/features/notification/api/notification.api.ts`).

## What to do

1. Create `src/features/events/api/paths.ts`, exporting `eventPaths` with the entries of the `events` group that only the feature uses, copied byte for byte. Keep every key name: `eventPaths.mentor` looks unused, but `events.api.ts` reaches it as `endpoints.events[tier]`.
2. Change the feature's `api/` files to use `eventPaths`.
3. Entries that code outside the feature uses stay in `src/api/endpoints.ts`, so no other feature has to import the events feature (the notification topbar loads on every page, and importing `@/features/events` there would pull the whole feature into it).
4. Remove the moved entries from `src/api/endpoints.ts`, and change its header comment from "All Django URLs live here" to say features may keep their own paths in `api/paths.ts`.
5. Update `docs/architecture/modules/events.md` if it lists the moved group.
6. Out of scope: the unused `dashboard.events` entry and `admin.tasks.events` (issue 0038 decides the tasks entries).

## Acceptance criteria

- [ ] The moved entries are gone from `src/api/endpoints.ts`, and the entries used outside the feature are still there.
- [ ] Every events call uses the same URL as before: an inline-snapshot test of `eventPaths` proves it.
- [ ] Typecheck, lint, the feature's tests and the build pass.

## How to test

```sh
bun run lint
bun run typecheck
bunx vitest run src/features/events
bun run build
```

## Out of scope

- Moving other features' paths (each is its own issue).

## Notes for reviewers

Check that no URL changed: a moved path must be byte-for-byte the same.
