# auth-and-access

Describes `dev` at 6d6cb30b (17 Nov 2026), and what changes.

## Purpose

Signing in and out, keeping the session, and deciding which pages to show. Includes the sign-in and sign-up screens.

## Backend module

The authserver, for sign-in and tokens; [identity_access](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/modules/identity_access.md) for roles and grants.

## Feature folders and routes

- Code: `src/lib/auth/`, `src/proxy.ts`, `src/app/api/auth/`, `src/hooks/useAuth.ts`, `src/hooks/use-permissions.ts`, `src/hooks/use-filtered-nav.ts`, and the `auth` feature folder.
- `src/features/auth/`: sign-in and sign-up screens; the shared auth layer lives with them. Routes: used inside other pages.

## Page access

This module holds page access: see [Page access](../08-auth-and-access.md#page-access).

## Backend endpoints called today

Endpoint groups from `src/api/endpoints.ts`, most used first:

- `endpoints.auth` (for example `/api/v1/auth/user-authentication/`)
- `endpoints.password`
- `endpoints.company` (for example `/api/v1/dashboard/company/register/`)
- `endpoints.register` (for example `/api/v1/register/`)
- `endpoints.user` (for example `/api/v1/dashboard/user/info/`)

## Imported from outside

- Shared layer: imported throughout the app. It must never import a feature ([Import rules](../04-module-rules.md#import-rules), rule 4).
- `auth`: imported by 13 other features (`company-jobs`, `company-profile`, `connect`, `events`, `home`, `intern`, `learning-circle`, `mujourney`, `onboarding`, `problem-statements`, `profile`, `settings`, `tour`); 17 imports from outside reach into its internals.

## What changes

- [0011](../github-issues/0011-auth-public-surface.md) Route imports of auth through its index
- [0021](../github-issues/0021-multi-role-union-tests.md) Test that page access is the union of every role a user holds
- [0023](../github-issues/0023-single-flight-refresh.md) Make token refresh single-flight across tabs
- [0024](../github-issues/0024-one-token-cookie-helper.md) Set every token cookie through one helper
- [0042](../github-issues/0042-auth-503-keeps-session.md) Keep the session through temporary 503s from the auth routes
- Backend changes that touch it: backend 0038, backend `epic:phase-5-identity-and-access`, backend `epic:phase-7-people-and-privacy`, backend `epic:later-on-demand` ([the change tracker](../06-backend-contract.md#the-change-tracker)).

## Tests this module needs

- The multi-role union rule, in the proxy, `requireRole` and `RoleGate` (issue 0021).
- Single-flight refresh across tabs (issue 0023).
- One helper for every token cookie (issue 0024).
- A temporary 503 from the auth routes never signs anyone out, on the client or the server (issue 0042).

## Open questions

- Page access from grants waits for a backend endpoint that returns them (the Phase 5 epic).
