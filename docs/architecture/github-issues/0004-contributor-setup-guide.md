# Write the contributor setup guide

| | |
|---|---|
| ID | 0004 |
| Phase / milestone | Phase 0: Stabilise and secure |
| Module | platform |
| Size | S |
| Labels | arch, phase:0, module:platform, type:docs, size:S, good first issue |
| Depends on | none |
| Backend | none |
| Blocks | none |
| Repos | mulearn-dashboard |

## Why

`CONTRIBUTING.md` explains branches, commits and changesets, and its getting-started section covers installing and running the app. It doesn't cover what a newcomer needs before their first pull request: the versions, the environment file, how to run the tests and checks, or the Windows notes ([the issues README](README.md#setting-up-a-fresh-clone)).

## Before you start

- Read `CONTRIBUTING.md`, `README.md`, `.env.example` and `config/env.ts`.
- Read the `[build.environment]` block in `netlify.toml` for the Node and Bun versions the builds use.

## What to do

1. Add a "Development setup" section to `CONTRIBUTING.md`, after "Getting Started". It covers:
   - Node 22 or later and Bun 1.3, as `netlify.toml` uses;
   - `bun install`;
   - copying `.env.example` to `.env.local`, with one line per variable in `config/env.ts` saying what it is and a value that works locally. Both `NEXT_PUBLIC_DJANGO_API_URL` and `NEXT_PUBLIC_DISCORD_AUTH_URL` are required, or the app won't start or build (never production credentials);
   - `bun dev`;
   - running tests (`bunx vitest run <paths>`, or `bun run test` once it exists), `bun run lint` and `bun run typecheck`;
   - a Windows note: line endings are LF (`core.autocrlf false` until issue 0002 lands);
   - changesets: every pull request needs one, and chores and docs use `bunx changeset --empty`. Fix the conflicting advice in today's "When to add a changeset" section.
2. Link it from `README.md`'s quick start, and link `docs/architecture/README.md` from it.

## Acceptance criteria

- [ ] A fresh clone set up by following only the new section runs `bun dev` and `bun run lint` without errors.
- [ ] Every variable in `config/env.ts` is explained.

## How to test

Follow the new section on a fresh clone and paste the output of `bun run lint` and `bun run typecheck` in the pull request.

## Out of scope

- Rewriting the other sections of `CONTRIBUTING.md`.

## Notes for reviewers

Check every command against the repository as it is when this merges.
