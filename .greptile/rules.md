# muLearn Dashboard — PR Review Rules

These rules encode how this repository is actually built. They exist to protect the
patterns that already work here and to catch the regressions that have actually hurt
us. Enforce them on real PRs. If a comment would not change a senior reviewer's
approve/request-changes decision, do not leave it.

When reviewing, never look at changed lines in isolation. This is a feature-sliced app
with shared infrastructure (`src/api`, `src/lib/auth`, `src/components/ui`,
`src/stores`). A change to any shared module must be traced to every feature that
imports it.

---

## 1. Repository Overview

muLearn Dashboard is the role-based web client for the muLearn community platform. It
serves many distinct personas (students, campus leads, enablers, mentors, companies,
interns, zonal/district leads, and admins) from a single Next.js App Router application,
talking to a Django REST backend.

The app is large (~1,100 TS/TSX files, ~40 feature slices) but highly regular: every
feature follows the same `api → schemas → hooks → components` shape, all server state
flows through TanStack Query, and all access control derives from a single role/permission
source of truth. Reviews should hold new code to that existing regularity.

---

## 2. Detected Stack (the only stack — do not introduce alternatives)

| Concern | Technology | Notes |
|---|---|---|
| Framework | **Next.js 16** (App Router) | Edge route protection lives in `src/proxy.ts` (Next 16 `proxy`, **not** `middleware.ts`). |
| Language | **TypeScript** (`strict: true`) | Path aliases `@/*` → `src/*`, `config/*` → `config/*`. |
| UI runtime | **React 19** | |
| Server state | **TanStack Query v5** | The only data-fetching/cache layer. |
| Client/UI state | **Zustand v5** | UI-only state (`src/stores`). Not for server data. |
| Validation | **Zod v4** | Request/response schemas live in each feature's `schemas/`. |
| Forms | **react-hook-form** + `@hookform/resolvers` (zod) | |
| UI primitives | **Radix UI** + shadcn-style components in `src/components/ui` | |
| Variants | **class-variance-authority (CVA)** + `cn()` (`clsx` + `tailwind-merge`) | |
| Styling | **Tailwind CSS v4** (CSS-first) | Design tokens are CSS variables in `src/app/globals.css`. |
| Icons | **lucide-react** | |
| Charts | **recharts** (themed via `src/components/charts/chart-theme.tsx`) | |
| Notifications | **sonner** (`toast`) | |
| Error monitoring | None — adapter seam in `src/lib/error-handling` (no remote adapter registered) | |
| Env | **@t3-oss/env-nextjs** (`config/env.ts`) | Validated, typed env access. |
| Tooling | **Biome** (format + lint), **Vitest** + Testing Library | |
| Package manager | **Bun** | Node/npm are not supported (see CONTRIBUTING). |
| Release | **Changesets**, Conventional Commits (commitlint), Husky | |

Do **not** suggest Redux, axios, SWR, styled-components, a different table/forms/validation
library, or `middleware.ts`. They are not used here and a PR adding one is an architecture
violation, not an improvement.

---

## 3. Architecture Rules

**Feature-slice boundaries are real boundaries.** Every feature lives in
`src/features/<feature>/` with this internal shape:

```
features/<feature>/
  api/        # functions that call apiClient/publicApiClient
  schemas/    # zod schemas + inferred types
  hooks/      # TanStack Query hooks + query-key factory
  components/ # feature UI
  types/      # (optional) non-zod types
  constants/  # (optional)
  index.ts    # public barrel — the ONLY supported import surface
```

- **HIGH — Respect the public barrel.** Other features and pages must import from
  `@/features/<feature>` (the `index.ts` barrel), not from internal files like
  `@/features/<feature>/hooks/use-x`. Flag deep cross-feature imports. (The one
  sanctioned exception in the codebase — `use-session` re-exporting `useUserProfile`
  from the profile feature — is done specifically to keep a single query key; new code
  should not reach past barrels.)
- **HIGH — No cross-feature reach-in.** A feature must not import another feature's
  `api/`, `hooks/`, or `schemas/` internals. If two features need the same thing, it
  belongs in `src/lib`, `src/components/ui`, `src/hooks`, or `src/api`.
