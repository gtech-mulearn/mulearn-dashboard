# Architecture decision records

Each record states one decision about the dashboard's architecture: its context, the options considered, the decision, its consequences and when to revisit it. They were last revised on 2026-11-21.

Dashboard records are numbered in this repository. A decision of the backend is cited as "backend ADR-NNN" and links to the backend repository's `docs/architecture/adr/` folder ([backend ADR index](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/adr/README.md)).

**Changing a decision.** An accepted record is never edited. To change a decision, add a new record that supersedes it, and set the old one's status to "Superseded by ADR-NNN". The process is in [16-contributing-to-the-architecture.md](../16-contributing-to-the-architecture.md).

| ADR | Title | Status |
|---|---|---|
| [ADR-001](ADR-001-one-app-strict-feature-modules.md) | One app with strict feature modules | Accepted |
| [ADR-002](ADR-002-feature-anatomy-and-public-surface.md) | Feature anatomy and `index.ts` as the only public surface | Accepted |
| [ADR-003](ADR-003-import-ratchets.md) | Deep-import and cycle ratchets in CI | Accepted |
| [ADR-004](ADR-004-server-state-and-ui-state.md) | Server state in TanStack Query, UI state in Zustand | Accepted |
| [ADR-005](ADR-005-parse-at-the-boundary.md) | Parse every response with zod; generated types later | Accepted |
| [ADR-006](ADR-006-one-api-client-and-error-model.md) | One API client and one error model | Accepted |
| [ADR-007](ADR-007-browser-calls-backend-directly.md) | The browser calls the backend directly | Accepted |
| [ADR-008](ADR-008-token-storage.md) | Token storage | Accepted |
| [ADR-009](ADR-009-page-access.md) | Page access: token roles now, the backend's grants later | Accepted |
| [ADR-010](ADR-010-single-flight-refresh.md) | One token refresh at a time, across tabs | Accepted |
| [ADR-011](ADR-011-flags-for-new-sends.md) | Per-environment build flags for anything newly sent | Accepted |
| [ADR-012](ADR-012-tests-in-ci-with-a-baseline.md) | Tests in CI behind a failure baseline | Accepted |
| [ADR-013](ADR-013-build-and-deploy.md) | Build and deploy through GitHub Actions to Netlify | Accepted |
| [ADR-014](ADR-014-observability.md) | Browser errors with request ids | Accepted |
| [ADR-015](ADR-015-design-system-building-block.md) | The design system is a building block | Accepted |
| [ADR-016](ADR-016-module-docs-follow-backend-catalogue.md) | Module docs follow the backend's module catalogue | Accepted |
