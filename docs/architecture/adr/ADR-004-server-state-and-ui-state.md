# ADR-004: Server state in TanStack Query, UI state in Zustand

Status: Accepted
Date: 2026-11-21
Implementation status at dev 6d6cb30b: mostly in place: 139 files use TanStack Query hooks, and 37 query-key factory files exist (`hooks/query-keys.ts`); 92 inline key arrays remain in 26 files, 40 of them in invalidations, and 12 features have no factory. Zustand holds two small UI stores.

## Context

Data from the backend is cached and refreshed by TanStack Query. Most features already keep their keys in a factory, for example `eventKeys` in `src/features/events/hooks/query-keys.ts`. But 92 inline key arrays remain, 40 of them in invalidations, which a factory change can miss. Zustand holds UI-only state (`src/stores/ui-store.ts`, `company-banner-store.ts`).

## Options considered

- **TanStack Query for server state with a per-feature key factory; Zustand for UI state only.**
- **Move server data into Zustand.** Duplicates caching and refetch logic TanStack Query already provides.

## Decision

- Server state lives only in TanStack Query.
- Each feature keeps its query keys in one factory in `hooks/query-keys.ts`, the file most features already use (factory names vary today, for example `eventKeys` and `locationQueryKeys`; new ones are named `<name>Keys`). Queries and invalidations use it, never inline arrays.
- A CI check stops new inline keys, against a shrink-only list of today's.
- Zustand stores hold UI state only (open panels, banners, preferences), never copies of server data.

## Consequences

- Invalidation is predictable, and a backend change to one resource has one place to update.

## Revisit when

- Server components take over most data loading.

## Related ADRs

- [ADR-002: Feature anatomy and `index.ts` as the only public surface](ADR-002-feature-anatomy-and-public-surface.md)
- [ADR-005: Parse every response with zod; generated types later](ADR-005-parse-at-the-boundary.md)
