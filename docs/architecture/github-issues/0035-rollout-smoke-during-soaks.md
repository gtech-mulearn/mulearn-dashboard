# Run the smoke suite on staging during the backend's upgrade soaks

| | |
|---|---|
| ID | 0035 |
| Phase / milestone | Phase 2: Serving and runtime |
| Module | platform |
| Size | S |
| Labels | arch, phase:2, module:platform, type:chore, size:S, needs-backend, maintainer-only |
| Depends on | 0034 |
| Backend | 0040, 0042 |
| Blocks | none |
| Repos | mulearn-dashboard |

## Why

The backend's DRF 3.17 and Django 5.2 upgrades go through staging soaks before production ([backend 0040](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/0040-drf-3-17.md), [backend 0042](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/github-issues/0042-django-5-2.md)). Running the dashboard's smoke suite on staging during each soak catches anything the backend's own tests miss.

## Before you start

- Maintainer-only: it needs the staging smoke credentials.
- Issue 0034 must be merged.
- Backend issues 0040 and 0042 must be deployed to the environment this issue names.

## What to do

1. When backend 0040 is deployed to staging, run `bun run smoke` against staging, with the smoke credentials set locally.
2. Post the result on backend 0040, and on this issue.
3. Do the same when backend 0042 is deployed to staging, at the start and at the end of its two-week soak.

## Acceptance criteria

- [ ] A smoke result is recorded for each soak.
- [ ] Any failure is reported on the backend issue before its production release.

## How to test

Paste the run summaries on the issue.

## Out of scope

- Production runs.

## Notes for reviewers

Use the staging smoke account only.
