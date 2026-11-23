# administration

Describes `dev` at 6d6cb30b (17 Nov 2026), and what changes.

## Purpose

Platform administration: dynamic types, feature switches and the URL shortener.

## Backend module

[administration](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/modules/administration.md): platform settings and the URL shortener.

## Feature folders and routes

- `src/features/dynamic-type/`: dynamic type management. Routes: `/dashboard/management/dynamic-type`.
- `src/features/grit-meter/`: platform feature switches page. Routes: `/dashboard/management/system/features`.
- `src/features/url-shortener/`: the URL shortener. Routes: `/dashboard/url-shortener`, `/dashboard/url-shortener/[id]/analytics`.

## Page access

Decided today by the page-access layers in `src/lib/auth`, from every role a user holds: the route map that `src/proxy.ts` checks, `requireRole` on server pages, and `RoleGate` in components. The target rule is in [Page access](../08-auth-and-access.md#page-access).

## Backend endpoints called today

Endpoint groups from `src/api/endpoints.ts`, most used first:

- `endpoints.admin` (for example `/api/v1/dashboard/dynamic-management/roles/`)
- `endpoints.urlShortener` (for example `/api/v1/url-shortener/list/`)

## Imported from outside

- `grit-meter`: imported by no other feature; 1 import from outside reaches into its internals.
- `url-shortener`: imported by no other feature; 1 import from outside reaches into its internals.

## What changes

No dashboard issue in the first 12 weeks. Later work is in the epics ([github-issues/](../github-issues/README.md)).

## Tests this module needs

- Component tests for the URL shortener's create and analytics views.

## Open questions

None yet.
