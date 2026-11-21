# notifications

Describes `dev` at 6d6cb30b (17 Nov 2026), and what changes.

## Purpose

In-app notifications, the notifications admin page and push configuration.

## Backend module

[notifications](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/modules/notifications.md): in-app, push and email delivery.

## Feature folders and routes

- `src/features/notification/`: in-app notifications and the admin page. Routes: `/dashboard/management/notifications`.
- `src/features/push/`: push configuration. Routes: `/dashboard/management/notifications`.

## Page access

Decided today by the page-access layers in `src/lib/auth`, from every role a user holds: the route map that `src/proxy.ts` checks, `requireRole` on server pages, and `RoleGate` in components. The target rule is in [Page access](../08-auth-and-access.md#page-access).

## Backend endpoints called today

Endpoint groups from `src/api/endpoints.ts`, most used first:

- `endpoints.notifications` (for example `/api/v1/notification/broadcast/list/all/`)
- `endpoints.push` (for example `/api/v1/push/admin/config/`)
- `endpoints.onboarding` (for example `/api/v1/register/colleges/`)
- `endpoints.interestGroups` (for example `/api/v1/dashboard/ig/list/`)
- `endpoints.campusManage` (for example `/api/v1/dashboard/campus/ig-chapters/`)
- `endpoints.events` (for example `/api/v1/dashboard/events/admin/`)

## Imported from outside

- `notification`: imported by no other feature; 1 import from outside reaches into its internals.
- `push`: imported by no other feature; 1 import from outside reaches into its internals.

## What changes

- [0008](../github-issues/0008-index-push.md) Give push an index.ts
- Backend changes that touch it: backend `epic:phase-6-gamification-and-notifications` ([the change tracker](../06-backend-contract.md#the-change-tracker)).

## Tests this module needs

- A check that `push` is imported only through its new `index.ts` (issue 0008).
- Contract tests for the notification list.

## Open questions

- What changes when the backend's notification pipeline lands (its Phase 6).