- **MEDIUM — Layer direction.** Data flows `api → hooks → components`. Components must
  not call `fetch`/`apiClient` directly; they consume hooks. API functions must not
  import React.
- **MEDIUM — Pages stay thin.** `src/app/**` route files compose feature components and
  handle routing/params. Business logic and data fetching belong in the feature, not in
  `page.tsx`.
- **Shared vs feature code:** truly reusable UI → `src/components/ui`; dashboard
  chrome/tables → `src/components/dashboard`; cross-cutting logic (auth, errors, utils)
  → `src/lib`; shared hooks → `src/hooks`. Do not duplicate these inside a feature.

---

## 4. API Integration Rules

The API layer is centralized and opinionated. Treat deviations as bugs.

- **CRITICAL — All backend URLs live in `src/api/endpoints.ts`.** No hardcoded
  `/api/v1/...` paths anywhere else. New endpoints are added to the `endpoints` object
  and referenced by name. (Social-link builders, asset URLs, and external services like
  QuickChart/opensheet are not backend endpoints and are exempt — but anything hitting
  the Django API must come from `endpoints`.)
- **CRITICAL — Use the gateways, never raw `fetch` to the backend.**
  - `apiClient` — authenticated calls (attaches Bearer token, refreshes on expiry,
    redirects to `/login` on hard auth failure).
  - `publicApiClient` — unauthenticated calls.
  - `authedFetch` — only for multipart/streaming callers that manage their own body.
  A new `fetch(\`${API_BASE}...\`)` in a feature bypasses token refresh, error
  normalization, and schema validation. Flag it.
- **HIGH — Pass the Zod schema to the gateway.** `apiClient.get(endpoint, Schema)` /
  `.post(endpoint, body, Schema)`. The client validates and unwraps the Django envelope
  (`{ hasError, statusCode, message, response }`). Skipping the schema means silent shape
  drift. Schema mismatches are logged via `logSchemaMismatch`; do not silence that.
- **HIGH — Surface errors through the standard path.** Mutations report failures with
  `toast.error(getApiResponseError(error, { fallback: "..." }))`. Always provide a
  human-readable `fallback`. Do not swallow errors, do not `alert()`, do not invent a new
  error-display mechanism. `getApiResponseError` already understands `ApiError` and
  Django's `{ message: { general: [...] } }` / field-error envelope.
- **HIGH — Don't re-handle auth/401.** Token expiry, refresh-retry, and logout redirect
  are handled inside `src/api/client.ts`. Feature code must not implement its own 401
  handling or token refresh. Use `skipAuthRedirectOn403: true` only when a 403 is a
  legitimate business response that the UI handles inline.
- **MEDIUM — Type request bodies and responses.** Avoid `apiClient.post<any>`. Use the
  inferred schema type.

---

## 5. State Management Rules

- **CRITICAL — Server data belongs to TanStack Query, not Zustand or `useState`.** Do not
  copy query results into local/global state. The only acceptable local copy is a
  *temporary, user-editable* draft (e.g. a form being edited before submit). Mirroring
  server data into state causes the stale-UI/sync bugs this codebase has deliberately
  avoided.
- **HIGH — Every query uses a query-key factory.** Each feature defines
  `<feature>Keys` (e.g. `courseKeys`, `authKeys`) in `hooks/query-keys.ts`. Use it; do
  not inline ad-hoc string arrays like `["channels", params]` in new code, and never use
  the same key string in two places without the factory. Mismatched keys silently break
  cache invalidation.
