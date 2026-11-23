# Add a test script and run Vitest in CI with a failure baseline

| | |
|---|---|
| ID | 0001 |
| Phase / milestone | Phase 0: Stabilise and secure |
| Module | platform |
| Size | M |
| Labels | arch, phase:0, module:platform, type:chore, size:M |
| Depends on | none |
| Backend | none |
| Blocks | 0003, 0005, 0016, 0018, 0021, 0023, 0024, 0025, 0026, 0030, 0031, 0032, 0033 |
| Repos | mulearn-dashboard |

## Why

The repository has 115 test files, but no `test` script, and CI never runs them, so a change that breaks a test merges unnoticed. Some tests fail today, so CI can't simply require every test to pass. A baseline of today's failures lets CI fail on any new failure while the old ones are fixed one by one ([ADR-012](../adr/ADR-012-tests-in-ci-with-a-baseline.md)).

## Before you start

- Read [Testing and quality gates](../12-testing-and-quality-gates.md).
- Read `vitest.config.ts`, the `scripts` block of `package.json`, and `.github/workflows/ci.yml`.

## What to do

1. Add `"test": "vitest run"` to the `scripts` in `package.json`, so `bun run test <paths>` runs the given tests.
2. Run the whole suite once with `bunx vitest run --reporter=json --outputFile=vitest-report.json`. Write every failing test to a new `scripts/allowlists/test-baseline.txt`, one per line as `<file> > <full test name>`, sorted, under a header comment that says the list only shrinks.
3. Create `scripts/check-test-baseline.ts`, run as `bun scripts/check-test-baseline.ts vitest-report.json`. It exits 1 when:
   - a test fails that isn't on the list, printing each one;
   - a listed test now passes, printing it so it can be removed in the same pull request;
   - the report file is missing or can't be parsed.

   Follow the [Rules for the check scripts](README.md#rules-for-the-check-scripts).
4. Add `scripts/check-test-baseline.test.ts` with small JSON fixtures for both cases and for a clean run.
5. Add a `test` job to `.github/workflows/ci.yml`, with the same setup steps as the other jobs. It runs `bunx vitest run --reporter=json --outputFile=vitest-report.json || true`, then `bun scripts/check-test-baseline.ts vitest-report.json`.
6. Add `vitest-report.json` to `.gitignore`.

## Acceptance criteria

- [ ] `bun run test` runs the whole suite locally.
- [ ] On a throwaway branch, a newly failing test makes the `test` job fail, and the log names it.
- [ ] Fixing a listed test without removing it from the list makes the job fail too.
- [ ] `scripts/allowlists/test-baseline.txt` is sorted and has its header comment.

## How to test

```sh
bunx vitest run scripts/check-test-baseline.test.ts
bun run test
bun scripts/check-test-baseline.ts vitest-report.json
```

## Out of scope

- Fixing the failing tests (each is its own change, and shrinks the list).
- Coverage thresholds.

## Notes for reviewers

Check that the baseline ids are stable across runs: a file path plus the full test name, with nothing that changes per run (timings, random ids).
