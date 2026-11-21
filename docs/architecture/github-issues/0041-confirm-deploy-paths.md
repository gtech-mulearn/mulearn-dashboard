# Confirm and document how dev and production deploy

| | |
|---|---|
| ID | 0041 |
| Phase / milestone | Phase 0: Stabilise and secure |
| Module | platform |
| Size | S |
| Labels | arch, phase:0, module:platform, type:docs, size:S, maintainer-only |
| Depends on | none |
| Backend | none |
| Blocks | 0027 |
| Repos | mulearn-dashboard |

## Why

The docs record two things as "to verify": how `dev` is deployed, and which path production uses. Netlify can build `master` itself (`scripts/netlify-ignore.sh`), while `docs/DEPLOYMENT.md` describes Actions-driven deploys, and no workflow deploys production. Contributors and later issues (error reporting, feature flags) need to know where build-time variables come from in each environment ([10-build-and-deployment.md](../10-build-and-deployment.md#to-verify)).

## Before you start

- Maintainer-only: it needs access to Netlify, the GitHub environments, and wherever `dev` is hosted.

## What to do

1. Confirm where `dev` is deployed and how (the service, the trigger, and where its variables are set).
2. Confirm how production is built and deployed today: Netlify's own build of `master`, a workflow kept outside the repository, or something else.
3. List which GitHub environments, secrets and variables exist, against those `docs/DEPLOYMENT.md` expects.
4. Update `docs/DEPLOYMENT.md` and the "To verify" section of `docs/architecture/10-build-and-deployment.md` with the answers, and say for each environment where a new `NEXT_PUBLIC_*` variable must be set.

## Acceptance criteria

- [ ] Page 10 has no "to verify" items left, or each remaining one has a named owner.
- [ ] For each environment, the place a new build-time variable is set is written down.

## How to test

Review the updated pages in the pull request; no commands.

## Out of scope

- Changing any deploy pipeline.

## Notes for reviewers

Don't publish secrets, hostnames of internal tools, or anything not already visible in the repository.
