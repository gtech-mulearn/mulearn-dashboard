# ADR-003: Deep-import and cycle ratchets in CI

Status: Accepted
Date: 2026-11-21
Implementation status at dev 6d6cb30b: not started. `bun run lint:circular` (madge) exists but isn't run in CI.

## Context

Rules that aren't checked decay. The dashboard can't fix all 156 deep imports and every import cycle at once, so new code needs to stop adding them while old ones are removed one feature at a time. The backend uses the same approach: shrink-only allowlists ([backend ADR-016](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/adr/ADR-016-architecture-enforced-by-automation.md)).

## Options considered

- **Shrink-only allowlists checked in CI.** A new deep import or cycle fails; a stale allowlist entry fails too, so the lists only shrink.
- **Fix everything first, then enforce.** Blocks other work for weeks.
- **Warnings only.** Ignored in practice.

## Decision

- A CI check lists every import into another feature's internals and compares it with an allowlist file; a new one fails, and a removed one must be deleted from the list.
- The madge cycle check runs in CI the same way, against a baseline of today's cycles.
- Both lists live in the repo and only shrink.

## Consequences

- Contributors see the rule at the moment they break it.
- The first issues remove deep imports from the most-imported features, one feature per pull request.

## Revisit when

- Both allowlists are empty: replace them with a plain rule.

## Related ADRs

- [ADR-002: Feature anatomy and `index.ts` as the only public surface](ADR-002-feature-anatomy-and-public-surface.md)
- [ADR-012: Tests in CI behind a failure baseline](ADR-012-tests-in-ci-with-a-baseline.md)
