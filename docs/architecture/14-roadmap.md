# Roadmap: the first 12 weeks

The dashboard's plan for the first 90 days, built from the issues in [github-issues/](github-issues/README.md). It uses the backend's calendar ([backend roadmap](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/14-roadmap.md)). Week 1 starts on **Thursday 10 December 2026**, and week 12 ends on **Wednesday 3 March 2027**.

The weeks are **indicative**: anyone may pick up these issues, so the pace isn't known. What is fixed is the order. The schedule is generated from the issue catalogue and checked twice:
- no issue comes before the dashboard issues it depends on;
- no issue comes before the week of any backend issue in its "Backend" row.

## Assumptions

- **The backend's calendar.** Backend weeks are merge weeks. Where a dashboard change must be live *before* a backend change reaches an environment, it is scheduled earlier: the time-limit handling merges in week 6, and a maintainer releases it to staging in week 7, before the backend moves dev-server and staging behind nginx (backend issue 0045), and to production before backend 0047 (issue 0044).
- **Releases.** The dashboard promotes `dev` → `staging` → `master` through pull requests, on its own schedule.
- **The year-end freeze** covers week 3 (24–30 December). There are no production releases that week.
- **Maintainers.** `maintainer-only` issues need production settings or a service account. They're listed so the whole plan is visible.
- **The backend's Phases 3 and 4** (events, the karma ledger) change nothing the dashboard calls, so weeks 10–12 carry no new dashboard issues ([the change tracker](06-backend-contract.md#the-change-tracker)).

## Tracks

| Track | Weeks 1–4 | Weeks 5–8 | Weeks 9–12 |
|---|---|---|---|
| Safety and CI (`platform`) | tests in CI, line endings, cycle and feature-import checks, setup guide, bundle budgets, smoke suite | — | review the allowlists |
| Feature boundaries | `index.ts` for three features; `company-jobs`, `mentor`, `auth`, `profile`, `home`, `interest-groups` | the remaining deep imports | — |
| Backend contract (`api-client`) | — | `code` and `requestId`; timeouts, 503s, upload limit, 429; anonymous-call list; the release before nginx | — |
| Session (`auth-and-access`) | the multi-role tests; single-flight refresh | one token-cookie helper | — |
| Reliability (`app-shell`, `shared-lib`) | — | error boundaries, the Sentry adapter and rollout, request ids in errors | — |
| Patterns (`events`, `learning`, `communities`, `organizations`) | the inline-key check; endpoints for events | inline keys replaced in two features | endpoints for tasks and learning circles |
| Lists (`interns`, `organizations`, `learning`) | — | every list paged at 100 rows | — |

## Week by week

### Week 1: Thu 10 Dec – Wed 16 Dec 2026

**Objective.** Make the repository safe to change, and give newcomers their first issues.

| Issue | Title | Phase | Module | Depends on | Backend |
|---|---|---|---|---|---|
| [0001](github-issues/0001-test-script-and-ci-baseline.md) | Add a test script and run Vitest in CI with a failure baseline | 0 | platform | none | none |
| [0002](github-issues/0002-gitattributes-line-endings.md) | Add a .gitattributes so text files use LF everywhere | 0 | platform | none | none |
| [0004](github-issues/0004-contributor-setup-guide.md) | Write the contributor setup guide | 0 | platform | none | none |
| [0006](github-issues/0006-index-college-levels.md) | Give college-levels an index.ts | 1 | organizations | none | none |
| [0007](github-issues/0007-index-company-mentors.md) | Give company-mentors an index.ts | 1 | mentorship | none | none |
| [0008](github-issues/0008-index-push.md) | Give push an index.ts | 1 | notifications | none | none |
| [0017](github-issues/0017-events-endpoints-in-feature.md) | Move the events endpoints into the events feature | 1 | events | none | none |
| [0040](github-issues/0040-private-vulnerability-reporting.md) | Turn on private vulnerability reporting and add SECURITY.md | 0 | platform | none | none |
| [0041](github-issues/0041-confirm-deploy-paths.md) | Confirm and document how dev and production deploy | 0 | platform | none | none |

- **Deliverables:** The `test` script and Vitest in CI with a failure baseline; LF line endings; the setup guide; `index.ts` for the three features without one; the events endpoints moved into their feature; private vulnerability reporting switched on and the deploy paths confirmed (maintainers).
- **Acceptance:** A pull request that breaks a passing test fails CI.
- **Definition of done:** Every issue in the week has merged with its acceptance criteria checked; `bun run lint`, `bun run typecheck`, the tests and `bun run build` pass; no allowlist grew; the change tracker and module pages are updated in the same pull requests.

