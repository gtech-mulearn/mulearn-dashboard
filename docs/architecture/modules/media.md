# media

Describes `dev` at 6d6cb30b (17 Nov 2026), and what changes.

## Purpose

Weekly twitches content.

## Backend module

[media](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/modules/media.md): comics and media content.

## Feature folders and routes

- `src/features/weekly-twitches/`: weekly twitches content. Routes: `/dashboard/management/weekly-twitches`, `/dashboard/weekly-twitches`.

## Page access

Decided today by the page-access layers in `src/lib/auth`, from every role a user holds: the route map that `src/proxy.ts` checks, `requireRole` on server pages, and `RoleGate` in components. The target rule is in [Page access](../08-auth-and-access.md#page-access).

## Backend endpoints called today

Endpoint groups from `src/api/endpoints.ts`, most used first:

- `endpoints.weeklyTwitches` (for example `/api/v1/dashboard/media-content/office-hours/`)

## Imported from outside

- `weekly-twitches`: imported by 1 other feature (`manage-ig`); every outside import uses its `index.ts`.

## What changes

No dashboard issue in the first 12 weeks. Later work is in the epics ([github-issues/](../github-issues/README.md)).

## Tests this module needs

- Contract tests for the media-content responses.

## Open questions

None yet.
