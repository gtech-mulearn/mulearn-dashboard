# Give college-levels an index.ts

| | |
|---|---|
| ID | 0006 |
| Phase / milestone | Phase 1: Foundations |
| Module | organizations |
| Size | S |
| Labels | arch, phase:1, module:organizations, type:chore, size:S, good first issue |
| Depends on | none |
| Backend | none |
| Blocks | none |
| Repos | mulearn-dashboard |

## Why

`src/features/college-levels/` has no `index.ts`, so code outside it imports its files directly (1 such import at 6d6cb30b), and anything inside it can be imported. Every feature exposes one public surface ([ADR-002](../adr/ADR-002-feature-anatomy-and-public-surface.md)).

## Before you start

- Read [The anatomy of a feature](../04-module-rules.md#the-anatomy-of-a-feature).
- Find the outside imports: `grep -rn "@/features/college-levels/" src --include=*.ts --include=*.tsx | grep -v "^src/features/college-levels/"`.
- The module page is [organizations](../modules/organizations.md).

## What to do

1. Create `src/features/college-levels/index.ts`, exporting exactly what code outside the feature imports today.
2. Change those imports to `@/features/college-levels`.
3. If issue 0005 has landed, remove every line for `college-levels` from `scripts/allowlists/feature-imports.txt`, including its `missing-index` line.

## Acceptance criteria

- [ ] `src/features/college-levels/index.ts` exists.
- [ ] No file outside the feature imports `@/features/college-levels/...`.
- [ ] Typecheck, lint and the build pass.

## How to test

```sh
bun run lint
bun run typecheck
bunx vitest run src/features/college-levels
```

## Out of scope

- Changing what the feature does, or moving its files.

## Notes for reviewers

Check `index.ts` exports only what outside code uses, not every file.
