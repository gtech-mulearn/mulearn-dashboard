# gamification

Describes `dev` at 6d6cb30b (17 Nov 2026), and what changes.

## Purpose

Managing and issuing achievements, and leaderboards.

## Backend module

[gamification](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/modules/gamification.md): levels, achievements, period totals and boards.

## Feature folders and routes

- `src/features/achievements/`: managing and issuing achievements. Routes: `/dashboard/management/manage-achievements`, `/dashboard/management/manage-achievements/bulk-issue`, `/dashboard/management/manage-achievements/issue`, `/dashboard/management/manage-achievements/list`, `/dashboard/management/manage-achievements/logs`, `/dashboard/management/manage-achievements/rules`, `/dashboard/management/manage-achievements/simulate`.
- `src/features/leaderboard/`: leaderboards. Routes: `/dashboard/leaderboard`.

## Page access

Decided today by the page-access layers in `src/lib/auth`, from every role a user holds: the route map that `src/proxy.ts` checks, `requireRole` on server pages, and `RoleGate` in components. The target rule is in [Page access](../08-auth-and-access.md#page-access).

## Backend endpoints called today

Endpoint groups from `src/api/endpoints.ts`, most used first:

- `endpoints.achievements`
- `endpoints.leaderboard` (for example `/api/v1/leaderboard/students-monthly/`)
- `endpoints.qseverse`

## Imported from outside

- `achievements`: imported by 1 other feature (`profile`); every outside import uses its `index.ts`.
- `leaderboard`: imported by 1 other feature (`home`); 1 import from outside reaches into its internals.

## What changes

- Backend changes that touch it: backend `epic:phase-6-gamification-and-notifications` ([the change tracker](../06-backend-contract.md#the-change-tracker)).

## Tests this module needs

- Contract tests for the leaderboard response, so the backend's switch to period totals (its Phase 6) is caught by a schema check.

## Open questions

- How visible changes in leaderboard numbers are explained to users when the backend switches to period totals.
