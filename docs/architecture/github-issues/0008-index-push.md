# Give push an index.ts

| | |
|---|---|
| ID | 0008 |
| Phase / milestone | Phase 1: Foundations |
| Module | notifications |
| Size | S |
| Labels | arch, phase:1, module:notifications, type:chore, size:S, good first issue |
| Depends on | none |
| Backend | none |
| Blocks | none |
| Repos | mulearn-dashboard |

## Why

`src/features/push/` has no `index.ts`, so code outside it imports its files directly (1 such import at 6d6cb30b), and anything inside it can be imported. Every feature exposes one public surface ([ADR-002](../adr/ADR-002-feature-anatomy-and-public-surface.md)).

## Before you start

- Read [The anatomy of a feature](../04-module-rules.md#the-anatomy-of-a-feature).
- Find the outside imports: `grep -rn "@/features/push/" src --include=*.ts --include=*.tsx | grep -v "^src/features/push/"`.
- The module page is [notifications](../modules/notifications.md).

## What to do

1. Create `src/features/push/index.ts`, exporting exactly what code outside the feature imports today.
2. Change those imports to `@/features/push`.
3. If issue 0005 has landed, remove every line for `push` from `scripts/allowlists/feature-imports.txt`, including its `missing-index` line.

## Acceptance criteria

- [ ] `src/features/push/index.ts` exists.
- [ ] No file outside the feature imports `@/features/push/...`.
- [ ] Typecheck, lint and the build pass.

## How to test

```sh
bun run lint
bun run typecheck
bunx vitest run src/features/push
```

## Out of scope

- Changing what the feature does, or moving its files.

## Notes for reviewers

Check `index.ts` exports only what outside code uses, not every file.
