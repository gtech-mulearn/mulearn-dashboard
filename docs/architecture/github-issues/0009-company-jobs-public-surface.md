# Route imports of company-jobs through its index

| | |
|---|---|
| ID | 0009 |
| Phase / milestone | Phase 1: Foundations |
| Module | careers |
| Size | L |
| Labels | arch, phase:1, module:careers, type:chore, size:L |
| Depends on | 0005 |
| Backend | none |
| Blocks | 0015 |
| Repos | mulearn-dashboard |

## Why

Code outside `src/features/company-jobs/` reaches into its internals 53 times at 6d6cb30b, from 8 features (`company-mentors`, `company-profile`, `company-tasks`, `events`, `home`, `manage-companies`, `mentor`, `tour`) and some routes, including one dynamic `import()`. Every such import breaks when the feature's files move. Outside code should use only `@/features/company-jobs` ([ADR-002](../adr/ADR-002-feature-anatomy-and-public-surface.md)). It is the most reached-into feature, so it goes first.

## Before you start

- Issue 0005 (the feature-import check) must be merged.
- Read [Import rules](../04-module-rules.md#import-rules).
- List the imports: `grep -rn "@/features/company-jobs/" src --include=*.ts --include=*.tsx | grep -v "^src/features/company-jobs/"`.
- The module page is [careers](../modules/careers.md).

## What to do

1. For each outside import, decide:
   - it belongs to `company-jobs` and others may use it: export it from `src/features/company-jobs/index.ts`, and import it from `@/features/company-jobs`;
   - it belongs to no feature (a generic component, hook or helper): move it to `src/components/`, `src/hooks/` or `src/lib/`, and import it from there.
2. Remove every line whose target is `company-jobs` from `scripts/allowlists/feature-imports.txt`.
3. Keep behaviour the same: this is a move, not a change.
4. **Watch for cycles.** `company-jobs` and `mentor` import each other: `src/features/mentor/sessions/components/my-invited-sessions-list.tsx` uses `RateCompanyDialog` from `company-jobs`, and `src/features/company-jobs/hooks/use-mentor-nominate.ts` uses `verifyMentor` from `mentor`. Routing both through their `index.ts` barrels can create a new import cycle, which the cycle check (issue 0003) fails on. Move the shared piece down a layer instead (`src/components/` or `src/lib/`).

## Acceptance criteria

- [ ] No file outside the feature imports `@/features/company-jobs/...`.
- [ ] `scripts/allowlists/feature-imports.txt` has no line for `company-jobs`, and the check passes.
- [ ] The import-cycle check passes: routing imports through `index.ts` added no cycle.
- [ ] Typecheck, lint, the tests and the build pass.

## How to test

```sh
bun scripts/check-feature-imports.ts
bun run lint
bun run typecheck
bun run test src/features/company-jobs
```

## Out of scope

- Changing behaviour or styling.
- Cleaning up other features' imports.

## Notes for reviewers

Check anything moved to a shared layer has no feature-specific logic, and that `index.ts` doesn't simply re-export everything.
