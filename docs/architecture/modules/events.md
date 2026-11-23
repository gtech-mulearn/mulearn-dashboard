# events

Describes `dev` at 6d6cb30b (17 Nov 2026), and what changes.

## Purpose

Events and event management. It is also the pilot for moving endpoints into their feature, and its `eventKeys` factory is the model for query keys.

## Backend module

[events](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/modules/events.md): events and hackathons.

## Feature folders and routes

- `src/features/events/`: events and event management. Routes: `/dashboard/events/[id]`, `/dashboard/manage-events`, `/dashboard/manage-events/[id]`.

## Page access

Decided today by the page-access layers in `src/lib/auth`, from every role a user holds: the route map that `src/proxy.ts` checks, `requireRole` on server pages, and `RoleGate` in components. The target rule is in [Page access](../08-auth-and-access.md#page-access).

## Backend endpoints called today

Endpoint groups from `src/api/endpoints.ts`, most used first:

- `endpoints.events` (for example `/api/v1/dashboard/events/manage/`)
- `endpoints.search` (for example `/api/v1/dashboard/user/search/`)
- `endpoints.dashboard` (for example `/api/v1/dashboard/ig/list/`)
- `endpoints.user` (for example `/api/v1/dashboard/user/info/`)

## Imported from outside

- `events`: imported by 1 other feature (`home`); 1 import from outside reaches into its internals.

## What changes

- [0017](../github-issues/0017-events-endpoints-in-feature.md) Move the events endpoints into the events feature

## Tests this module needs

- A mutation invalidates only the keys it changed, through `eventKeys`.
- A test that the events endpoints resolve from the feature (issue 0017).

## Open questions

None yet.
