# Create the Sentry project and turn reporting on per environment

| | |
|---|---|
| ID | 0027 |
| Phase / milestone | Phase 2: Serving and runtime |
| Module | platform |
| Size | S |
| Labels | arch, phase:2, module:platform, type:chore, size:S, maintainer-only |
| Depends on | 0026, 0041 |
| Backend | none |
| Blocks | none |
| Repos | mulearn-dashboard |

## Why

The Sentry adapter (issue 0026) reports only when `NEXT_PUBLIC_SENTRY_DSN` is set at build time. Creating the project and setting the key per environment needs maintainer access ([ADR-014](../adr/ADR-014-observability.md)).

## Before you start

- Maintainer-only: it needs the Sentry organisation, the GitHub environments, and the production build settings.
- Issues 0026 and 0041 must be merged.

## What to do

1. Create a Sentry project for the dashboard, with separate environments for staging and production.
2. Set `NEXT_PUBLIC_SENTRY_DSN` as a variable in the `staging` GitHub environment (the staging workflow forwards it, issue 0026), and rebuild staging.
3. Throw a test error on staging, and check it arrives scrubbed.
4. Set alert rules for new error types, to the maintainers.
5. After one quiet week on staging, set it where production builds get their variables (issue 0041 records where), and rebuild production.

## Acceptance criteria

- [ ] A test error on staging arrives in Sentry, with no personal fields.
- [ ] Production reports errors after the staging week.
- [ ] Alerts reach the maintainers.

## How to test

Record the test error's event link and the alert rule on the issue.

## Out of scope

- Tracing and session replay.

## Notes for reviewers

Check sample rates and quotas before production.
