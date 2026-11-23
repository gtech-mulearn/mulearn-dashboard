# Document the feature anatomy in CONTRIBUTING.md

| | |
|---|---|
| ID | 0020 |
| Phase / milestone | Phase 1: Foundations |
| Module | platform |
| Size | S |
| Labels | arch, phase:1, module:platform, type:docs, size:S |
| Depends on | 0003, 0005, 0016 |
| Backend | none |
| Blocks | none |
| Repos | mulearn-dashboard |

## Why

The rules for a feature's layout and imports live in the architecture docs. Contributors start from `CONTRIBUTING.md`, which doesn't mention them, nor what to do when the new checks fail ([04-module-rules.md](../04-module-rules.md)).

## Before you start

- Issues 0003, 0005 and 0016 must be merged.
- Read `CONTRIBUTING.md`.

## What to do

1. Add a "Feature anatomy" section to `CONTRIBUTING.md`: the folder layout, `index.ts` as the only public surface, and query keys in `hooks/query-keys.ts`. Link [04-module-rules.md](../04-module-rules.md) for the rest.
2. Add "When a check fails": what each check (feature imports, import cycles, query keys, the test baseline) means, and how to fix it instead of adding to its list.

## Acceptance criteria

- [ ] Both sections exist, and every link resolves.

## How to test

Open `CONTRIBUTING.md` in the pull request preview and check every link.

## Out of scope

- Rewriting other sections.

## Notes for reviewers

Keep it short; link the architecture pages rather than copying them.
