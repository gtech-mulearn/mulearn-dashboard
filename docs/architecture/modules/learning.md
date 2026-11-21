# learning

Describes `dev` at 6d6cb30b (17 Nov 2026), and what changes.

## Purpose

Task management (create, import, task types) and a learner's task journey.

## Backend module

[learning](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/modules/learning.md): tasks, task types and skills.

## Feature folders and routes

- `src/features/mujourney/`: a learner's task journey. Routes: used inside other pages.
- `src/features/tasks/`: task management; its verification screens call contributions endpoints. Routes: `/dashboard/management/tasks/bulk-import`, `/dashboard/management/tasks/create`, `/dashboard/management/tasks/list`, `/dashboard/management/tasks/task-type`, `/dashboard/management/tasks/task-verification`.

## Page access

Decided today by the page-access layers in `src/lib/auth`, from every role a user holds: the route map that `src/proxy.ts` checks, `requireRole` on server pages, and `RoleGate` in components. The target rule is in [Page access](../08-auth-and-access.md#page-access).

## Backend endpoints called today

Endpoint groups from `src/api/endpoints.ts`, most used first:

- `endpoints.admin` (for example `/api/v1/dashboard/task/`)
- `endpoints.mujourney` (for example `/api/v1/dashboard/task/list/`)

## Imported from outside

- `mujourney`: imported by no other feature; 4 imports from outside reach into its internals.

## What changes

- [0032](../github-issues/0032-page-task-type-list.md) Page the task-type list at 100 rows
- [0038](../github-issues/0038-tasks-endpoints-in-feature.md) Move the tasks endpoints into the tasks feature

## Tests this module needs

- Paging tests for the task-type list at 100 rows (issue 0032).
- A test that the tasks endpoints resolve from the feature (issue 0038).

## Open questions

None yet.