- **HIGH — Mutations invalidate the right keys.** After a successful create/update/delete,
  invalidate the affected list/detail keys via `queryClient.invalidateQueries`. A mutation
  that changes server data but invalidates nothing (so the table doesn't update) is a bug.
  Conversely, flag invalidation of keys that don't exist (dead invalidations).
- **HIGH — `enabled` guards dependent queries.** When a query depends on another query's
  output (e.g. a token), it must use `enabled: !!dependency` and a key that includes the
  dependency — see `useOpenGradCourses`/`useWadhwaniCourses`. Don't fire requests with
  `undefined` params.
- **MEDIUM — Zustand is UI-only.** `src/stores` holds sidebar/banner/ephemeral UI state
  with `persist` + `partialize`. Do not add server data, auth tokens, or per-request data
  to a store. Don't add a new global store for something that is local component state.
- **MEDIUM — Auth state comes from `useUserInfo()` / `usePermissions()`**, not from a
  hand-rolled context or store. Tokens live in cookies via `authStore` (`src/lib/auth`).

---

## 6. Authentication & Authorization Rules (highest-risk area)

RBAC is a 4-layer system; understand which layer a change touches.

1. `src/proxy.ts` (edge) — blocks unauthorized **route renders**, decodes (does not
   verify) the JWT, runs token recovery/refresh.
2. Server components — `requireRole()` (`src/lib/auth/server.ts`).
3. `<RoleGate>` / `usePermissions()` (client) — **UX only**: shows/hides UI.
4. Django backend — the only real security boundary.

- **CRITICAL — Roles and permissions have one source of truth.**
  - Role string constants: `src/lib/auth/roles.ts` (these MUST match the Django
    `RoleType` enum exactly — never hardcode a role string like `"Admins"` in a
    component).
  - Permission → roles map: `src/lib/auth/permissions.ts`.
  - Route → roles map: `src/lib/auth/route-access.ts`.
  A new gated page must add an entry to `route-access.ts`; new UI gating uses an existing
  or new `PERMISSIONS` key. Scattering raw role checks across components is a regression.
- **CRITICAL — Client gating is not security.** `<RoleGate>` and `usePermissions()` only
  hide UI. Never treat them as access control for sensitive data — the backend enforces
  that. But also: any new protected route MUST be added to `route-access.ts`, or it is
  reachable by URL.
- **HIGH — Prefer permissions over raw roles.** Use `<RoleGate permission="...">` /
  `usePermissions().can(...)`. Use `allowedRoles` only when no permission key fits.
  Dynamic per-IG/per-campus roles (`"{code} IGLead"`, `"{code} CampusLead"`) must go
  through the existing `DYNAMIC_PERMISSION_CHECKS` / `dynamicCheck` predicates, not
  bespoke `.endsWith(" IGLead")` strings sprinkled in components.
- **HIGH — Don't break the token-refresh/loop-prevention logic.** `src/proxy.ts` contains
  carefully reasoned handling of present-but-expired access tokens (to avoid the
  `/login ⇄ /dashboard` redirect loop). Changes here need explicit justification and must
  preserve the recovery-before-render behavior. The same applies to the refresh-retry
  branches in `src/api/client.ts`.
- **HIGH — Cookie/token handling stays in `authStore`.** Don't read/write `accessToken`,
  `refreshToken`, or `isAuthenticated` cookies directly from features. Note the repo's
  forbidden-pattern gate blocks `localStorage.setItem`/`sessionStorage.setItem` — tokens
  are cookie-based by design.

---

## 7. Component Rules

- **HIGH — No business logic or API calls inside presentational components.** Fetching,
  mutations, and derived domain logic live in hooks (see the `useChannelLogic`-style
  container-hook pattern). Components render hook output.
- **MEDIUM — `"use client"` only when needed.** Add it for components using hooks, state,
  effects, or browser APIs. Don't add it to components that could stay server components,
  and don't push `"use client"` up to a layout/page when a leaf needs it.
- **MEDIUM — Split components that mix many responsibilities** only when there is a
  concrete reason (reuse, a genuinely separable concern). Do not demand splitting working,
  cohesive components for arbitrary line counts.
- **MEDIUM — Effects: correct deps and cleanup.** Event listeners, intervals, and
  subscriptions (as in `useAuth`, `Table`) must be cleaned up. Flag missing cleanup,
  obviously wrong dependency arrays, and effects that cause render loops — not honest,
  correct effects.
- **LOW — Reuse existing UI.** Before a new button/dialog/input/table, check
  `src/components/ui` and `src/components/dashboard`. A duplicate `<Dialog>` or a second
  bespoke table is a maintainability cost.

---

## 8. UI Consistency & Design System Rules

- **HIGH — Use design tokens, not hardcoded colors.** Colors are CSS variables defined in
  `src/app/globals.css` and exposed as Tailwind classes: `brand-blue`, `brand-purple`,
  `muted`, `muted-foreground`, `destructive`, `success`, `warning`, `border`, `card`,
  `foreground`, etc. Flag raw hex (`#2e85fe`) or arbitrary `text-[...]`/`bg-[...]` color
  values where a token exists. This is what keeps light/dark mode working.
- **HIGH — Don't break dark mode.** Both `:root` and `.dark` define every token. New
  surfaces must use tokens (`bg-card`, `text-foreground`, `border-border`) so they theme
  automatically. Hardcoded light-only colors are a regression.
- **MEDIUM — Compose styles with `cn()` and CVA.** Variant components (like
  `button.tsx`) use `cva` with a `variants`/`defaultVariants` shape; extend variants
  there rather than overriding with long `className` overrides at call sites. Use `cn()`
  to merge classes (it dedupes via `tailwind-merge`).
- **MEDIUM — Tables go through the shared `Table` component**
  (`src/components/dashboard/table/Table.tsx`) with its `columnOrder`/`wrap`/action props
  and the paired pagination/search components. Don't hand-roll a new `<table>` for list
  views. (Note: `@tanstack/react-table` is a dependency but currently unused — do not
  introduce it in a one-off; match the existing prop-driven `Table`.)
- **MEDIUM — Loading and empty states are expected.** List/detail views render a skeleton
  or `Loader` while `isLoading`, and an explicit empty state when there's no data (the
  shared `Table` already does the latter). A new data view with no loading/empty handling
  is incomplete.