### Week 2: Thu 17 Dec – Wed 23 Dec 2026

**Objective.** Stop coupling from growing.

| Issue | Title | Phase | Module | Depends on | Backend |
|---|---|---|---|---|---|
| [0003](github-issues/0003-import-cycle-check.md) | Check import cycles in CI against a baseline | 0 | platform | 0001 | none |
| [0005](github-issues/0005-feature-import-check.md) | Check imports into other features' internals in CI | 1 | platform | 0001 | none |
| [0016](github-issues/0016-inline-query-key-check.md) | Check for inline query keys in CI | 1 | platform | 0001 | none |
| [0021](github-issues/0021-multi-role-union-tests.md) | Test that page access is the union of every role a user holds | 1 | auth-and-access | 0001 | none |

- **Deliverables:** The import-cycle, feature-import and inline-query-key checks in CI; tests for the multi-role union rule.
- **Acceptance:** A new import into another feature's internals fails CI.
- **Definition of done:** Every issue in the week has merged with its acceptance criteria checked; `bun run lint`, `bun run typecheck`, the tests and `bun run build` pass; no allowlist grew; the change tracker and module pages are updated in the same pull requests.

### Week 3: Thu 24 Dec – Wed 30 Dec 2026

**Objective.** Clean up the most-imported features; measure bundles.

| Issue | Title | Phase | Module | Depends on | Backend |
|---|---|---|---|---|---|
| [0009](github-issues/0009-company-jobs-public-surface.md) | Route imports of company-jobs through its index | 1 | careers | 0005 | none |
| [0010](github-issues/0010-mentor-public-surface.md) | Route imports of mentor through its index | 1 | mentorship | 0005 | none |
| [0020](github-issues/0020-feature-anatomy-in-contributing.md) | Document the feature anatomy in CONTRIBUTING.md | 1 | platform | 0003, 0005, 0016 | none |
| [0029](github-issues/0029-bundle-budgets.md) | Add per-route bundle budgets to CI | 2 | platform | none | none |
| [0034](github-issues/0034-staging-smoke-suite.md) | Add a staging smoke suite for login and the core pages | 2 | platform | none | none |

- **Deliverables:** `company-jobs` and `mentor` used only through their `index.ts`; the feature anatomy in CONTRIBUTING.md; bundle budgets in CI; the staging smoke suite.
- **Acceptance:** The feature-import allowlist is shorter by the `company-jobs` and `mentor` entries.
- **Definition of done:** Every issue in the week has merged with its acceptance criteria checked; `bun run lint`, `bun run typecheck`, the tests and `bun run build` pass; no allowlist grew; the change tracker and module pages are updated in the same pull requests.

### Week 4: Thu 31 Dec – Wed 06 Jan 2027

**Objective.** More public surfaces; one refresh across tabs.

| Issue | Title | Phase | Module | Depends on | Backend |
|---|---|---|---|---|---|
| [0011](github-issues/0011-auth-public-surface.md) | Route imports of auth through its index | 1 | auth-and-access | 0005 | none |
| [0012](github-issues/0012-profile-public-surface.md) | Route imports of profile through its index | 1 | people | 0005 | none |
| [0013](github-issues/0013-home-public-surface.md) | Route imports of home through its index | 1 | workspace | 0005 | none |
| [0014](github-issues/0014-interest-groups-public-surface.md) | Route imports of interest-groups through its index | 1 | communities | 0005 | none |
| [0023](github-issues/0023-single-flight-refresh.md) | Make token refresh single-flight across tabs | 2 | auth-and-access | 0001 | none |

- **Deliverables:** `auth`, `profile`, `home` and `interest-groups` routed through their `index.ts`; single-flight token refresh.
- **Acceptance:** Two tabs with an expired token make one client-side refresh call.
- **Definition of done:** Every issue in the week has merged with its acceptance criteria checked; `bun run lint`, `bun run typecheck`, the tests and `bun run build` pass; no allowlist grew; the change tracker and module pages are updated in the same pull requests.

### Week 5: Thu 07 Jan – Wed 13 Jan 2027

**Objective.** Read the backend's new envelope; finish the import clean-up.

