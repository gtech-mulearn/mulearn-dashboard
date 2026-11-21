# ADR-016: Module docs follow the backend's module catalogue

Status: Accepted
Date: 2026-11-21
Implementation status at dev 6d6cb30b: decided for these docs.

## Context

The backend's architecture is organised by modules (`contributions`, `people`, `events` and so on), and its issues are labelled by module. The dashboard's code is organised by 48 feature folders.

## Options considered

- **One page per backend module, listing the dashboard features that belong to it, plus pages for shared layers.**
- **One page per feature folder.** 48 pages that don't line up with the backend's issues.

## Decision

- 17 module pages mirror backend modules that have dashboard features, and 6 pages cover shared code: the app shell, the API client, auth and access, the design system, the shared library, and the workspace features (home, onboarding, search, settings, tour).
- `payments` has no page: no dashboard feature calls it.

## Consequences

- A backend change to a module points to one dashboard page.

## Revisit when

- The dashboard gains a feature with no backend module.

## Related ADRs

- [ADR-001: One app with strict feature modules](ADR-001-one-app-strict-feature-modules.md)