- **LOW — Icons from lucide-react; toasts from sonner.** Match existing usage.

---

## 9. Type Safety Rules

- **HIGH — No `@ts-ignore` / `@ts-expect-error`.** These are blocked by the pre-commit
  forbidden-pattern scan; a PR reintroducing them must not merge.
- **HIGH — Derive types from Zod schemas.** Prefer `z.infer<typeof XSchema>` and the
  feature's exported types over re-declaring shapes. Duplicate hand-written interfaces
  for data that already has a schema drift out of sync — flag them.
- **MEDIUM — Avoid `any`; justify the rare exception.** The codebase keeps `any` usage
  low. Reach for `unknown` + narrowing (the API client narrows `unknown` responses this
  way). Don't approve a new `any` that erases a known type or a response shape.
- **MEDIUM — Handle nullable/optional fields.** Backend fields are frequently optional;
  don't assume presence. Respect `?`/`| null` in schemas before dereferencing.
- **LOW — Don't over-engineer types.** Inference is fine where it's clear; do not demand
  elaborate generics for simple props.

---

## 10. Performance Rules

Only raise performance comments with concrete, this-PR evidence. Do **not** ask for
`useMemo`/`useCallback`/`React.memo` by default.

- **MEDIUM — Don't fire redundant requests.** A dependent query without `enabled`, or two
  hooks fetching the same endpoint under different keys (the kind of duplicate
  `user-profile` request `use-session` was refactored to remove), is a real waste — flag
  it with the specific call sites.
- **MEDIUM — Expensive work in render.** Heavy transforms/sorts over large lists computed
  inline on every render (and the table/list feeds here can be large) warrant `useMemo` —
  name the data and why it's expensive.
- **LOW — Stable callbacks where it matters.** Suggest `useCallback`/memoization only when
  a callback feeds a memoized child or a large mapped list and you can point to the
  re-render it causes. The existing container-hooks already do this where it counts.
- Don't flag micro-optimizations on small, static, or one-render components.

---

## 11. Accessibility Rules

Report real user impact only.

- **HIGH — Interactive controls must be reachable and labeled.** Icon-only buttons need an
  `aria-label` (the shared `Table` action buttons set this — match it). Clickable
  elements should be real `<button>`/`<a>`, not `onClick` on a `<div>`.
- **MEDIUM — Forms are labeled.** Inputs need associated `<label>`s (the `Form`/`Label`
  primitives wire this up); error messages must be perceivable, not color-only.
- **MEDIUM — Semantic HTML and dialog focus.** Use Radix primitives (`Dialog`, `Select`,
  etc.) which handle focus trap/escape/aria — don't replace them with bare divs that lose
  keyboard support. Headings should be hierarchical.