| Issue | Title | Phase | Module | Depends on | Backend |
|---|---|---|---|---|---|
| [0015](github-issues/0015-remaining-deep-imports.md) | Route the remaining deep imports through each feature's index | 1 | platform | 0005, 0009, 0010, 0011, 0012, 0013, 0014 | none |
| [0018](github-issues/0018-api-error-model.md) | Read `code`, `requestId` and field errors in the API client | 1 | api-client | 0001 | 0019 |
| [0024](github-issues/0024-one-token-cookie-helper.md) | Set every token cookie through one helper | 2 | auth-and-access | 0001 | none |
| [0025](github-issues/0025-error-boundaries.md) | Add error boundaries to dashboard sections | 2 | app-shell | 0001 | none |
| [0026](github-issues/0026-sentry-adapter.md) | Add a Sentry adapter to the error-logging service | 2 | shared-lib | 0001 | none |
| [0030](github-issues/0030-page-intern-lists.md) | Page the intern lists at 100 rows | 2 | interns | 0001 | none |

- **Deliverables:** The API client reads `code`, `requestId` and field errors (backend 0019, the same week); the remaining deep imports routed; one helper for token cookies; error boundaries; the Sentry adapter; the intern lists paged at 100.
- **Acceptance:** `ApiError` carries `code` and `requestId` from a backend that sends them; errors from one that doesn't behave as before.
- **Definition of done:** Every issue in the week has merged with its acceptance criteria checked; `bun run lint`, `bun run typecheck`, the tests and `bun run build` pass; no allowlist grew; the change tracker and module pages are updated in the same pull requests.

### Week 6: Thu 14 Jan – Wed 20 Jan 2027

**Objective.** Be ready before the backend moves dev-server and staging behind nginx (backend 0045, week 7).

| Issue | Title | Phase | Module | Depends on | Backend |
|---|---|---|---|---|---|
| [0019](github-issues/0019-request-id-in-error-states.md) | Show the request id in error states | 1 | app-shell | 0018 | none |
| [0022](github-issues/0022-gateway-timeouts.md) | Handle gateway timeouts without breaking long calls | 2 | api-client | 0018 | none |
| [0028](github-issues/0028-report-request-ids.md) | Attach `code` and `requestId` to error reports | 2 | api-client | 0018, 0026 | none |
| [0031](github-issues/0031-page-organisation-lists.md) | Page the organisation lists at 100 rows | 2 | organizations | 0001 | none |
| [0032](github-issues/0032-page-task-type-list.md) | Page the task-type list at 100 rows | 2 | learning | 0001 | none |
| [0033](github-issues/0033-anonymous-calls-list.md) | List every anonymous backend call the dashboard makes | 2 | api-client | 0001 | none |
| [0042](github-issues/0042-auth-503-keeps-session.md) | Keep the session through temporary 503s from the auth routes | 2 | auth-and-access | 0018 | none |
| [0043](github-issues/0043-upload-limit-and-429.md) | Refuse uploads over 10 MB and handle 429 | 2 | api-client | 0018 | none |

- **Deliverables:** Gateway timeouts handled without breaking long calls; the session kept through temporary 503s on the client and server paths; uploads over 10 MB refused and 429 handled; request ids in error states and error reports; the organisation and task-type lists paged; the list of anonymous calls.
- **Acceptance:** A request cut off by the backend shows a retry state; a 503 from the auth routes never signs anyone out; a 12 MB file is refused before upload.
- **Definition of done:** Every issue in the week has merged with its acceptance criteria checked; `bun run lint`, `bun run typecheck`, the tests and `bun run build` pass; no allowlist grew; the change tracker and module pages are updated in the same pull requests.

### Week 7: Thu 21 Jan – Wed 27 Jan 2027

**Objective.** Turn error reporting on, and release the time-limit handling before the backend's nginx move.

| Issue | Title | Phase | Module | Depends on | Backend |
|---|---|---|---|---|---|
| [0027](github-issues/0027-rollout-sentry.md) | Create the Sentry project and turn reporting on per environment | 2 | platform | 0026, 0041 | none |
| [0044](github-issues/0044-release-before-nginx.md) | Release the time-limit handling to staging and production before the backend's nginx move | 2 | platform | 0022, 0042, 0043 | none |

- **Deliverables:** The Sentry project and its key, per environment (maintainers); the time-limit handling live on staging before backend 0045 deploys there, and on production before backend 0047 (maintainers).
- **Acceptance:** A test error on staging appears in the reports with its request id and no personal data; the time-limit handling is live on staging before backend 0045 is.
- **Definition of done:** Every issue in the week has merged with its acceptance criteria checked; `bun run lint`, `bun run typecheck`, the tests and `bun run build` pass; no allowlist grew; the change tracker and module pages are updated in the same pull requests.

