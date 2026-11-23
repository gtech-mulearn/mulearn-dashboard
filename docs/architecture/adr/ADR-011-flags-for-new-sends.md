# ADR-011: Per-environment build flags for anything newly sent

Status: Accepted
Date: 2026-11-21
Implementation status at dev 6d6cb30b: not started.

## Context

The backend rejects request fields its serializers don't declare, and a new request header fails the browser's CORS preflight unless the backend allows it. The dashboard promotes `dev` → `staging` → `master` on its own schedule, separately from the backend. So a dashboard change that sends something new can reach an environment before that environment's backend accepts it, and merging can't be the gate.

The backend's own feature switches live in its persisted flag store ([backend ADR-031](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/adr/ADR-031-feature-flags.md)). The dashboard's gate is different: it decides what a built client sends to the backend of one environment.

## Options considered

- **A build-time flag per change, per environment.**
- **A capabilities endpoint on the backend.** None exists in the backend plan.
- **Wait for the backend's production deploy before merging.** Pushes every such change out by weeks.

## Decision

- Each change that sends a new field or header is behind its own `NEXT_PUBLIC_FEATURE_<NAME>` flag, validated in `config/env.ts`, off by default.
- A maintainer-only rollout issue turns it on per environment, once that environment's backend accepts it.
- A later cleanup issue removes the flag.
- Reading new optional fields needs no flag.

## Consequences

- Build issues can merge as soon as the backend change is merged on its `dev`.
- A flag reaches the staging build only if `staging-deploy.yml` forwards it in its build step's `env:` block, so each flag is added there too. Where production's build reads its variables is recorded by issue 0041.

## Revisit when

- The backend offers a capabilities or version endpoint the dashboard can read at runtime.

## Related ADRs

- [ADR-006: One API client and one error model](ADR-006-one-api-client-and-error-model.md)
- [ADR-013: Build and deploy through GitHub Actions to Netlify](ADR-013-build-and-deploy.md)
