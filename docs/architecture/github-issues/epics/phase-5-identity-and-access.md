# Phase 5: page access from the backend's grants

| | |
|---|---|
| Epic | phase-5-identity-and-access |
| Phase / milestone | Phase 5: Identity and access |
| Labels | arch, phase:5, type:epic |

## What it will contain

Follows the backend's Phase 5 epic ([backend Phase 5](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/epics/phase-5-identity-and-access.md)):

- **Page access from grants.** Read the signed-in user's grants from the backend and decide page access from them instead of token roles, in every layer: the route map `src/proxy.ts` checks, `requireRole` and `requirePermission` on server pages, `RoleGate` and the `PERMISSIONS` map ([ADR-009](../../adr/ADR-009-page-access.md)). Keep the multi-role union rule and its tests.
- **Default deny on the backend.** Before the backend requires authentication by default, give it the list of anonymous calls (issue 0033), and fix any call that breaks in the backend's shadow reports.
- **Rate limits and Turnstile.** Show `Retry-After` waits on forms, and add the Turnstile widget to web sign-up and OTP when the backend asks for it. The Turnstile token is a new field the dashboard sends, so it goes behind a flag ([ADR-011](../../adr/ADR-011-flags-for-new-sends.md)).
- **Upload tickets** for the media worker, if the backend's key separation changes how uploads are authorised.

## Entry conditions

- A backend issue exposes the caller's grants (requested by the dashboard; see the backend needs in [06-backend-contract.md](../../06-backend-contract.md)).
- The security-hardening epic is closed.

## Exit criteria

- No page decision reads token roles: not the route map, `requireRole`, `requirePermission`, `RoleGate` or `PERMISSIONS`.
- Every anonymous call the dashboard makes is on the backend's public list.
- Sign-up and OTP work with the backend's rate limits and Turnstile.