### Week 8: Thu 28 Jan – Wed 03 Feb 2027

**Objective.** Apply the patterns to more features.

| Issue | Title | Phase | Module | Depends on | Backend |
|---|---|---|---|---|---|
| [0036](github-issues/0036-query-keys-manage-locations.md) | Replace the inline query keys in manage-locations | 1 | organizations | 0016 | none |
| [0037](github-issues/0037-query-keys-manage-ig.md) | Replace the inline query keys in manage-ig | 1 | communities | 0016 | none |

- **Deliverables:** Inline query keys replaced in `manage-locations` and `manage-ig`.
- **Acceptance:** The inline-key list is shorter by those features' entries.
- **Definition of done:** Every issue in the week has merged with its acceptance criteria checked; `bun run lint`, `bun run typecheck`, the tests and `bun run build` pass; no allowlist grew; the change tracker and module pages are updated in the same pull requests.

### Week 9: Thu 04 Feb – Wed 10 Feb 2027

**Objective.** Apply the patterns to more features.

| Issue | Title | Phase | Module | Depends on | Backend |
|---|---|---|---|---|---|
| [0038](github-issues/0038-tasks-endpoints-in-feature.md) | Move the tasks endpoints into the tasks feature | 1 | learning | 0017 | none |
| [0039](github-issues/0039-learning-circle-endpoints-in-feature.md) | Move the learning-circle endpoints into the learning-circle feature | 1 | communities | 0017 | none |

- **Deliverables:** The tasks and learning-circle endpoints moved into their features.
- **Acceptance:** `src/api/endpoints.ts` no longer holds those paths.
- **Definition of done:** Every issue in the week has merged with its acceptance criteria checked; `bun run lint`, `bun run typecheck`, the tests and `bun run build` pass; no allowlist grew; the change tracker and module pages are updated in the same pull requests.

### Week 10: Thu 11 Feb – Wed 17 Feb 2027

**Objective.** No new dashboard issues: the backend's Phase 3 and 4 work needs no dashboard change (see the change tracker).

No new issues are scheduled this week.

- **Deliverables:** Carry-over from earlier weeks; maintainers split the Phase 5 epic once the backend's grants endpoint is planned.
- **Acceptance:** Every earlier week's issues have merged.
- **Definition of done:** Every issue in the week has merged with its acceptance criteria checked; `bun run lint`, `bun run typecheck`, the tests and `bun run build` pass; no allowlist grew; the change tracker and module pages are updated in the same pull requests.

### Week 11: Thu 18 Feb – Wed 24 Feb 2027

**Objective.** As week 10.

No new issues are scheduled this week.

- **Deliverables:** Carry-over; the smoke suite runs on staging during the backend's Django 5.2 soak (after the backend's rollout).
- **Acceptance:** The smoke suite passes on staging during the soak.
- **Definition of done:** Every issue in the week has merged with its acceptance criteria checked; `bun run lint`, `bun run typecheck`, the tests and `bun run build` pass; no allowlist grew; the change tracker and module pages are updated in the same pull requests.

### Week 12: Thu 25 Feb – Wed 03 Mar 2027

**Objective.** Review and replan.

No new issues are scheduled this week.

- **Deliverables:** The feature-import and cycle allowlists reviewed; the next features for query keys and endpoint moves picked.
- **Acceptance:** The next quarter's issues are written from the epics that are ready.
- **Definition of done:** Every issue in the week has merged with its acceptance criteria checked; `bun run lint`, `bun run typecheck`, the tests and `bun run build` pass; no allowlist grew; the change tracker and module pages are updated in the same pull requests.

## After the backend's rollout

These maintainer-only issues wait for a backend change to be deployed, not merged, so they have no week:

| Issue | Title | Backend |
|---|---|---|
| [0035](github-issues/0035-rollout-smoke-during-soaks.md) | Run the smoke suite on staging during the backend's upgrade soaks | 0040, 0042 |

## State at day 90 (Wednesday 3 March 2027)

If the issues land on this schedule:

