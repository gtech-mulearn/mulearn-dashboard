# Release the time-limit handling to staging and production before the backend's nginx move

| | |
|---|---|
| ID | 0044 |
| Phase / milestone | Phase 2: Serving and runtime |
| Module | platform |
| Size | S |
| Labels | arch, phase:2, module:platform, type:chore, size:S, maintainer-only |
| Depends on | 0022, 0042, 0043 |
| Backend | none |
| Blocks | none |
| Repos | mulearn-dashboard |

## Why

Issues 0022, 0042 and 0043 make the dashboard handle the backend's new limits. They only help if they are live before those limits reach each environment: staging when [backend 0045](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/0045-rollout-digest-deploys.md) is deployed there (week 7), and production at [backend 0047](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/0047-rollout-gunicorn-cutover.md)'s cutover. Otherwise users meet timeouts, sign-outs and failed uploads the dashboard can't explain ([06-backend-contract.md](../06-backend-contract.md#limits-that-are-coming)).

## Before you start

- Maintainer-only: it needs release rights for staging and production.
- Issues 0022, 0042 and 0043 must be merged.
- Backend 0045 (staging) and backend 0047 (production) set the deadlines.

## What to do

1. Release the dashboard to staging with issues 0022, 0042 and 0043, before backend 0045 is deployed to staging. Comment the release on backend 0045.
2. Once backend 0045 is on staging, check sign-in, a refresh, a long download and an upload there. If issue 0034 has landed, run the smoke suite too.
3. Release to production before backend 0047's cutover, through the production path issue 0041 records. Comment the release on backend 0047.
4. If either backend date moves earlier than the dashboard release, say so on that backend issue before it deploys.

## Acceptance criteria

- [ ] The staging release is live before backend 0045 is deployed to staging.
- [ ] The production release is live before backend 0047's cutover.
- [ ] Both releases are linked on the backend issues.

## How to test

Record each release, and the staging checks, on this issue.

## Out of scope

- Changing the backend's schedule.

## Notes for reviewers

Coordinate on the backend's rollout issues, which own the dates.
