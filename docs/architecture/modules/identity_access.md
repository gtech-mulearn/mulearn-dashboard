# identity_access

Describes `dev` at 6d6cb30b (17 Nov 2026), and what changes.

## Purpose

Role management and the role-verification queues.

## Backend module

[identity_access](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/modules/identity_access.md): roles and scoped grants.

## Feature folders and routes

- `src/features/manage-roles/`: role management. Routes: `/dashboard/management/manage-roles`.
- `src/features/role-verification/`: role verification queues. Routes: `/dashboard/management/manage-companies`, `/dashboard/management/mentor-verification`, `/dashboard/management/organizations`, `/dashboard/management/organizations/verify`, `/dashboard/management/user-management`.

## Page access

Decided today by the page-access layers in `src/lib/auth`, from every role a user holds: the route map that `src/proxy.ts` checks, `requireRole` on server pages, and `RoleGate` in components. The target rule is in [Page access](../08-auth-and-access.md#page-access).

## Backend endpoints called today

Endpoint groups from `src/api/endpoints.ts`, most used first:

- `endpoints.manageRoles` (for example `/api/v1/dashboard/roles/bulk-assign/`)
- `endpoints.admin` (for example `/api/v1/dashboard/user/verification/`)

## Imported from outside

- `manage-roles`: imported by no other feature; 1 import from outside reaches into its internals.

## What changes

No dashboard issue in the first 12 weeks. Later work is in the epics ([github-issues/](../github-issues/README.md)).

## Tests this module needs

- Access tests for every verification queue, with users holding several roles.
- Component tests for approve and reject, including a refusal from the backend.

## Open questions

- Which screens change when the backend moves from roles to scoped grants (its Phase 5).
