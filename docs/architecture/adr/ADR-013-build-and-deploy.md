# ADR-013: Build and deploy through GitHub Actions to Netlify

Status: Accepted
Date: 2026-11-21
Implementation status at dev 6d6cb30b: partly documented: `docs/DEPLOYMENT.md` describes staging and production on Netlify; at the pin only `staging-deploy.yml` deploys (to staging). How production and `dev` are deployed is to verify.

## Context

Staging builds run on the GitHub Actions runner (`staging-deploy.yml`), which passes the build only the `NEXT_PUBLIC_*` variables listed in its build step. Production may build on Netlify's own builders, since `scripts/netlify-ignore.sh` lets `master` through; which path it uses is to verify (issue 0041). Build-time variables (every `NEXT_PUBLIC_*`, and `config/env.ts` validation) come from the build's environment; runtime variables (for example `BACKEND_URL`) come from the Netlify site. Releases are versioned with changesets (`release.yml` on `master`).

## Options considered

- **Keep Netlify through Actions, and document what runs where.**
- **Move hosting.** No reason to.

## Decision

- Keep the pipeline.
- Document every variable with where it's set and when it's read.
- Add the release check from [ADR-011](ADR-011-flags-for-new-sends.md): no flag is on in an environment before that environment's backend supports it.

## Consequences

- Flags are build-time variables, so turning one on means a rebuild of that environment.

## Revisit when

- Runtime configuration becomes necessary (for example, flags that change without a rebuild).

## Related ADRs

- [ADR-011: Per-environment build flags for anything newly sent](ADR-011-flags-for-new-sends.md)
