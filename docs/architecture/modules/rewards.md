# rewards

Describes `dev` at 6d6cb30b (17 Nov 2026), and what changes.

## Purpose

Karma vouchers.

## Backend module

[rewards](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/modules/rewards.md): vouchers, coupons and referrals. μCoin isn't part of the dashboard for now.

## Feature folders and routes

- `src/features/karma-voucher/`: karma vouchers. Routes: `/dashboard/management/karma-voucher`.

## Page access

Decided today by the page-access layers in `src/lib/auth`, from every role a user holds: the route map that `src/proxy.ts` checks, `requireRole` on server pages, and `RoleGate` in components. The target rule is in [Page access](../08-auth-and-access.md#page-access).

## Backend endpoints called today

Endpoint groups from `src/api/endpoints.ts`, most used first:

- `endpoints.admin` (for example `/api/v1/dashboard/karma-voucher/`)

## Imported from outside

Nothing outside the module imports it.

## What changes

- Backend changes that touch it: backend `epic:phase-8-api-standards-and-rewards` ([the change tracker](../06-backend-contract.md#the-change-tracker)).

## Tests this module needs

- Component tests for voucher issuing, including field errors.

## Open questions

None yet.