- Skip decorative-only and trivially-correct cases; don't pad reviews with generic a11y
  notes.

---

## 12. Testing Expectations

Testing here is targeted, not blanket (Vitest + Testing Library; current tests cover
policy/logic/utils and `proxy`).

- **HIGH — Cover non-trivial pure logic and policy.** New permission/route logic, data
  transforms, and reducers/policies (mirroring `events.policy.test.ts`,
  `proxy.test.ts`, `markdown.test.ts`) should ship with tests. Regression fixes should add
  a test reproducing the bug.
- **MEDIUM — Test complex hooks and access control**, especially anything touching auth,
  roles, or money/credential-like flows.
- **Do not** demand tests for styling changes, static markup, simple wiring, or generated
  files. Absence of a component snapshot test is not a blocker here.

---

## 13. Repository-Specific Anti-Patterns (flag on sight)

1. Raw `fetch` to the Django API instead of `apiClient`/`publicApiClient`/`authedFetch`.
2. A hardcoded `/api/v1/...` URL outside `src/api/endpoints.ts`.
3. Calling `apiClient` directly from a component instead of a feature hook.
4. Server data copied into `useState`/Zustand and manually kept in sync.
5. A mutation that doesn't invalidate (or invalidates the wrong/nonexistent) query keys.
6. Inline query-key arrays instead of the feature's `<feature>Keys` factory.
7. Deep imports across feature boundaries (bypassing `index.ts` barrels).
8. Hardcoded role strings (`"Admins"`, `"Mentor"`) or bespoke `.endsWith(" IGLead")`
   checks instead of `ROLES`, `PERMISSIONS`, `usePermissions`, `<RoleGate>`.
9. A new protected route not added to `route-access.ts`.
10. Re-implementing 401/token-refresh/logout logic in a feature.
11. Hardcoded hex colors / arbitrary color values where a design token exists; light-only
    styling that breaks dark mode.
12. `@ts-ignore`, `@ts-expect-error`, `console.log`, `localStorage.setItem`,
    `sessionStorage.setItem` (all blocked by the pre-commit gate — never approve a
    reintroduction).
13. Swallowed errors / missing `toast.error(getApiResponseError(...))` on mutation
    failure; missing loading or empty states on a new data view.
14. A new dependency that duplicates existing capability (table, forms, validation, http,
    state).

---

## 14. PR Review Checklist

Severity legend — **CRITICAL**: broken user flow, security, auth, data corruption ·
**HIGH**: architecture/regression/state-or-data handling · **MEDIUM**: proven
maintainability/edge cases · **LOW**: small, clear-benefit improvements. Prefer a few
high-value comments over many small ones.

**Cross-feature impact (do this first)**
- [ ] If a shared module changed (`src/api/*`, `src/lib/auth/*`, `src/components/ui/*`,
      `src/stores/*`, shared hooks), every importing feature was checked for breakage.
- [ ] Prop/behavior changes to shared components (esp. `Table`, `Button`, dialogs) were
      verified against all call sites.
- [ ] Schema/type changes were propagated everywhere the type is consumed.

**API & data**
- [ ] New endpoints added to `endpoints.ts`; calls go through the gateways with a Zod
      schema.
- [ ] Mutations invalidate the correct query keys; queries use the key factory and
      `enabled` for dependencies.
- [ ] Errors surface via `toast.error(getApiResponseError(error, { fallback }))`; loading
      and empty states exist.

**Auth & access**
- [ ] Roles/permissions/routes use the single sources of truth; new protected routes are
      in `route-access.ts`.
- [ ] No client-side gate is mistaken for security; proxy/refresh logic preserved.

**State & components**
- [ ] No server data duplicated into local/global state.
- [ ] Logic lives in hooks; components render; `"use client"` used only where needed.

**UI & types**
- [ ] Design tokens used (dark mode intact); existing UI primitives reused.
- [ ] No `any`/`@ts-*` suppressions; types derived from schemas.

**Hygiene**
- [ ] No forbidden patterns; Biome/typecheck clean.
- [ ] Conventional commit; changeset included for user-facing `feat`/`fix`/`perf`.
- [ ] Tests added for new logic/policy/regression fixes.
