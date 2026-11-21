# integrations

Describes `dev` at 6d6cb30b (17 Nov 2026), and what changes.

## Purpose

Partner connections and partner courses.

## Backend module

[integrations](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/modules/integrations.md): Discord and partner integrations.

## Feature folders and routes

- `src/features/connect/`: partner connections (QSEverse, registration hand-off). Routes: used inside other pages.
- `src/features/courses/`: partner courses. Routes: used inside other pages.

## Page access

Decided today by the page-access layers in `src/lib/auth`, from every role a user holds: the route map that `src/proxy.ts` checks, `requireRole` on server pages, and `RoleGate` in components. The target rule is in [Page access](../08-auth-and-access.md#page-access).

## Backend endpoints called today

Endpoint groups from `src/api/endpoints.ts`, most used first:

- `endpoints.integrations` (for example `/api/v1/integrations/`)
- `endpoints.qseverse`
- `endpoints.register`

## Imported from outside

Nothing outside the module imports it.

## What changes

No dashboard issue in the first 12 weeks. Later work is in the epics ([github-issues/](../github-issues/README.md)).

## Tests this module needs

- Contract tests for the partner responses, with a recorded failure case.

## Open questions

None yet.