- **Safety.** Every pull request runs the tests (behind a shrinking baseline), lint, types, the build, the import-cycle and feature-import checks, and the bundle budgets. Line endings are the same on every system.
- **Boundaries.** Every feature has an `index.ts`, and no code reaches into another feature's internals outside the shrinking allowlist.
- **Backend contract.** The API client reads `code` and `requestId`. Time limits, temporary 503s and the 10 MB upload limit are handled before the backend's limits reach any environment. The backend has the list of anonymous calls it must keep public. Every list pages at 100 rows.
- **Session.** One refresh at a time across tabs, one helper for every token cookie, and the multi-role rule under test.
- **Reliability.** Error boundaries keep a failing section from blanking a page, and errors are reported with request ids.

## Deliberately later

| Item | Where | Why later |
|---|---|---|
| Page access from the backend's grants; default deny; rate limits and Turnstile | [Phase 5 epic](github-issues/epics/phase-5-identity-and-access.md) | Waits for a backend endpoint that returns grants |
| Leaderboards from period totals; the notification pipeline | [Phase 6 epic](github-issues/epics/phase-6-gamification-and-notifications.md) | Follows the backend's Phase 6 |
| Consent, age gate and rights workflows | [Phase 7 epic](github-issues/epics/phase-7-people-and-privacy.md) | Needs legal review and the backend's new fields |
| Generated types, `X-App-Version`, exports as jobs, polling with ETag | [Phase 8 epic](github-issues/epics/phase-8-api-standards-and-rewards.md) | Follows the backend's Phase 8, and its CORS for new headers |
| The design system on every screen | [Design-system epic](github-issues/epics/design-system-adoption.md) | Waits for the maintainers' approval of the design |
| Edge verification; the token-storage decision revisited | [Later epic](github-issues/epics/later-on-demand.md) | Waits for the backend's key-separation phase 2 |

## Release sprints

The 12 weeks run as six two-week sprints. Each sprint ends in a release, so production moves forward in small, tested steps. Sprint N covers weeks 2N−1 and 2N:

| Sprint | Weeks | Dates | Release cut | Production release |
|---|---|---|---|---|
| 1 | 1–2 | Thu 10 Dec 2026 – Wed 23 Dec 2026 | Mon 21 Dec 2026 | Wed 23 Dec 2026 |
| 2 | 3–4 | Thu 24 Dec 2026 – Wed 06 Jan 2027 | Mon 04 Jan 2027 | Wed 06 Jan 2027 |
| 3 | 5–6 | Thu 07 Jan 2027 – Wed 20 Jan 2027 | Mon 18 Jan 2027 | Wed 20 Jan 2027 |
| 4 | 7–8 | Thu 21 Jan 2027 – Wed 03 Feb 2027 | Mon 01 Feb 2027 | Wed 03 Feb 2027 |
| 5 | 9–10 | Thu 04 Feb 2027 – Wed 17 Feb 2027 | Mon 15 Feb 2027 | Wed 17 Feb 2027 |
| 6 | 11–12 | Thu 18 Feb 2027 – Wed 03 Mar 2027 | Mon 01 Mar 2027 | Wed 03 Mar 2027 |

Each sprint is a release train:
1. **Merge to `dev`** through the sprint.
2. **Cut the release** on the sprint's second Monday: whatever has merged by then goes to staging. Anything else waits for the next train.
3. **Soak on staging** until Wednesday, with the smoke checks, the error reports and any rollout issue in the sprint.
4. **Release to production** on the sprint's last day, and only if staging is green. A train that isn't green waits; nothing is forced out.
5. **Roll back** by redeploying the previous release. A flag is a build-time variable, so turning one off needs a rebuild but no code change.

Rules that keep a release from breaking anything:
- **Production only gets what soaked on staging.**
- **Anything that sends something new is behind a flag,** off by default. It is turned on in an environment only after the backend release it needs is there ([ADR-011](adr/ADR-011-flags-for-new-sends.md)).
- **The backend releases first** when a dashboard change needs it. The exception is the time-limit handling, which the dashboard releases before the backend's nginx move (issue 0044).
- **Only rollout issues change an environment** (`maintainer-only`). Each sits in the sprint whose release carries it.
- **Each sprint has a release issue** on GitHub, in the sprint's milestone, with this checklist.

## Replanning

- **When an issue slips,** its dependants slip with it. Nothing starts before its dependencies merge.
- **When a backend issue moves,** the dashboard issues in its "Backend" row move with it; the generator refuses a schedule that puts them first.
- **When an epic's entry conditions are met,** a maintainer splits it into detailed issues with the same template and rules.
