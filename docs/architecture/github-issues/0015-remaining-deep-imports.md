# Route the remaining deep imports through each feature's index

| | |
|---|---|
| ID | 0015 |
| Phase / milestone | Phase 1: Foundations |
| Module | platform |
| Size | L |
| Labels | arch, phase:1, module:platform, type:chore, size:L |
| Depends on | 0005, 0009, 0010, 0011, 0012, 0013, 0014 |
| Backend | none |
| Blocks | none |
| Repos | mulearn-dashboard |

## Why

After the six biggest features are cleaned up (issues 0009–0014), about 40 deep imports remain, spread over some 20 features: `intern` (9, all relative), `mujourney` (4), `onboarding` (3), `manage-users`, `campus`, `campus-manage` and `search` (2 each), and single imports into the rest ([ADR-002](../adr/ADR-002-feature-anatomy-and-public-surface.md)). The 14 shared-layer imports of features are in the same list.

## Before you start

- Issues 0005, 0009, 0010, 0011, 0012, 0013 and 0014 must be merged.
- Read [Import rules](../04-module-rules.md#import-rules).
- The remaining imports are the lines left in `scripts/allowlists/feature-imports.txt`.

## What to do

1. Work through the remaining import lines, feature by feature, as issues 0009–0014 did: export from the feature's `index.ts`, or move shared pieces to `src/components/`, `src/hooks/` or `src/lib/`.
2. Remove each line from the list as you fix it.
3. If one feature turns out to need a bigger change, stop and open a separate issue for it, leaving its lines in the list.

## Acceptance criteria

- [ ] `scripts/allowlists/feature-imports.txt` has no import lines left, or only lines for features with their own follow-up issue, named in the pull request.
- [ ] Typecheck, lint, the tests and the build pass.

## How to test

```sh
bun scripts/check-feature-imports.ts
bun run lint
bun run typecheck
bun run test
```

## Out of scope

- Behaviour or styling changes.

## Notes for reviewers

This touches many features: review it commit by commit, one feature per commit.
