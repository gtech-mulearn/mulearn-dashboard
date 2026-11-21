# ADR-012: Tests in CI behind a failure baseline

Status: Accepted
Date: 2026-11-21
Implementation status at dev 6d6cb30b: not started: 115 test files exist, there is no `test` script, and CI runs lint, typecheck and build only.

## Context

The tests can't gate anything while CI doesn't run them, and some fail today. Fixing every failure before enforcing would stall other work. The backend uses a baseline ratchet for its legacy suite.

## Options considered

- **Run Vitest in CI against a committed baseline of today's failures; only new failures fail the build.**
- **Fix all failures first.**
- **Run tests without failing the build.** Ignored in practice.

## Decision

- Add a `test` script.
- Commit a baseline file of the failing tests.
- CI fails on any test that fails and isn't in the baseline. A baseline test that now passes fails the job too, and is printed so it's removed.

## Consequences

- Every later issue's tests are checked from the first pull request after this lands.

## Revisit when

- The baseline is empty.

## Related ADRs

- [ADR-003: Deep-import and cycle ratchets in CI](ADR-003-import-ratchets.md)
