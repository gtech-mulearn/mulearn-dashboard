# projects

Describes `dev` at 6d6cb30b (17 Nov 2026), and what changes.

## Purpose

Projects and problem statements.

## Backend module

[projects](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/modules/projects.md): projects and impact projects.

## Feature folders and routes

- `src/features/problem-statements/`: problem statements. Routes: `/dashboard/manage-problem-statements`, `/dashboard/manage-problem-statements/[id]`, `/dashboard/problem-statements`, `/dashboard/problem-statements/[idOrSlug]`.
- `src/features/projects/`: projects. Routes: `/dashboard/projects`.

## Page access

Decided today by the page-access layers in `src/lib/auth`, from every role a user holds: the route map that `src/proxy.ts` checks, `requireRole` on server pages, and `RoleGate` in components. The target rule is in [Page access](../08-auth-and-access.md#page-access).

## Backend endpoints called today

Endpoint groups from `src/api/endpoints.ts`, most used first:

- `endpoints.problemStatements` (for example `/api/v1/dashboard/problem-statements/admin/`)
- `endpoints.projects` (for example `/api/v1/dashboard/projects/`)
- `endpoints.search` (for example `/api/v1/dashboard/user/search/`)

## Imported from outside

- `projects`: imported by 1 other feature (`company-tasks`); every outside import uses its `index.ts`.

## What changes

No dashboard issue in the first 12 weeks. Later work is in the epics ([github-issues/](../github-issues/README.md)).

## Tests this module needs

- Contract tests for the project and problem-statement responses.

## Open questions

- Whether problem statements belong with events (hackathons) once the backend settles their owner.
