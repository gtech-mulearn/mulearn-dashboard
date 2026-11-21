# Give company-mentors an index.ts

| | |
|---|---|
| ID | 0007 |
| Phase / milestone | Phase 1: Foundations |
| Module | mentorship |
| Size | S |
| Labels | arch, phase:1, module:mentorship, type:chore, size:S, good first issue |
| Depends on | none |
| Backend | none |
| Blocks | none |
| Repos | mulearn-dashboard |

## Why

`src/features/company-mentors/` has no `index.ts`, so code outside it imports its files directly (1 such import at 6d6cb30b), and anything inside it can be imported. Every feature exposes one public surface ([ADR-002](../adr/ADR-002-feature-anatomy-and-public-surface.md)).

## Before you start

- Read [The anatomy of a feature](../04-module-rules.md#the-anatomy-of-a-feature).
- Find the outside imports: `grep -rn "@/features/company-mentors/" src --include=*.ts --include=*.tsx | grep -v "^src/features/company-mentors/"`.
- The module page is [mentorship](../modules/mentorship.md).

## What to do

1. Create `src/features/company-mentors/index.ts`, exporting exactly what code outside the feature imports today.
2. Change those imports to `@/features/company-mentors`.
3. If issue 0005 has landed, remove every line for `company-mentors` from `scripts/allowlists/feature-imports.txt`, including its `missing-index` line.

## Acceptance criteria

- [ ] `src/features/company-mentors/index.ts` exists.
- [ ] No file outside the feature imports `@/features/company-mentors/...`.
- [ ] Typecheck, lint and the build pass.

## How to test

```sh
bun run lint
bun run typecheck
bunx vitest run src/features/company-mentors
```

## Out of scope

- Changing what the feature does, or moving its files.

## Notes for reviewers

Check `index.ts` exports only what outside code uses, not every file.
