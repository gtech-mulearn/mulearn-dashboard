# Check imports into other features' internals in CI

| | |
|---|---|
| ID | 0005 |
| Phase / milestone | Phase 1: Foundations |
| Module | platform |
| Size | M |
| Labels | arch, phase:1, module:platform, type:chore, size:M |
| Depends on | 0001 |
| Backend | none |
| Blocks | 0009, 0010, 0011, 0012, 0013, 0014, 0015, 0020 |
| Repos | mulearn-dashboard |

## Why

Code outside a feature imports its internals 156 times at 6d6cb30b: 147 through the `@/features/` alias (including one dynamic `import()`) and 9 relative imports into `intern`. Three features have no `index.ts`, and shared layers import features 14 times from 7 files, although they never should. Nothing stops new ones. A CI check against a shrink-only list stops the growth while the clean-up issues remove the old imports ([ADR-003](../adr/ADR-003-import-ratchets.md)).

## Before you start

- Issue 0001 must be merged.
- Read [Import rules](../04-module-rules.md#import-rules) and [How CI enforces each rule](../04-module-rules.md#how-ci-enforces-each-rule).

## What to do

1. Create `scripts/check-feature-imports.ts`. It scans every `.ts` and `.tsx` file under `src/`, test files included, for static imports and exports (`from "..."`, type-only too) and dynamic `import("...")`. `vi.mock("...")` paths aren't imports and aren't counted. It reports:
   - each import of another feature's internals: `@/features/<x>/<anything>`, or a relative path that resolves into `src/features/<x>/`, from a file outside `src/features/<x>/`;
   - each import of any feature from a shared layer (`src/api/`, `src/lib/`, `src/hooks/`, `src/components/`, `src/stores/`), even through its `index.ts` ([Import rules](../04-module-rules.md#import-rules), rule 4);
   - each feature folder without an `index.ts`.
2. Compare with a new `scripts/allowlists/feature-imports.txt`, one finding per line: `<target feature> | <importing file> | <import as written>`, or `<feature> | missing-index`. Exit 1 on a finding that isn't listed, and on a listed line that no longer exists. Follow the [Rules for the check scripts](README.md#rules-for-the-check-scripts).
3. Seed the list from the pull request's base commit, and record the counts in the pull request. At 6d6cb30b they were 156 internal imports, 14 shared-layer imports and 3 missing `index.ts` files; issues 0006–0008 may have merged since.
4. Add `scripts/check-feature-imports.test.ts` with a small fixture tree in a temporary folder: an allowed import, a new alias import, a new relative import, a shared-layer import, a stale line, and a missing `index.ts`.
5. Add a step to the `lint` job in `.github/workflows/ci.yml` that runs `bun scripts/check-feature-imports.ts`.

## Acceptance criteria

- [ ] The CI step passes on this pull request.
- [ ] A new deep import fails the check and names the file (paste the local output).
- [ ] Removing a listed import without updating the list fails the check.

## How to test

```sh
bun run test scripts/check-feature-imports.test.ts
bun scripts/check-feature-imports.ts
```

## Out of scope

- Removing any existing deep import (issues 0006–0015).

## Notes for reviewers

Check that type-only imports are counted too: they couple features just the same.
