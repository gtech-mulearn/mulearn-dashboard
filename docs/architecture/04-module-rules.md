# Module rules

These are the rules every dashboard change follows, and how each one is checked. The decisions behind them are [ADR-002](adr/ADR-002-feature-anatomy-and-public-surface.md), [ADR-003](adr/ADR-003-import-ratchets.md), [ADR-004](adr/ADR-004-server-state-and-ui-state.md), [ADR-005](adr/ADR-005-parse-at-the-boundary.md) and [ADR-011](adr/ADR-011-flags-for-new-sends.md).

## The anatomy of a feature

```text
src/features/<name>/
  index.ts          the only public surface: what other code may import
  api/              endpoint calls; each parses its response with a schema
    <thing>.api.ts
  schemas/          zod schemas for requests and responses
  hooks/            TanStack Query hooks, and query-keys.ts with the query-key factory
  components/       the feature's UI
  types/            types not derived from schemas (optional)
  utils/            pure helpers used only here (optional)
```

- **`index.ts`** re-exports the hooks, components and types other code needs. Nothing else in the folder is imported from outside it. Most features already have one; `college-levels`, `company-mentors` and `push` will gain one.
- **`api/`** calls the backend only through `src/api` (`apiClient`, `publicApiClient` or `authedFetch`) and paths from the feature's `api/paths.ts`, or from `src/api/endpoints.ts` until its group moves there. Paths other features also use stay in `src/api/endpoints.ts`. Every call parses its response with a schema from `schemas/`.
- **`hooks/query-keys.ts`** exports one factory, used by every query and every invalidation in the feature (names vary today, for example `eventKeys` and `locationQueryKeys`; new factories are named `<name>Keys`) ([ADR-004](adr/ADR-004-server-state-and-ui-state.md)). Most features already have one.
- **`components/`** hold the UI and may use shared components and other features' public surfaces.

## Import rules

1. **Routes** (`src/app/`) import features only as `@/features/<name>`, and shared code freely.
2. **A feature** imports another feature only as `@/features/<name>`, never `@/features/<name>/<anything>`.
3. **Inside a feature,** import with relative paths or `@/features/<own name>/...`.
4. **Shared layers** never import a feature: `src/api`, `src/lib`, `src/hooks`, `src/components` and `src/stores`.
5. **No import cycles** between files.

When two features need the same code, move it down a layer:
- framework-free helpers go to `src/lib`;
- shared hooks go to `src/hooks`;
- shared components go to `src/components`.

Or export it from the owning feature's `index.ts`, if it belongs to that feature.

## Where does my code go?

| I want to | Put it in | Not in |
|---|---|---|
| Add a page | A route under `src/app/`, composing features | Endpoint calls inside the route file |
| Call a backend endpoint | A function in `src/features/<name>/api/`, with its path in the feature's `api/paths.ts` (or `src/api/endpoints.ts` until it has one) and a schema in `schemas/` | A component, or a raw `fetch` |
| Read server data in a component | A hook in `hooks/`, keyed through `<name>Keys` | Component state copied from a query, or an inline key array |
| Keep UI state across components | A Zustand store in `src/stores/` | Server data in Zustand |
| Send a new field or header | The feature's `api/` call, behind a `NEXT_PUBLIC_FEATURE_<NAME>` flag in `config/env.ts` | An ungated change ([ADR-011](adr/ADR-011-flags-for-new-sends.md)) |
| Show an error | The `ApiError` from `src/api`, with its message and request id | Parsing the response's message yourself |
| Share a component | `src/components/` (and the design system once it lands) | Another feature's `components/` folder |
| Check whether a page may open | The route map in `src/lib/auth/route-access.ts` and `requireRole` on the server page, both with a named role group from `src/lib/auth/roles.ts` | Role names written inline, or a check that assumes one role ([ADR-009](adr/ADR-009-page-access.md)) |

## Server state and keys

- One query-key factory per feature, for example `eventKeys.list(params)` and `eventKeys.detail(id)`.
- A mutation invalidates the narrowest keys that changed, through the factory.
- No server data is copied into Zustand or component state.

## Naming

- Feature folders use kebab case (`learning-circle`). Files use kebab case with a role suffix where the folder already uses one (`tasks.api.ts`, `task.schema.ts`).
- Hooks start with `use`, query-key factories end with `Keys`, and schemas end with `Schema`.

## How CI enforces each rule

Every rule is a failing check on pull requests. Code that already breaks a rule sits on a **shrink-only list**: a new offender fails, and so does a stale entry, so the lists only get shorter.

| Rule | Check | Where |
|---|---|---|
| Lint and formatting | `bun run lint` (Biome) | CI today |
| Types | `bun run typecheck` | CI today |
| The app builds | `bun run build` | CI today |
| Tests pass, apart from known failures | `bun run test` against a baseline | A new `test` script and a new `scripts/check-test-baseline.ts`, with the list in a new `scripts/allowlists/test-baseline.txt` |
| No new imports into another feature's internals | an import scan over `src/` | A new `scripts/check-feature-imports.ts`, with the list in a new `scripts/allowlists/feature-imports.txt` |
| No new import cycles | madge (`bun run lint:circular`) compared with a baseline | A new `scripts/check-import-cycles.ts`, with the list in a new `scripts/allowlists/import-cycles.txt` |
| Every feature has an `index.ts` | the import scan | The same new feature-imports check |
| Shared layers never import a feature | the import scan | The same new feature-imports check |
| No new inline query keys | a scan for `queryKey` arrays written in place | A new `scripts/check-query-keys.ts`, with the list in a new `scripts/allowlists/query-keys.txt` |
| New sends are behind a flag | review, plus the flag being validated in `config/env.ts` | Pull-request review |
| Bundle size stays within budget | a size report on the build | A CI step added by the bundle-budget issue |

The issues that add each check are in [github-issues/](github-issues/README.md).
