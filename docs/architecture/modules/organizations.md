# organizations

Describes `dev` at 6d6cb30b (17 Nov 2026), and what changes.

## Purpose

Campuses, colleges, organisations, departments, affiliations and the geography screens (countries, states, zones, districts).

## Backend module

[organizations](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/modules/organizations.md): organisations, colleges, geography and chapters.

## Feature folders and routes

- `src/features/campus/`: campus (college) pages. Routes: `/dashboard/campus/[id]`.
- `src/features/campus-manage/`: campus management. Routes: used inside other pages.
- `src/features/college-levels/`: college level management. Routes: `/dashboard/management/college-levels`.
- `src/features/district/`: district dashboards (geography). Routes: used inside other pages.
- `src/features/manage-locations/`: countries, states, zones, districts. Routes: `/dashboard/management/manage-locations`.
- `src/features/organizations/`: organisations, departments, affiliations. Routes: `/dashboard/management/organizations/affiliation`, `/dashboard/management/organizations/departments`, `/dashboard/management/organizations/list`, `/dashboard/management/organizations/transfer`.
- `src/features/zonal/`: zonal dashboards (geography). Routes: used inside other pages.

## Page access

Decided today by the page-access layers in `src/lib/auth`, from every role a user holds: the route map that `src/proxy.ts` checks, `requireRole` on server pages, and `RoleGate` in components. The target rule is in [Page access](../08-auth-and-access.md#page-access).

## Backend endpoints called today

Endpoint groups from `src/api/endpoints.ts`, most used first:

- `endpoints.campusManage` (for example `/api/v1/dashboard/campus/execom/search/`)
- `endpoints.organization`
- `endpoints.district` (for example `/api/v1/dashboard/district/district-details/`)
- `endpoints.zonal` (for example `/api/v1/dashboard/zonal/zonal-details/`)
- `endpoints.countries` (for example `/api/v1/dashboard/location/countries/list/`)
- `endpoints.states` (for example `/api/v1/dashboard/location/states/list/`)
- `endpoints.organizations`
- `endpoints.campus` (for example `/api/v1/dashboard/campus/sessions/list/`)
- `endpoints.zones` (for example `/api/v1/dashboard/location/zones/`)
- `endpoints.districts` (for example `/api/v1/dashboard/location/districts/`)
- `endpoints.affiliation` (for example `/api/v1/dashboard/affiliation/`)
- `endpoints.user` (for example `/api/v1/dashboard/profile/user-profile/`)
- `endpoints.interestGroups` (for example `/api/v1/dashboard/ig/list/`)
- `endpoints.collegeLevels` (for example `/api/v1/dashboard/college/`)
- `endpoints.search`
- `endpoints.location` (for example `/api/v1/register/district/list/`)

## Imported from outside

- `campus`: imported by 2 other features (`campus-manage`, `home`); 2 imports from outside reach into its internals.
- `campus-manage`: imported by 1 other feature (`home`); 2 imports from outside reach into its internals.
- `college-levels`: imported by no other feature; 1 import from outside reaches into its internals.
- `manage-locations`: imported by 1 other feature (`search`); 1 import from outside reaches into its internals.
- `organizations`: imported by 2 other features (`search`, `weekly-twitches`); 1 import from outside reaches into its internals.

## What changes

- [0006](../github-issues/0006-index-college-levels.md) Give college-levels an index.ts
- [0031](../github-issues/0031-page-organisation-lists.md) Page the organisation lists at 100 rows
- [0036](../github-issues/0036-query-keys-manage-locations.md) Replace the inline query keys in manage-locations

## Tests this module needs

- Paging tests for the organisation lists at 100 rows (issue 0031).
- Inline query keys replaced in `manage-locations` (issue 0036).
- Contract tests for the campus and organisation responses.

## Open questions

None yet.
