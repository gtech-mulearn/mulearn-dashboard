# Migration strategy

How the dashboard moves from today's code to the target, one pull request at a time, and how each step follows the backend. The target is in [03-target-architecture.md](03-target-architecture.md); the schedule is in [14-roadmap.md](14-roadmap.md).

## The rules of the migration

1. **No big-bang.** Every change is one issue, one pull request, and leaves the app working.
2. **Stop the growth first, then shrink.** The CI checks for tests, import cycles and imports into other features' internals land before the clean-up, so nothing new adds to the debt while it is paid down ([ADR-003](adr/ADR-003-import-ratchets.md), [ADR-012](adr/ADR-012-tests-in-ci-with-a-baseline.md)).
3. **Shrink-only lists.** Every exception lives in a list that CI checks. An issue that cleans something up removes its entries in the same pull request.
4. **Most-used first.** Features are cleaned up in order of how much other code reaches into them: `company-jobs` (53 imports into its internals), `mentor` (27), `auth` (17), then `profile`, `home` and `interest-groups`, then the rest.
5. **Never break against the deployed backend.** Read new fields as optional. Gate anything new the dashboard sends ([ADR-011](adr/ADR-011-flags-for-new-sends.md)).
6. **Every change is reversible.** A pull request reverts on its own, and a flag turns off without a code change.

## Moving one feature to the rules

For each feature, in order:
1. **Give it an `index.ts`** if it has none, exporting what other code uses.
2. **Route every outside import through `index.ts`.** Move shared parts down to `src/components`, `src/lib` or `src/hooks` where they belong to no feature. Remove the feature's entries from the feature-import allowlist.
3. **Use its query-key factory everywhere** (`hooks/query-keys.ts`; add one if the feature has none), and replace its inline keys. Remove its entries from the inline-key list.
4. **Move its endpoint paths** from `src/api/endpoints.ts` into the feature's `api/paths.ts`, keeping in `src/api/endpoints.ts` the paths other features also use.
5. **Add contract tests** for its main responses.

Steps 1–2 come first for every feature. Step 3 starts with the features that have the most inline keys (`manage-locations` and `manage-ig`, 4 files each). Step 4 is piloted on `events`, then `tasks` and learning circles. After that, each feature finishes the steps when it is next changed.

## How each phase follows the backend

| Backend phase | What it changes for the dashboard | Dashboard work |
|---|---|---|
| 0 Stabilise and secure | Private security work; nothing the dashboard can see yet | The dashboard's own Phase 0: tests in CI, line endings, the cycle check, the setup guide |
| 1 Foundations | `code` and `requestId` in every envelope (backend 0019); stable error codes (backend 0017) | The API client reads them (issue 0018), and error states show the request id (issue 0019) |
| 2 Serving and runtime | nginx limits: 10 s, 30 s on admin paths, 10 MB bodies; JSON 5xx; dev-server and staging first (backend 0045, week 7), production later (backend 0047); fast-failing auth routes (backend 0038); DRF and Django upgrades (backend 0040, 0042) | Timeouts, 503s and the upload limit (issue 0022) by week 6; the smoke suite (issue 0034) and its runs during the soaks (issue 0035) |
| 3 Schema safety net and events | The outbox and background work; the μCoin integration is on hold | None |
| 4 Contributions and the ledger | Karma writes move onto the ledger; routes and responses unchanged | None |
| 5 Identity and access | Default deny; policies; rate limits; Turnstile; key separation phase 1 | The anonymous-call list (issue 0033) now; the Phase 5 epic later |
| 6–8 | Period-total leaderboards, notifications, privacy, API standards, page caps | The paging issues (issues 0030–0032) now; the epics later |

The full list, one row per backend change, is the [change tracker](06-backend-contract.md#the-change-tracker).

## Compatibility during the migration

- **The dashboard works against both today's backend and the next one.** New response fields are optional in every schema, and their absence is tested.
- **Nothing new is sent until the backend accepts it** in that environment: a flag per change, turned on by a maintainer per environment.
- **Token-expiry handling doesn't change** while the backend keeps answering token failures the way `isTokenExpired` recognises them: a 401, `statusCode 1000`, or a token-expired message.

## Rollback

- **A cleanup pull request** (imports, keys, endpoints) reverts on its own; the allowlists return with it.
- **A behaviour change** (refresh, timeouts, error boundaries) is small enough to revert without touching others, and lists its revert steps in its pull request.
- **A flagged change** turns off by rebuilding the environment with the flag unset.
