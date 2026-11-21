# Page the organisation lists at 100 rows

| | |
|---|---|
| ID | 0031 |
| Phase / milestone | Phase 2: Serving and runtime |
| Module | organizations |
| Size | S |
| Labels | arch, phase:2, module:organizations, type:chore, size:S |
| Depends on | 0001 |
| Backend | none |
| Blocks | none |
| Repos | mulearn-dashboard |

## Why

Two call sites (each asking for 1,000 rows) in this module ask the backend for more rows than it will allow: the backend plans to cap page sizes at 200, then 100 (its Phase 8). Asking for at most 100 rows and paging through the rest keeps these screens working, and loads less at once ([06-backend-contract.md](../06-backend-contract.md#rules-for-requests)).

## Before you start

- Issue 0001 must be merged.
- Read [Lists and paging](../05-data-fetching-and-state.md#lists-and-paging).
- The module page is [organizations](../modules/organizations.md).

## What to do

1. Change each call site to request at most 100 rows:
   - `src/features/organizations/components/departments/departments-view.tsx`
   - `src/features/organizations/components/verify/verify-action-dialog.tsx`
2. Where the screen lists results, page through them: `useInfiniteQuery` with "load more", or the table's existing pagination.
3. Where a picker or dialog loaded everything to search locally, search through the backend instead (debounced, 100 results at most), or page as above.
4. Where the code needs the whole set at once (a total, an export, a check across every row), fetch every page, 100 rows at a time, until the last one.
5. Keep every item reachable, as it is today.

## Acceptance criteria

- [ ] No call in these files requests more than 100 rows.
- [ ] Every item that was reachable before is still reachable, and totals are unchanged.
- [ ] Typecheck, lint, the tests and the build pass.

## How to test

```sh
bun run lint
bun run typecheck
bun run test "src/features/organizations/components/departments" "src/features/organizations/components/verify"
```

## Out of scope

- Changing what the screens show.

## Notes for reviewers

Check search-as-you-type is debounced, and that "load more" stops at the last page.
