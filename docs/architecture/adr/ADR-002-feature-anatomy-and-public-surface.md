# ADR-002: Feature anatomy and `index.ts` as the only public surface

Status: Accepted
Date: 2026-11-21
Implementation status at dev 6d6cb30b: partly in place: 45 of 48 feature folders have an `index.ts`; 156 imports from outside a feature reach past it.

## Context

Most features already follow one layout: `api/` (endpoint calls and their zod schemas), `hooks/` (TanStack Query hooks), `components/`, plus `schemas/`, `types/` and `utils/`. Three folders have no `index.ts` (`college-levels`, `company-mentors`, `push`). Code outside a feature imports its internals 156 times, 9 of them relative imports into `intern`; `company-jobs` (53) and `mentor` (27) are reached into most.

## Options considered

- **An `index.ts` per feature, and nothing else imported from outside.**
- **No rule; rely on review.** That is today's state, and the coupling grew under it.
- **Package-per-feature (a monorepo).** Strong boundaries, but a large build and tooling change for one app.

## Decision

- Every feature has `api/`, `hooks/` and `components/` as needed, and an `index.ts` that exports what other code may use.
- Code outside a feature imports only `@/features/<name>`, never `@/features/<name>/<anything>`.
- Code that several features need moves down to a shared layer, or behind the owning feature's `index.ts`.

## Consequences

- Moving a feature's internals no longer breaks other features.
- A feature used by many others (`auth` is imported by 13) exposes a deliberate, reviewed surface.

## Revisit when

- A feature's `index.ts` grows to re-export most of its internals: split the feature.

## Related ADRs

- [ADR-001: One app with strict feature modules](ADR-001-one-app-strict-feature-modules.md)
- [ADR-003: Deep-import and cycle ratchets in CI](ADR-003-import-ratchets.md)
