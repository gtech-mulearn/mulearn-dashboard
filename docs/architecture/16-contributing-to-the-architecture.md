# Contributing to the architecture

How to make common changes the way the architecture expects, how decisions are made, and how work is reviewed. The rules themselves are in [04-module-rules.md](04-module-rules.md).

## Quickstart

```sh
git clone https://github.com/gtech-mulearn/mulearn-dashboard.git && cd mulearn-dashboard
bun install
cp .env.example .env.local     # point NEXT_PUBLIC_DJANGO_API_URL at a backend you may use
bun dev                        # http://localhost:3000
bunx vitest run <paths>        # or `bun run test <paths>` once issue 0001 lands
bun run lint && bun run typecheck
```

Never use production credentials for local work.

## Golden paths

### Add a page

1. Add a route under the right route group in `src/app/`.
2. Compose it from features (imported as `@/features/<name>`) and shared components. Keep endpoint calls out of the route file.
3. Add the route to `src/lib/auth/route-access.ts`, and call `requireRole` in the page, both with the same named role group from `src/lib/auth/roles.ts`. Remember that users hold several roles.
4. Give it loading, empty and error states: `SectionErrorFallback` for errors, and `StateDisplay` for empty.

### Add a feature

1. Create `src/features/<name>/` with `index.ts`, `api/`, `schemas/`, `hooks/` (with `query-keys.ts`) and `components/` ([the anatomy](04-module-rules.md#the-anatomy-of-a-feature)).
2. Export only what other code needs from `index.ts`.
3. Find its module in [modules/](modules/README.md), and add it to that module's page in the same pull request.

### Call a new endpoint

1. Add its path to the feature's `api/paths.ts` (or `src/api/endpoints.ts` until the feature has one).
2. Write a zod schema for the response in the feature's `schemas/`. Make fields the backend may not send yet `.optional()`.
3. Add a function in `api/` that calls it through `apiClient` (or `publicApiClient` if it needs no session) and parses the response.
4. Wrap it in a hook in `hooks/`, keyed with the feature's factory.
5. Add a contract test with a recorded response. If it is a call without a session, add it to the anonymous-call list.

### Add a form

1. Use React Hook Form with a zod resolver, with the schema in the feature's `schemas/`.
2. Show field errors from `ApiError` next to their fields, and the request id when the backend sends one.
3. On success, invalidate the narrowest query keys through the factory.

### Send a new field or header

1. Check that the backend issue adding it has merged, and name it in your pull request.
2. Put the change behind a new `NEXT_PUBLIC_FEATURE_<NAME>` flag in `config/env.ts`, off by default.
3. Ask a maintainer to open the rollout issue that turns it on per environment once that environment's backend accepts it.
4. For a header, check the backend's CORS allows it ([06-backend-contract.md](06-backend-contract.md)).

## How decisions are made

**Architecture decision records** live in [adr/](adr/README.md).

**Write an ADR when a change:**
- alters a rule in [04-module-rules.md](04-module-rules.md);
- adds a runtime dependency, a hosting change or a new kind of client;
- changes how tokens, sessions or page access work;
- changes how the dashboard depends on the backend's contract.

**How it works:**
- **Proposing.** Copy an existing record, take the next number, set its status to `Proposed`, and open a pull request that contains only the record.
- **An accepted record is never edited.** A new record supersedes it.
- **Decided by the module's reviewers:** changes inside one feature that keep its public surface.
- **Needs a maintainer's review:** a new shared layer, a change to `src/api` or `src/lib/auth`, a new dependency, or anything with `core-review`.

## Reviews

- **One approving review** for most pull requests.
- **Two, one of them a maintainer's,** for `core-review` issues: auth and tokens, page access, payments, deploy or release configuration.
- **Reviewers check** that:
  - the change keeps every rule in [04-module-rules.md](04-module-rules.md);
  - no allowlist grew;
  - the tests ran;
  - the module page and the change tracker are updated when they should be.

## Keeping the docs true

- **Update a page in the same pull request** as the change it describes.
- **When a backend change affects the dashboard,** add or update its row in the [change tracker](06-backend-contract.md#the-change-tracker).
- **If the code and a page disagree,** the automated checks are the rule: fix the page.
