# Add a staging smoke suite for login and the core pages

| | |
|---|---|
| ID | 0034 |
| Phase / milestone | Phase 2: Serving and runtime |
| Module | platform |
| Size | M |
| Labels | arch, phase:2, module:platform, type:chore, size:M |
| Depends on | none |
| Backend | none |
| Blocks | 0035 |
| Repos | mulearn-dashboard |

## Why

The backend upgrades DRF and Django with a staging soak (backend 0040 and 0042), and moves behind nginx (backend 0045). A short end-to-end check of sign-in and the core pages tells the maintainers within minutes whether the dashboard still works against staging ([12-testing-and-quality-gates.md](../12-testing-and-quality-gates.md#kinds-of-tests)).

## Before you start

- Read `docs/DEPLOYMENT.md` for the environments.

## What to do

1. Add `@playwright/test` (pinned) as a dev dependency, and `playwright.config.ts` with `baseURL` from the `SMOKE_BASE_URL` variable, which is required. The suite refuses to run without it.
2. In `vitest.config.ts`, exclude `e2e/**` from Vitest: add it to `test.exclude`, spreading `configDefaults.exclude` from `vitest/config` to keep the defaults, so Vitest never picks up the Playwright files.
3. Add tests in a new `e2e/smoke/` folder:
   - sign in with `SMOKE_USER` and `SMOKE_PASSWORD` from the environment, never committed;
   - the dashboard home renders;
   - one page each for events, learning circles, interest groups and the profile renders without an error state;
   - sign out.
4. Skip the signed-in steps when the credentials aren't set, with a clear message.
5. Add `"smoke": "playwright test e2e/smoke"` to `package.json`. Don't add it to CI.
6. Document it in `CONTRIBUTING.md` as maintainer-run, against staging only, including `bunx playwright install chromium` on first use.

## Acceptance criteria

- [ ] `bunx playwright test --list` lists the smoke tests.
- [ ] Against a local `bun dev`, the suite runs, and skips the signed-in steps without credentials.
- [ ] No credential or environment URL is committed.

## How to test

```sh
bunx playwright install chromium
bunx playwright test --list
SMOKE_BASE_URL=http://localhost:3000 bun run smoke
```

## Out of scope

- Running it in CI.
- Running it against production.

## Notes for reviewers

Check the tests use stable selectors (roles and labels), not styling classes.
