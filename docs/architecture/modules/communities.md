# communities

Describes `dev` at 6d6cb30b (17 Nov 2026), and what changes.

## Purpose

Interest groups, interest-group requests and editing, learning circles and channels.

## Backend module

[communities](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/modules/communities.md): interest groups, learning circles and channels.

## Feature folders and routes

- `src/features/channels/`: community channels. Routes: `/dashboard/management/channels`.
- `src/features/ig-requests/`: interest-group requests. Routes: `/dashboard/company/ig-requests`.
- `src/features/interest-groups/`: interest groups. Routes: `/dashboard/interest-groups`, `/dashboard/interest-groups/[id]`.
- `src/features/learning-circle/`: learning circles. Routes: `/dashboard/learning-circle`, `/dashboard/learning-circle/[id]`, `/dashboard/learning-circle/[id]/meeting/[meet_id]`, `/dashboard/learning-circle/invite/[link_id]`, `/dashboard/learning-circle/invites`.
- `src/features/manage-ig/`: interest-group editing. Routes: `/dashboard/edit-ig`, `/dashboard/edit-ig/[id]`.

## Page access

Decided today by the page-access layers in `src/lib/auth`, from every role a user holds: the route map that `src/proxy.ts` checks, `requireRole` on server pages, and `RoleGate` in components. The target rule is in [Page access](../08-auth-and-access.md#page-access).

## Backend endpoints called today

Endpoint groups from `src/api/endpoints.ts`, most used first:

- `endpoints.learningCircle` (for example `/api/v1/dashboard/learningcircle/join/`)
- `endpoints.admin` (for example `/api/v1/dashboard/ig/`)
- `endpoints.communityPartner` (for example `/api/v1/dashboard/community-partner/`)
- `endpoints.interestGroups` (for example `/api/v1/dashboard/ig/request/`)
- `endpoints.impactProjects` (for example `/api/v1/dashboard/ig/`)
- `endpoints.channels` (for example `/api/v1/dashboard/channels/`)
- `endpoints.college` (for example `/api/v1/dashboard/college/`)
- `endpoints.public` (for example `/api/v1/public/ig/`)

## Imported from outside

- `channels`: imported by no other feature; 1 import from outside reaches into its internals.
- `interest-groups`: imported by 6 other features (`achievements`, `campus-manage`, `company-jobs`, `manage-ig`, `manage-roles`, `weekly-twitches`); 5 imports from outside reach into its internals.
- `learning-circle`: imported by 1 other feature (`home`); 1 import from outside reaches into its internals.

## What changes

- [0014](../github-issues/0014-interest-groups-public-surface.md) Route imports of interest-groups through its index
- [0037](../github-issues/0037-query-keys-manage-ig.md) Replace the inline query keys in manage-ig
- [0039](../github-issues/0039-learning-circle-endpoints-in-feature.md) Move the learning-circle endpoints into the learning-circle feature

## Tests this module needs

- Inline query keys replaced in `manage-ig` (issue 0037).
- Contract tests for the interest-group and learning-circle responses.

## Open questions

None yet.
