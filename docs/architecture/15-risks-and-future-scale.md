# Risks and future scale

What could go wrong over the next few years, what's done about it, and the triggers for revisiting the architecture.

## Failure modes

| # | What goes wrong | Effect on users | Prevention | Signal |
|---|---|---|---|---|
| R-01 | The backend's time and size limits reach an environment before the dashboard handles them | Raw errors or blank sections on slow pages and large uploads | Issues 0022, 0042 and 0043 are scheduled in week 6, released to staging before backend 0045 deploys there in week 7, and to production before backend 0047 (issue 0044) | 504 and 413 counts in error reports |
| R-02 | The backend caps page sizes while some pages still ask for up to 1,000 rows | Lists show only part of the data | The paging issues (issues 0030–0032) land long before the backend's Phase 8 caps | The backend epic's entry check |
| R-03 | Refresh tokens start rotating while tabs still refresh on their own | Users with several tabs are signed out | Single-flight refresh (issue 0023) lands first; ADR-010 | Sign-out reports after a backend auth change |
| R-04 | A new request field reaches a backend that rejects unknown keys | Forms fail with a 400 | A flag per new send, turned on per environment ([ADR-011](adr/ADR-011-flags-for-new-sends.md)) | 400s on the changed endpoint |
| R-05 | The backend's default deny locks an endpoint the dashboard calls without a session | Public pages fail | The anonymous-call list (issue 0033) goes to the backend before the switch | 401s on public pages in the backend's shadow reports |
| R-06 | Page gating is treated as security | A hidden page is assumed safe | The docs say everywhere that the backend decides data access ([ADR-009](adr/ADR-009-page-access.md)) | Review |
| R-07 | Script injected into a page reads the token cookies | Session theft | No raw HTML insertion; sanitised markdown; a Content-Security-Policy as later hardening ([ADR-008](adr/ADR-008-token-storage.md)) | Review; CSP reports once added |
| R-08 | Token cookies are set with different options on different paths | Confusing sign-outs, and cookies that outlive their token | One helper for every token cookie (issue 0024) | Session bug reports |
| R-09 | The import clean-up stalls and new code adds coupling | Changes ripple across features again | Shrink-only allowlists in CI (issues 0003 and 0005) | The allowlist length over time |
| R-10 | The test baseline grows instead of shrinking | Failing tests become normal | Adding to the baseline needs a reviewer to agree, with the reason | The baseline length over time |
| R-11 | Backend issue numbers or contracts change before these issues are filed | Issues point at the wrong backend work | The docs check re-checks every backend reference on every run | The check fails |
| R-12 | How production and `dev` deploy stays unknown | A release doesn't do what contributors expect | Recorded as "to verify" in [10-build-and-deployment.md](10-build-and-deployment.md) | Maintainers confirm |
| R-13 | The design-system approval is delayed | Screens stay as they are | No issue depends on it except its own epic | — |
| R-14 | Bundles grow as features are added | Slow first loads on mid-range phones | Per-route bundle budgets (issue 0029) | The budget check in CI |

## Scale tiers and their triggers

The app doesn't need to change shape to grow. These are the points at which a bigger change becomes worth it:

| Trigger | Then consider |
|---|---|
| A second kind of client needs server-side data access, or data must be hidden from the browser | A server-side proxy for that part ([ADR-001](adr/ADR-001-one-app-strict-feature-modules.md), option 2) |
| The backend starts phase 2 of its key separation (rotating refresh tokens, public keys) | The token-storage decision, and edge verification in `src/proxy.ts` ([ADR-008](adr/ADR-008-token-storage.md)) |
| A route's first-load JavaScript keeps hitting its budget | Server components for that route's first view |
| The admin area and the learner area diverge in release cadence or audience | Splitting them into two apps |
| Regressions keep reaching staging despite unit tests | Running the smoke suite on every staging deploy, then in CI against a preview |
| Several teams work on the dashboard at once | Code owners per module, and the module pages as their contract |
