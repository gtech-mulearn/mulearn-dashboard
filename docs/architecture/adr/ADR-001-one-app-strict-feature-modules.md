# ADR-001: One app with strict feature modules

Status: Accepted
Date: 2026-11-21
Implementation status at dev 6d6cb30b: partly in place: the app is one Next.js project with 48 feature folders, but nothing enforces their boundaries.

## Context

The dashboard is one Next.js app (App Router) with three route groups and 48 feature folders under `src/features/`. Most of it runs in the browser: 622 files start with `"use client"`, and the browser calls the Django backend directly. Feature folders import each other's internals freely, which makes changes ripple and blocks the backend's plan from mapping cleanly onto the dashboard.

The backend has chosen a modular monolith with strict layers ([backend ADR-001](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/adr/ADR-001-domain-oriented-modular-monolith.md)). The dashboard needs a target shape that contributors can work towards one pull request at a time.

## Options considered

- **One app with strict feature modules.** Keep the app and the direct browser calls; make each feature's `index.ts` its only public surface, enforce import rules in CI, and give every backend contract change one client-side home.
- **Bring back a server-side proxy.** Next.js calls Django for the user, and tokens move to cookies that scripts can't read. Safer token handling and server-side checks, but it reverses the decision in [ADR-007](ADR-007-browser-calls-backend-directly.md), adds a hop and function cost to every call, and touches every feature's data code.
- **Micro-frontends,** for example separate learner and admin apps. Dropped: it adds deployment and shared-state complexity that one team's app doesn't need.

## Decision

One app with strict feature modules:
- routes in `src/app/` compose features;
- features in `src/features/<name>/` expose only `index.ts`;
- shared layers (`src/api`, `src/lib`, `src/components`, `src/stores`) never import features;
- each rule has an automated check ([ADR-003](ADR-003-import-ratchets.md)).

## Consequences

- Work happens feature by feature; no big-bang refactor.
- Token storage stays as it is for now, recorded in [ADR-008](ADR-008-token-storage.md).
- Every backend change the dashboard must follow lands in one place: the API client or the feature that calls the changed endpoint.

## Revisit when

- A second kind of client needs server-side data access, or data must be hidden from the browser.
- The token-storage trigger in [ADR-008](ADR-008-token-storage.md) fires.

## Related ADRs

- [ADR-002: Feature anatomy and `index.ts` as the only public surface](ADR-002-feature-anatomy-and-public-surface.md)
- [ADR-003: Deep-import and cycle ratchets in CI](ADR-003-import-ratchets.md)
- [ADR-007: The browser calls the backend directly](ADR-007-browser-calls-backend-directly.md)
- [ADR-008: Token storage](ADR-008-token-storage.md)
