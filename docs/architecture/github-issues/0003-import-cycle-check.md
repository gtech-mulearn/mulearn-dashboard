# Check import cycles in CI against a baseline

| | |
|---|---|
| ID | 0003 |
| Phase / milestone | Phase 0: Stabilise and secure |
| Module | platform |
| Size | S |
| Labels | arch, phase:0, module:platform, type:chore, size:S |
| Depends on | 0001 |
| Backend | none |
| Blocks | 0020 |
| Repos | mulearn-dashboard |

## Why

Import cycles make modules hard to move and can break the build in surprising ways. `bun run lint:circular` (madge) finds them, but CI doesn't run it, so they grow unchecked. A shrink-only baseline stops new ones without blocking work on the old ones ([ADR-003](../adr/ADR-003-import-ratchets.md)).

## Before you start

- Read [How CI enforces each rule](../04-module-rules.md#how-ci-enforces-each-rule).
- Run `bun run lint:circular` to see today's cycles.
- Issue 0001 must be merged.

## What to do

1. Create `scripts/check-import-cycles.ts`. It runs `bunx madge --circular --json --extensions ts,tsx --ts-config tsconfig.json src` and reads the result.
2. Normalise each cycle: rotate it so the alphabetically first file comes first, and join the files with ` > `.
3. Compare with a new `scripts/allowlists/import-cycles.txt` (one normalised cycle per line). Exit 1 on a cycle that isn't listed, and on a listed cycle that no longer exists. Follow the [Rules for the check scripts](README.md#rules-for-the-check-scripts).
4. Seed the list with today's cycles.
5. Add `scripts/check-import-cycles.test.ts` for the normalisation and the comparison, using madge-shaped JSON fixtures.
6. Add a step to the `lint` job in `.github/workflows/ci.yml` that runs `bun scripts/check-import-cycles.ts`.

## Acceptance criteria

- [ ] The CI step passes on this pull request.
- [ ] On a throwaway branch, a new cycle fails the step and names its files.
- [ ] Removing a listed cycle without updating the list fails the step.

## How to test

```sh
bun run test scripts/check-import-cycles.test.ts
bun scripts/check-import-cycles.ts
```

## Out of scope

- Breaking any existing cycle.

## Notes for reviewers

Check that the same cycle found from a different starting file normalises to the same line.
