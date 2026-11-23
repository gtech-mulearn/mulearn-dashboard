# Route imports of interest-groups through its index

| | |
|---|---|
| ID | 0014 |
| Phase / milestone | Phase 1: Foundations |
| Module | communities |
| Size | S |
| Labels | arch, phase:1, module:communities, type:chore, size:S |
| Depends on | 0005 |
| Backend | none |
| Blocks | 0015 |
| Repos | mulearn-dashboard |

## Why

Code outside `src/features/interest-groups/` reaches into its internals 5 times at 6d6cb30b, from other features and routes. Every such import breaks when the feature's files move. Outside code should use only `@/features/interest-groups` ([ADR-002](../adr/ADR-002-feature-anatomy-and-public-surface.md)).

## Before you start

- Issue 0005 (the feature-import check) must be merged.
- Read [Import rules](../04-module-rules.md#import-rules).
- List the imports: `grep -rn "@/features/interest-groups/" src --include=*.ts --include=*.tsx | grep -v "^src/features/interest-groups/"`.
- The module page is [communities](../modules/communities.md).

## What to do

1. For each outside import, decide:
   - it belongs to `interest-groups` and others may use it: export it from `src/features/interest-groups/index.ts`, and import it from `@/features/interest-groups`;
   - it belongs to no feature (a generic component, hook or helper): move it to `src/components/`, `src/hooks/` or `src/lib/`, and import it from there.
2. Remove every line whose target is `interest-groups` from `scripts/allowlists/feature-imports.txt`.
3. Keep behaviour the same: this is a move, not a change.

## Acceptance criteria

- [ ] No file outside the feature imports `@/features/interest-groups/...`.
- [ ] `scripts/allowlists/feature-imports.txt` has no line for `interest-groups`, and the check passes.
- [ ] The import-cycle check passes: routing imports through `index.ts` added no cycle.
- [ ] Typecheck, lint, the tests and the build pass.

## How to test

```sh
bun scripts/check-feature-imports.ts
bun run lint
bun run typecheck
bun run test src/features/interest-groups
```

## Out of scope

- Changing behaviour or styling.
- Cleaning up other features' imports.

## Notes for reviewers

Check anything moved to a shared layer has no feature-specific logic, and that `index.ts` doesn't simply re-export everything.
