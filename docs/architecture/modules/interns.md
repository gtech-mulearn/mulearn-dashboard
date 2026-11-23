# interns

Describes `dev` at 6d6cb30b (17 Nov 2026), and what changes.

## Purpose

The intern overview, minutes, quest log, timesheets and intern management.

## Backend module

[interns](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/modules/interns.md): intern tasks, timesheets and reviews.

## Feature folders and routes

- `src/features/intern/`: intern overview, minutes, quest log. Routes: `/dashboard/intern/minutes`, `/dashboard/intern/quest-log`.

## Page access

Decided today by the page-access layers in `src/lib/auth`, from every role a user holds: the route map that `src/proxy.ts` checks, `requireRole` on server pages, and `RoleGate` in components. The target rule is in [Page access](../08-auth-and-access.md#page-access).

## Backend endpoints called today

Endpoint groups from `src/api/endpoints.ts`, most used first:

- `endpoints.intern` (for example `/api/v1/dashboard/intern/timesheets/`)
- `endpoints.manageInterns` (for example `/api/v1/dashboard/manage-interns/interns/`)

## Imported from outside

- `intern`: imported by 2 other features (`manage-roles`, `manage-users`); 9 imports from outside reach into its internals.

## What changes

- [0030](../github-issues/0030-page-intern-lists.md) Page the intern lists at 100 rows

## Tests this module needs

- Paging tests for the intern lists at 100 rows: every intern is still listed, counted and excluded where it was before (issue 0030).

## Open questions

None yet.
