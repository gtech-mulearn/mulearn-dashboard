# workspace

Describes `dev` at 6d6cb30b (17 Nov 2026), and what changes.

## Purpose

Features that span several backend modules: the dashboard home, onboarding, search, settings and the product tour.

## Backend module

Several: these features call profile, campus, search and other endpoints.

## Feature folders and routes

- `src/features/home/`: the dashboard home. Routes: `/dashboard`.
- `src/features/onboarding/`: first-run onboarding. Routes: used inside other pages.
- `src/features/search/`: people, campus and mentor search. Routes: `/dashboard/search/campuses`, `/dashboard/search/mentors`, `/dashboard/search/students`.
- `src/features/settings/`: account settings. Routes: used inside other pages.
- `src/features/tour/`: the product tour. Routes: `/`.

## Page access

Decided today by the page-access layers in `src/lib/auth`, from every role a user holds: the route map that `src/proxy.ts` checks, `requireRole` on server pages, and `RoleGate` in components. The target rule is in [Page access](../08-auth-and-access.md#page-access).

## Backend endpoints called today

Endpoint groups from `src/api/endpoints.ts`, most used first:

- `endpoints.onboarding` (for example `/api/v1/register/department/list/`)
- `endpoints.mentor` (for example `/api/v1/dashboard/mentor/overview/`)
- `endpoints.campusDashboard` (for example `/api/v1/dashboard/campus/home-summary/`)
- `endpoints.search`
- `endpoints.location` (for example `/api/v1/register/country/list/`)
- `endpoints.calendar` (for example `/api/v1/dashboard/calendar/events/`)
- `endpoints.dashboard` (for example `/api/v1/dashboard/ig/list/`)
- `endpoints.learner` (for example `/api/v1/dashboard/home/learner/summary/`)
- `endpoints.company` (for example `/api/v1/dashboard/company/home-summary/`)
- `endpoints.public` (for example `/api/v1/public/jobs/`)
- `endpoints.password` (for example `/api/v1/dashboard/profile/change-password/`)

## Imported from outside

- `home`: imported by 1 other feature (`mentor`); 7 imports from outside reach into its internals.
- `onboarding`: imported by 4 other features (`auth`, `company-jobs`, `manage-roles`, `mentor`); 3 imports from outside reach into its internals.
- `search`: imported by 3 other features (`interest-groups`, `manage-ig`, `manage-roles`); 2 imports from outside reach into its internals.
- `tour`: imported by no other feature; 1 import from outside reaches into its internals.

## What changes

- [0013](../github-issues/0013-home-public-surface.md) Route imports of home through its index

## Tests this module needs

- A check that no code outside `home` imports its internals (issue 0013).
- Component tests for onboarding's college selection.

## Open questions

None yet.
