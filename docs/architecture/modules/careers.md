# careers

Describes `dev` at 6d6cb30b (17 Nov 2026), and what changes.

## Purpose

Companies: their profile, jobs, tasks, collaborations, career-lab content and company management.

## Backend module

[careers](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/modules/careers.md): companies, jobs and applications.

## Feature folders and routes

- `src/features/career-labs/`: career-lab hiring content. Routes: `/dashboard/management/homepage/career-labs`.
- `src/features/company-jobs/`: company jobs and collaborations. Routes: `/dashboard/collaborations/incoming`, `/dashboard/company`, `/dashboard/company/admin`, `/dashboard/company/collaborations`, `/dashboard/company/event-templates`, `/dashboard/company/feedback`, `/dashboard/company/ig-sponsorship`, `/dashboard/talent-pool`.
- `src/features/company-profile/`: company profile. Routes: used inside other pages.
- `src/features/company-tasks/`: tasks a company posts; calls the task endpoints. Routes: `/dashboard/company/tasks`.
- `src/features/manage-companies/`: company management. Routes: used inside other pages.

## Page access

Decided today by the page-access layers in `src/lib/auth`, from every role a user holds: the route map that `src/proxy.ts` checks, `requireRole` on server pages, and `RoleGate` in components. The target rule is in [Page access](../08-auth-and-access.md#page-access).

## Backend endpoints called today

Endpoint groups from `src/api/endpoints.ts`, most used first:

- `endpoints.company` (for example `/api/v1/dashboard/company/tasks/`)
- `endpoints.careerLab` (for example `/api/v1/dashboard/career-lab/hiring/`)
- `endpoints.admin` (for example `/api/v1/dashboard/task/`)
- `endpoints.adminTask` (for example `/api/v1/dashboard/task/level/`)
- `endpoints.campusManage` (for example `/api/v1/dashboard/campus/campus-details/`)

## Imported from outside

- `company-jobs`: imported by 8 other features (`company-mentors`, `company-profile`, `company-tasks`, `events`, `home`, `manage-companies`, `mentor`, `tour`); 53 imports from outside reach into its internals.
- `company-tasks`: imported by no other feature; 1 import from outside reaches into its internals.

## What changes

- [0009](../github-issues/0009-company-jobs-public-surface.md) Route imports of company-jobs through its index

## Tests this module needs

- A check that no code outside `company-jobs` imports its internals (issue 0009).
- Contract tests for the job responses.

## Open questions

- Whether `company-tasks` should move under learning once task ownership is settled on the backend.
