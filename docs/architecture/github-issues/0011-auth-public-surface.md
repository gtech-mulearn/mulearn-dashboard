# Route imports of auth through its index

| | |
|---|---|
| ID | 0011 |
| Phase / milestone | Phase 1: Foundations |
| Module | auth-and-access |
| Size | M |
| Labels | arch, phase:1, module:auth-and-access, type:chore, size:M, core-review |
| Depends on | 0005 |
| Backend | none |
| Blocks | 0015 |
| Repos | mulearn-dashboard |

## Why

Code outside `src/features/auth/` reaches into its internals 17 times at 6d6cb30b, from routes and features across the app (13 features import it in some form). Every such import breaks when the feature's files move. Outside code should use only `@/features/auth` ([ADR-002](../adr/ADR-002-feature-anatomy-and-public-surface.md)). It holds the sign-in screens and shared auth pieces, so the change needs two reviewers.

## Before you start

- Issue 0005 (the feature-import check) must be merged.
- Read [Import rules](../04-module-rules.md#import-rules).
- List the imports: `grep -rn "@/features/auth/" src --include=*.ts --include=*.tsx | grep -v "^src/features/auth/"`.
- The module page is [auth-and-access](../modules/auth-and-access.md).

## What to do

1. For each outside import, decide:
   - it belongs to `auth` and others may use it: export it from `src/features/auth/index.ts`, and import it from `@/features/auth`;
   - it belongs to no feature (a generic component, hook or helper): move it to `src/components/`, `src/hooks/` or `src/lib/`, and import it from there.
2. Remove every line whose target is `auth` from `scripts/allowlists/feature-imports.txt`.
3. Keep behaviour the same: this is a move, not a change.

## Acceptance criteria

- [ ] No file outside the feature imports `@/features/auth/...`.
- [ ] `scripts/allowlists/feature-imports.txt` has no line for `auth`, and the check passes.
- [ ] The import-cycle check passes: routing imports through `index.ts` added no cycle.
- [ ] Typecheck, lint, the tests and the build pass.

## How to test

```sh
bun scripts/check-feature-imports.ts
bun run lint
bun run typecheck
bun run test src/features/auth
```

## Out of scope

- Changing behaviour or styling.
- Cleaning up other features' imports.

## Notes for reviewers

Check anything moved to a shared layer has no feature-specific logic, and that `index.ts` doesn't simply re-export everything.
