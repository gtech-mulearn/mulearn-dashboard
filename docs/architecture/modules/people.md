# people

Describes `dev` at 6d6cb30b (17 Nov 2026), and what changes.

## Purpose

Profiles and user management.

## Backend module

[people](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/modules/people.md): profiles, settings, socials and consent.

## Feature folders and routes

- `src/features/manage-users/`: user management. Routes: `/dashboard/management/manage-users`.
- `src/features/profile/`: profiles. Routes: used inside other pages.

## Page access

Decided today by the page-access layers in `src/lib/auth`, from every role a user holds: the route map that `src/proxy.ts` checks, `requireRole` on server pages, and `RoleGate` in components. The target rule is in [Page access](../08-auth-and-access.md#page-access).

## Backend endpoints called today

Endpoint groups from `src/api/endpoints.ts`, most used first:

- `endpoints.user` (for example `/api/v1/dashboard/profile/cover-pic/`)
- `endpoints.manageUsers` (for example `/api/v1/dashboard/roles/user-role/`)
- `endpoints.location` (for example `/api/v1/register/country/list/`)
- `endpoints.achievements`
- `endpoints.qseverse`
- `endpoints.onboarding` (for example `/api/v1/register/community/list/`)
- `endpoints.college` (for example `/api/v1/dashboard/college/change-college/`)
- `endpoints.dashboard` (for example `/api/v1/dashboard/ig/list/`)
- `endpoints.utils`

## Imported from outside

- `manage-users`: imported by 1 other feature (`profile`); 2 imports from outside reach into its internals.
- `profile`: imported by 7 other features (`auth`, `company-jobs`, `learning-circle`, `mentor`, `mujourney`, `projects`, `settings`); 8 imports from outside reach into its internals.

## What changes

- [0012](../github-issues/0012-profile-public-surface.md) Route imports of profile through its index
- Backend changes that touch it: backend `epic:phase-7-people-and-privacy` ([the change tracker](../06-backend-contract.md#the-change-tracker)).

## Tests this module needs

- Contract tests for the profile responses.
- Component tests for profile editing, including field errors from the backend.

## Open questions

- Consent and rights screens arrive with the backend's Phase 7 (legal review pending).
