# Test that page access is the union of every role a user holds

| | |
|---|---|
| ID | 0021 |
| Phase / milestone | Phase 1: Foundations |
| Module | auth-and-access |
| Size | S |
| Labels | arch, phase:1, module:auth-and-access, type:chore, size:S, core-review |
| Depends on | 0001 |
| Backend | none |
| Blocks | none |
| Repos | mulearn-dashboard |

## Why

Users hold several roles at once, and a page should open if any of them allows it. Page access has several layers: the route map that `src/proxy.ts` checks (`routeConfig.roles.some(...)`), `requireRole` on server pages (`src/lib/auth/server.ts`, 43 pages; `requirePermission` exists, but no page uses it), `hasAnyRole` and the `PERMISSIONS` map (`src/lib/auth/permissions.ts`), and `RoleGate` in components. The existing tests (`src/proxy.test.ts`, `src/lib/auth/route-access.test.ts`) check single roles. Nothing tests users who hold several, so a change could quietly lock them out ([ADR-009](../adr/ADR-009-page-access.md)).

## Before you start

- Issue 0001 must be merged.
- Read [Page access](../08-auth-and-access.md#page-access), `src/proxy.ts` and `src/proxy.test.ts` (its `makeToken` helper), `src/lib/auth/permissions.ts`, `src/lib/auth/server.ts` and `src/components/auth/role-gate.tsx`.

## What to do

1. In `src/proxy.test.ts`, add cases for tokens holding two or more roles:
   - a route that any one of the roles allows opens;
   - a route that none of them allows redirects;
   - per-interest-group lead roles combine with ordinary roles (the route's dynamic check).
2. Add the same cases for `hasAnyRole` and `requireRole` (with the user lookup mocked), and for `RoleGate` with Testing Library.
3. Change no code in this issue. If a test shows a page opening for a user who holds none of its roles, don't open a public pull request with it: report it privately, as the [issues README](README.md#reporting-a-vulnerability) says.

## Acceptance criteria

- [ ] The new cases pass in all four places.
- [ ] No source file other than tests changes.

## How to test

```sh
bun run test src/proxy.test.ts src/lib/auth src/components/auth
```

## Out of scope

- Moving page access to the backend's grants (the Phase 5 epic).

## Notes for reviewers

Two reviewers: this is page access. Check the cases cover more than one pair of roles.
