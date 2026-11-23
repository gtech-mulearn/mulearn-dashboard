# mentorship

Describes `dev` at 6d6cb30b (17 Nov 2026), and what changes.

## Purpose

Mentor registration, sessions, mentees, session verification and a company's mentors.

## Backend module

[mentorship](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/modules/mentorship.md): mentor applications and sessions.

## Feature folders and routes

- `src/features/company-mentors/`: a company's mentors. Routes: `/dashboard/company/mentors`.
- `src/features/mentor/`: mentor registration, sessions, mentees. Routes: `/dashboard/management/session-verification`, `/dashboard/mentor/mentees`, `/dashboard/mentor/opportunities`, `/dashboard/mentor/sessions`, `/dashboard/mentor/task-requests`, `/dashboard/sessions`.

## Page access

Decided today by the page-access layers in `src/lib/auth`, from every role a user holds: the route map that `src/proxy.ts` checks, `requireRole` on server pages, and `RoleGate` in components. The target rule is in [Page access](../08-auth-and-access.md#page-access).

## Backend endpoints called today

Endpoint groups from `src/api/endpoints.ts`, most used first:

- `endpoints.mentor` (for example `/api/v1/dashboard/mentor/availability/`)
- `endpoints.adminTask` (for example `/api/v1/dashboard/task/list-task-type/`)
- `endpoints.dashboard` (for example `/api/v1/dashboard/ig/list/`)
- `endpoints.company` (for example `/api/v1/dashboard/company/list/`)
- `endpoints.search`

## Imported from outside

- `company-mentors`: imported by no other feature; 1 import from outside reaches into its internals.
- `mentor`: imported by 5 other features (`achievements`, `company-jobs`, `company-mentors`, `home`, `tour`); 27 imports from outside reach into its internals.

## What changes

- [0007](../github-issues/0007-index-company-mentors.md) Give company-mentors an index.ts
- [0010](../github-issues/0010-mentor-public-surface.md) Route imports of mentor through its index

## Tests this module needs

- A check that no code outside `mentor` imports its internals (issue 0010).
- Component tests for session verification.

## Open questions

None yet.
