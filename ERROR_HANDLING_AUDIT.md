# Error Handling Production-Readiness Audit

**Date:** 2026-06-17
**Scope:** Global error architecture, security, Next.js integration, telemetry, backward compatibility
**Codebase:** mulearn-dashboard (Next.js App Router + Django backend)

---

## Reasoning Process

### Step 1: Inventory of Error Infrastructure

The codebase has a multi-layered error system:

1. **API Layer**: `ApiError` class (`src/api/errors.ts`) + `extractDjangoMessage()` for parsing Django error envelopes
2. **Client Gateway**: `src/api/client.ts` — handles token refresh, business errors, HTTP errors
3. **Server Gateway**: `src/api/server.ts` — mirrors client pattern for Server Components
4. **Error Boundaries**: Next.js `error.tsx` files at 5 levels + `global-error.tsx`
5. **React Error Boundary**: `AppErrorBoundary` + `withErrorBoundary` HOC using `react-error-boundary`
6. **Error Fallback UIs**: 3 tiers — `GlobalErrorFallback`, `SectionErrorFallback`, `InlineErrorFallback`
7. **Logging Service**: `ErrorLoggingService` singleton with adapter pattern
8. **Toast Error Extraction**: 6 duplicate implementations across features (see Dimension 5)

### Step 2: What's Missing

- `getApiResponseError` in `src/hooks/use-get-error.ts` is **defined but never imported anywhere** — zero usage
- No Sentry/Datadog/LogRocket integration exists — only `console` logging in dev
- No PII masking layer exists
- No global `window.onerror` / `unhandledrejection` handler
- No middleware error handling (middleware.ts not found in src/)
- No Server Actions (`"use server"`) exist in the codebase
- 2 API Route Handlers exist: `/api/log_mismatch` (CRITICAL: unauthenticated filesystem write) and `/api/auth/refresh` (adequate)
- `InlineErrorFallback` renders `err.message` in production with **no** `NODE_ENV` guard
- `DataTableErrorBoundary` renders `error.message` + Zod details in production with **no** `NODE_ENV` guard (used by 8+ feature components)
- 4 section-level `error.tsx` files render `error.message` in production with **no** `NODE_ENV` guard
- Auth tokens stored in non-httpOnly cookies (readable by JS / XSS)
- No `not-found.tsx` at any route level
- No `error.tsx` in `(auth)` or `(onboarding)` route groups
- 4 section error boundaries skip `errorLogger` entirely — errors caught but never logged

### Step 3: Error Pattern Fragmentation

Found **6 distinct error-to-message extraction patterns** across the codebase:

| Pattern | Location | Used By |
|---------|----------|---------|
| `getApiResponseError()` | `src/hooks/use-get-error.ts` | **NOTHING** (dead code) |
| `getOrgErrorMessage()` | `features/organizations/hooks/org-error.ts` | orgs, departments, verification, transfer, affiliations |
| `getTaskErrorMessage()` | `features/tasks/hooks/task-error.ts` | tasks, task-types, task-verification |
| `getErrorMessage()` (events) | `features/events/hooks/events.hooks.ts:23` | events hooks only |
| `getErrorMessage()` (intern) | `features/intern/hooks/use-intern.ts:16` | intern hooks only |
| `getErrorMessage()` (manage-interns) | `features/intern/hooks/use-manage-interns.ts:18` | manage-interns hooks only |
| Raw `error.message` / `err.message` | 30+ hooks & components | everything else |

This means Django's rich error envelope (`{ message: { general: [...] } }`) is **only parsed in orgs and tasks** features. All other features fall back to `ApiError.message` which is the already-extracted string — but miss the `error.data` field-level errors entirely.

---

## Dimension 1: Global Error Architecture & Hydration

**Safety Score: 7/10**

### What Works Well
- Proper `"use client"` directive on all error boundaries
- `global-error.tsx` wraps its own `<html><body>` (correct for root layout crashes)
- 5-level error boundary hierarchy: global → root → dashboard → section → inline
- `AppErrorBoundary` + `withErrorBoundary` HOC available for granular component isolation
- `GlobalErrorFallback` and `SectionErrorFallback` gate debug info behind `NODE_ENV === "development"`
- QueryClient created inside `useState` — avoids SSR singleton leak

### Critical Concerns

| Severity | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| HIGH | `getApiResponseError` is dead code — defined in `src/hooks/use-get-error.ts` but imported by zero files. All 30+ hooks roll their own error extraction, creating 6 duplicate patterns that handle Django errors inconsistently. | `src/hooks/use-get-error.ts:8` | Adopt `getApiResponseError` as the single error extraction utility across all hooks (see Implementation Plan below) |
| MEDIUM | `InlineErrorFallback` renders `err.message` in a tooltip in **production** with no `NODE_ENV` guard. Backend error messages (including Django field names, internal messages) are visible to users. | `src/components/ui/errors/InlineErrorFallback.tsx:33` | Wrap in `process.env.NODE_ENV === "development"` guard, or show a sanitized fallback |
| MEDIUM | No `window.addEventListener("unhandledrejection")` or `window.onerror` handler. Promise rejections outside React tree (setTimeout callbacks, event handlers) go uncaught and unlogged. | N/A | Add global error catcher in root layout or providers that pipes to `errorLogger` |
| LOW | `ReactQueryDevtools` imported unconditionally in `src/app/providers.tsx:13`. While `@tanstack/react-query-devtools` tree-shakes in production builds, explicit lazy-loading is safer. | `src/app/providers.tsx:53` | Wrap in `process.env.NODE_ENV === "development" && <ReactQueryDevtools />` or use `React.lazy` |
| MEDIUM | `DataTableErrorBoundary` (`src/components/dashboard/DataTableErrorBoundary.tsx:52`) renders `error.message` unconditionally in production. Also renders full Zod validation error JSON (lines 57-79) with no NODE_ENV guard. Used by 8 feature components (discord-moderation, organizations, affiliation, ig-request, manage-ig, channels, manage-locations, karma-voucher). | `src/components/dashboard/DataTableErrorBoundary.tsx:52,57-79` | Add `NODE_ENV === "development"` guard around message and Zod block |
| MEDIUM | `DataTableErrorBoundary` uses string matching `error.message.includes("schema mismatch")` for control flow (line 38-39). Fragile — breaks silently if error wording changes. | `src/components/dashboard/DataTableErrorBoundary.tsx:38-39` | Use a custom error subclass (e.g., `SchemaValidationError`) instead of string matching |
| MEDIUM | `DataTableErrorBoundary` uses raw `console.error` instead of centralized `errorLogger` (line 28). Bypasses any production monitoring adapters. | `src/components/dashboard/DataTableErrorBoundary.tsx:28` | Replace with `errorLogger.logError()` |
| MEDIUM | No `error.tsx` in `(auth)` route group. Auth page errors (login, register, forgot-password) fall through to root `error.tsx` showing full-page GlobalErrorFallback with no auth-specific recovery. | `src/app/(auth)/` | Add `src/app/(auth)/error.tsx` with "Return to login" recovery |
| MEDIUM | No `error.tsx` in `(onboarding)` route group. Onboarding errors show generic global error page. | `src/app/(onboarding)/` | Add `src/app/(onboarding)/error.tsx` with onboarding-appropriate recovery |
| LOW | `withErrorBoundary` HOC (`src/lib/error-handling/withErrorBoundary.tsx`) exists but grep shows zero usage across the codebase — dead code. | `src/lib/error-handling/withErrorBoundary.tsx:12` | Either use it to wrap crash-prone feature components or remove it |
| LOW | `global-error.tsx` renders `<html>` and `<body>` with no className, fonts, or theme. When root layout crashes, fallback is completely unstyled. | `src/app/global-error.tsx:21-27` | Add minimal inline styles or font variables from layout.tsx |
| LOW | `DataTableErrorBoundary.handleReset()` calls `window.location.reload()` — hard page reload discarding all client state. | `src/components/dashboard/DataTableErrorBoundary.tsx:33` | Consider removing reload, let setState re-render in place |
| LOW | No hydration mismatch risk found — error state is not stored in any provider/context that renders during SSR. `QueryClient` is client-only via `useState`. `ui-store.ts` uses zustand persist with localStorage but rehydrates after mount via useEffect — no crash-level mismatch. | N/A | No action needed |

### Remediation Plan

1. **[HIGH]** Adopt `getApiResponseError` everywhere → see Implementation Plan (Dimension 5)
2. **[MEDIUM]** Add NODE_ENV guard to `InlineErrorFallback.tsx:33`:
   ```tsx
   // Replace raw message with guarded version
   {process.env.NODE_ENV === "development" ? err.message : "Something went wrong"}
   ```
3. **[MEDIUM]** Add global unhandled rejection catcher in `src/app/providers.tsx`
4. **[LOW]** Conditionally render ReactQueryDevtools

---

## Dimension 2: Security & Information Leakage

**Safety Score: 5/10**

### Critical Concerns

| Severity | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| **CRITICAL** | `src/app/api/log_mismatch/route.ts` — **Unauthenticated, unvalidated filesystem write.** No auth check, no try/catch around `req.json()` (crashes on malformed JSON), no input validation. `fs.writeFileSync` to relative path is path-traversal-adjacent and will fail in read-only deployments. Anyone can POST arbitrary data. | `src/app/api/log_mismatch/route.ts:4-7` | Delete this route entirely (dev-only tool that should never ship) or add auth + input validation + proper logging sink |
| **CRITICAL** | Auth tokens (`accessToken`, `refreshToken`) stored in **non-httpOnly** cookies via `js-cookie`. Any XSS vulnerability allows full token theft. Server-side code in `src/api/server.ts:57` and `src/app/api/auth/refresh/route.ts:43` also set cookies **without httpOnly**. | `src/lib/auth/token-store.ts:22-33`, `src/api/server.ts:57-62`, `src/app/api/auth/refresh/route.ts:43-48` | Migrate token storage to httpOnly cookies set by server-side route handlers. Client-side code should not read/write tokens directly. |
| HIGH | 4 section-level `error.tsx` files render `error.message` unconditionally in production (no `NODE_ENV` guard): company, manage-events, learning-circle, management. Django backend errors containing model names, SQL fragments, or internal paths are shown directly to users. | `src/app/(dashboard)/dashboard/company/error.tsx:42`, `manage-events/error.tsx:26`, `learning-circle/error.tsx:26`, `management/error.tsx:26` | Add `process.env.NODE_ENV === "development"` guard or replace with generic message |
| HIGH | `InlineErrorFallback` renders `err.message` in a tooltip **in production**. No sanitization. | `src/components/ui/errors/InlineErrorFallback.tsx:33` | Guard behind NODE_ENV check |
| HIGH | ~30+ hooks pass raw `error.message` / `err.message` directly to `toast.error()`. These messages come from `ApiError.message` which is the Django backend's raw text (via `extractDjangoMessage`). This can leak internal field names, validation details, and error codes to users. | Multiple — see "Raw error.message" pattern in table above | Use `getApiResponseError` with a fallback for all toast errors |
| MEDIUM | `extractDjangoMessage()` passes through whatever text Django sends — including field names like `muid`, `org_id`, internal validation messages. No sanitization or allowlist. | `src/api/errors.ts:38-92` | This is by design for API errors, but consuming code should not render these raw to end users in production |
| MEDIUM | `ApiError.data` stores the full raw backend response. `use-company-tasks.ts:68` casts it to `Record<string, string[]>` and reads `errData.hashtag` — safe, but pattern encourages accessing raw backend data. | `src/features/company-tasks/hooks/use-company-tasks.ts:68` | Use typed error extraction, not raw `.data` casting |
| LOW | `logSchemaMismatch` in `src/api/errors.ts:28` logs Zod validation issues including field names and values via `console.error` unconditionally (including production). Could log PII if a user-data field fails validation. | `src/api/errors.ts:28` | Redact field values, keep only field names and error types |
| LOW | No XSS via error messages — React's JSX auto-escapes. No `dangerouslySetInnerHTML` found with error content. | N/A | No action needed |

### Remediation Plan

1. **[CRITICAL]** Delete or secure `src/app/api/log_mismatch/route.ts` — this is a production security hole
2. **[CRITICAL]** Migrate to httpOnly cookie-based auth:
   - Create `/api/auth/set-token` API route handler
   - Update `/api/auth/refresh/route.ts` to add `httpOnly: true` to cookie options
   - Set tokens as `httpOnly`, `secure`, `sameSite: "strict"` cookies server-side
   - Remove `js-cookie` direct token access from `token-store.ts`
   - Update `src/api/client.ts` to rely on automatic cookie sending instead of manual `Authorization` header

3. **[HIGH]** Add NODE_ENV guards to all 4 section error.tsx files + InlineErrorFallback + DataTableErrorBoundary
4. **[HIGH]** Standardize all toast errors through `getApiResponseError` (see Implementation Plan)
5. **[MEDIUM]** Add value redaction to `logSchemaMismatch`

---

## Dimension 3: Next.js Feature Integration

**Safety Score: 5/10**

### What Works Well
- Clean App Router architecture — no Pages Router remnants (`getServerSideProps`/`getStaticProps`)
- Server-side auth utilities (`requireAuth`, `requireRole`, `requirePermission`) redirect properly
- `serverApiClient` handles token refresh server-side with cookie persistence
- `/api/auth/refresh/route.ts` has proper try/catch and cleanup
- Error boundary hierarchy covers most route groups

### Critical Concerns

| Severity | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| **CRITICAL** | `src/app/api/log_mismatch/route.ts` — Unauthenticated API route that writes arbitrary POST body to filesystem via `fs.writeFileSync`. No auth, no validation, no try/catch. Crashes on malformed JSON. Arbitrary file content injection. | `src/app/api/log_mismatch/route.ts:4-7` | Delete this route or move behind auth + input validation |
| HIGH | No `middleware.ts` exists in the project root or `src/`. Route protection relies entirely on server-side `requireAuth()`/`requireRole()` in individual page components. If a page forgets to call these, it's unprotected. `route-access.ts` defines a complete route map but nothing consumes it at the middleware level. | `src/lib/auth/route-access.ts` (unused by middleware) | Create `middleware.ts` that reads `routeAccessMap` and enforces auth + RBAC at the edge |
| HIGH | No `not-found.tsx` exists at `src/app/` or `src/app/(dashboard)/` level. Next.js will render its default 404 which doesn't match the app's design system and may leak framework info. | N/A | Add `not-found.tsx` at app root and dashboard level |
| MEDIUM | Server-side `serverApiClient` errors (thrown as `ApiError`) propagate to the nearest `error.tsx` boundary. This works but `ApiError.message` contains raw Django text. In server context, the `error.digest` is a hash, but the `error.message` still reaches the client error boundary. | `src/api/server.ts:161` | Next.js serializes server errors with digest in production, stripping the message. Verify this behavior; if message leaks, wrap server calls in try/catch with sanitized re-throw. |
| MEDIUM | Auth token operations (set, clear) are done client-side via `js-cookie`. `/api/auth/refresh` exists but sets cookies without `httpOnly`. No `/api/auth/set-token` or `/api/auth/logout` route handlers. | `src/app/api/auth/refresh/route.ts:43` | Create full API route handler suite for token management with httpOnly cookies |
| LOW | No Server Actions in the codebase. All mutations go through client-side `apiClient` via React Query `useMutation`. This is a valid pattern but means no `useTransition`/`useActionState` error handling is needed. | N/A | No action needed — current pattern is consistent |
| LOW | `src/api/server.ts:17-22` warns when `BACKEND_URL` is not set, falling back to public URL. In production, server→backend calls going through the public URL adds latency and exposes internal API surface. | `src/api/server.ts:17` | Ensure `BACKEND_URL` is set in production deployment |

### Remediation Plan

1. **[CRITICAL]** Delete `src/app/api/log_mismatch/route.ts` — unauthenticated filesystem write
2. **[HIGH]** Create `middleware.ts` using existing `routeAccessMap` + `findRouteConfig()`
3. **[HIGH]** Add `not-found.tsx` at app root and dashboard layout level
4. **[MEDIUM]** Create `/api/auth/*` route handlers for token management + add `httpOnly` to refresh route
5. **[LOW]** Add deployment check/CI validation for `BACKEND_URL` in production

---

## Dimension 4: Telemetry & Log Masking

**Safety Score: 3/10**

### What Works Well
- `ErrorLoggingService` singleton with adapter pattern is well-designed for extensibility
- All Next.js `error.tsx` boundaries call `errorLogger.logError()`
- `AppErrorBoundary` forwards `componentStack` to logging service
- Console logging gated behind `NODE_ENV === "development"` in the default adapter

### Critical Concerns

| Severity | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| **CRITICAL** | **No production error monitoring exists.** `ErrorLoggingService` only has a `ConsoleLogger` adapter that only logs in development. In production, `errorLogger.logError()` is a **no-op** — errors vanish silently. Comment on line 22 says "wire up a real adapter" but it was never done. | `src/lib/error-handling/error-logging.service.ts:13-23` | Integrate Sentry (or equivalent). Register a `SentryAdapter` that calls `Sentry.captureException()` |
| HIGH | No PII masking layer. When a real monitoring adapter is added, `ErrorLogContext` accepts arbitrary `[key: string]: unknown` which will forward user emails, IDs, tokens if passed in context. | `src/lib/error-handling/error-logging.service.ts:1-5` | Add PII scrubbing before forwarding to adapters — strip emails, tokens, muid from context |
| HIGH | `logSchemaMismatch` (`src/api/errors.ts:28`) logs unconditionally via `console.error` including Zod issue details that may contain user data values. In production SSR, this goes to server logs. | `src/api/errors.ts:28` | Redact field values; only log field paths and error codes |
| HIGH | `console.error` calls in `src/api/client.ts:307-309` and `src/api/client.ts:324-326` log full `rawData` (complete backend response) in development. If `NODE_ENV` check is accidentally removed or misconfigured, this leaks full API responses. | `src/api/client.ts:306-310` | Route through `errorLogger` instead of raw `console.error` |
| MEDIUM | Error logging is synchronous (`adapters.forEach(adapter => adapter.log(...))`). When a real adapter is added (e.g., Sentry HTTP call), this will block rendering. | `src/lib/error-handling/error-logging.service.ts:46-48` | Make logging async: `Promise.allSettled(adapters.map(a => a.log(...)))` or fire-and-forget with `queueMicrotask` |
| MEDIUM | `CompanyError` (`src/app/(dashboard)/dashboard/company/error.tsx:23`) has an empty `useEffect` and does NOT call `errorLogger`. Comment says "already captured by root errorLogger" — but Next.js error boundaries are independent; the dashboard-level `error.tsx` catches first and stops propagation. Error is **not logged**. | `src/app/(dashboard)/dashboard/company/error.tsx:22-25` | Add `errorLogger.logError(error, { context: "CompanyErrorBoundary" })` |
| MEDIUM | Confirmed: manage-events, learning-circle, management error.tsx files have NO errorLogger call and NO useEffect for logging. Errors caught but completely silently dropped. | `manage-events/error.tsx`, `learning-circle/error.tsx`, `management/error.tsx` | Add `errorLogger.logError()` calls to each |
| MEDIUM | `DataTableErrorBoundary` uses raw `console.error` instead of `errorLogger` (line 28). Bypasses production monitoring adapters. Runs unconditionally (no NODE_ENV guard). | `src/components/dashboard/DataTableErrorBoundary.tsx:28` | Replace with `errorLogger.logError(error, { componentStack: errorInfo.componentStack })` |
| HIGH | `src/app/(dashboard)/dashboard/management/manage-interns/tasks/page.tsx` — raw `console.error("Failed to fetch task detail", error)` in production without NODE_ENV guard. Full error object (including `ApiError.data` with user/task data) logged. | `manage-interns/tasks/page.tsx` | Add NODE_ENV guard or replace with errorLogger |
| LOW | No structured error IDs or error codes. All errors are free-text strings from Django. Makes aggregation in monitoring tools difficult. | N/A | Define error code enum or use Django's error codes for grouping |

### Remediation Plan

1. **[CRITICAL]** Integrate Sentry:
   ```ts
   // src/lib/error-handling/sentry-adapter.ts
   import * as Sentry from "@sentry/nextjs";
   
   class SentryAdapter implements LoggerAdapter {
     log(error: Error, context?: ErrorLogContext): void {
       Sentry.captureException(error, { extra: this.scrubPII(context) });
     }
     private scrubPII(ctx?: ErrorLogContext) { /* strip emails, tokens, muid */ }
   }
   ```

2. **[HIGH]** Add PII scrubbing to `ErrorLoggingService.logError()` before dispatching to adapters
3. **[HIGH]** Fix section error boundaries to call `errorLogger.logError()`
4. **[MEDIUM]** Make adapter dispatch async

---

## Dimension 5: Backward Compatibility & Unified Error Extraction

**Safety Score: 4/10**

### What Works Well
- `ApiError` shape (`status`, `message`, `data`) is consistent across both client and server gateways
- `extractDjangoMessage` handles all known Django error envelope formats
- `getApiResponseError` in `use-get-error.ts` is the most complete extraction — handles `ApiError`, plain strings, and generic objects with `.message`

### Critical Concerns

| Severity | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| **CRITICAL** | **6 duplicate error extraction functions** with inconsistent behavior. `getApiResponseError` (most complete) is dead code. `getOrgErrorMessage` and `getTaskErrorMessage` check `extractDjangoMessage(error)` on the raw error THEN `extractDjangoMessage(error.data)` — double extraction. The 3 local `getErrorMessage()` functions and ~30 raw `err.message` usages skip Django envelope parsing entirely, losing field-level validation errors. | See pattern table above | Consolidate to single `getApiResponseError` import everywhere |
| HIGH | Hooks using raw `toast.error(err.message)` bypass Django error extraction. When backend returns `{ message: { general: ["Token expired"] } }`, the `ApiError.message` might be the generic "Request failed: /endpoint" if `extractDjangoMessage` returned null during the API call. Users see unhelpful messages. | 30+ hooks (see list below) | Replace all with `getApiResponseError(error, { fallback: "context-specific message" })` |
| MEDIUM | `getOrgErrorMessage` and `getTaskErrorMessage` are near-identical copies of `getApiResponseError` minus the plain-string and generic-object handling. Maintaining 3 copies means bug fixes must be applied 3 times. | `features/organizations/hooks/org-error.ts`, `features/tasks/hooks/task-error.ts` | Delete these, use `getApiResponseError` |
| MEDIUM | Events and intern features define local `getErrorMessage()` that only check `ApiError.message` and `Error.message` — they skip `extractDjangoMessage(error.data)` entirely. Field-level validation errors from Django are lost. | `features/events/hooks/events.hooks.ts:23`, `features/intern/hooks/use-intern.ts:16`, `features/intern/hooks/use-manage-interns.ts:18` | Delete these, use `getApiResponseError` |
| LOW | `useOrgQueryErrorToast` and `useTaskQueryErrorToast` are thin wrappers that combine extraction + toast. These are fine to keep but should delegate to `getApiResponseError` internally. | `features/organizations/hooks/org-error.ts:23`, `features/tasks/hooks/task-error.ts:23` | Update to use `getApiResponseError` internally |

---

## Implementation Plan: Unified Error Extraction via `getApiResponseError`

### Phase 1: Verify and Adopt `getApiResponseError`

The function at `src/hooks/use-get-error.ts:8` is already production-quality:

```ts
// Already handles: ApiError → extractDjangoMessage(data) → message,
//                  plain string, generic {message} object, fallback
export const getApiResponseError = (error: unknown, options?) => { ... }
```

**No changes needed to `use-get-error.ts` itself.**

### Phase 2: Hook Migration Map

Every hook below needs its `onError` handler updated to use `getApiResponseError`. The `fallback` message should be the context-specific string already present.

#### Pattern A: Raw `err.message` → `getApiResponseError(error, { fallback: "..." })`

| Hook File | Mutations | Current Pattern | New Fallback |
|-----------|-----------|----------------|--------------|
| `features/organizations/hooks/use-organizations.ts` | create, update, delete | `toast.error(err.message)` | "Failed to create/update/delete organization" |
| `features/organizations/hooks/use-affiliations.ts` | create, update, delete | `toast.error(err.message)` | "Failed to create/update/delete affiliation" |
| `features/manage-roles/hooks/use-roles.ts` | create, update, delete | `toast.error(err.message)` | "Failed to create/update/delete role" |
| `features/manage-roles/hooks/use-role-users.ts` | add, remove, bulk-add, bulk-remove | `toast.error(err.message)` | "Failed to manage role users" |
| `features/manage-companies/hooks/use-manage-companies.ts` | verify | `toast.error(err.message)` | "Failed to update company verification" |
| `features/mentor/sessions/hooks/use-sessions.ts` | create, update, delete, action, join, add-participant, update-participant, feedback | `toast.error(err.message ?? "...")` | Keep existing fallback strings |
| `features/mentor/onboarding/hooks/use-onboarding.ts` | submit, update, profile | `toast.error(err.message ?? "...")` | Keep existing fallback strings |
| `features/mentor/hooks/use-session-actions.ts` | accept, decline | `toast.error(err.message ?? "...")` | Keep existing fallback strings |
| `features/mentor/task-requests/hooks/use-task-requests.ts` | withdraw | `toast.error(err.message ?? "...")` | Keep existing fallback strings |
| `features/achievements/hooks/use-achievement-mutations.ts` | 7 mutations | `toast.error(err.message ?? "...")` | Keep existing fallback strings |
| `features/company-jobs/hooks/use-job-mutations.ts` | create, update | `toast.error(err.message ?? "...")` | Keep existing fallback strings |
| `features/company-jobs/hooks/use-company-tasks.ts` | submit, update, delete | `toast.error(err.message ?? "...")` | Keep existing fallback strings |
| `features/company-jobs/hooks/use-apply-job.ts` | apply | `toast.error(error.message)` | "Failed to apply for job" |
| `features/company-jobs/hooks/use-mentor-nominate.ts` | nominate | `toast.error(err.message ?? "...")` | Keep existing fallback |
| `features/company-profile/hooks/use-profile-edit.ts` | update | `toast.error(err.message ?? "...")` | Keep existing fallback |
| `features/settings/hooks/use-change-password.ts` | change | `toast.error(error.message \|\| "...")` | Keep existing fallback |
| `features/role-verification/hooks/use-role-verification.ts` | verify, delete | `toast.error(error.message \|\| "...")` | Keep existing fallback strings |
| `features/ig-requests/hooks/useIGRequestMutations.ts` | submit, cancel | `toast.error(error.message \|\| "...")` | Keep existing fallback strings |
| `features/courses/hooks/useWadhwaniCourses.ts` | enroll | `toast.error(error.message \|\| "...")` | Keep existing fallback |
| `features/profile/hooks/use-profile-mutations.ts` | multiple | mixed patterns | Standardize all |

#### Pattern B: `error instanceof ApiError ? error.message : "fallback"` → `getApiResponseError(error, { fallback: "..." })`

| Hook File | Mutations |
|-----------|-----------|
| `features/notification/hooks/use-notification.ts` | 6 mutations |
| `features/channels/hooks/use-channel-logic.ts` | 3 mutations |
| `features/channels/components/channel-page.tsx` | 3 mutations |
| `features/company-tasks/hooks/use-company-tasks.ts` | 6 mutations |
| `features/karma-voucher/hooks/use-karma-vouchers-mutation.ts` | 3 mutations |
| `features/learning-circle/hooks/use-learning-circle.ts` | ~20 mutations |
| `features/mentor/tasks/hooks/use-mentor-tasks.ts` | 3 mutations |
| `features/projects/components/project-card.tsx` | 2 mutations |

#### Pattern C: Delete local `getErrorMessage()`/`getOrgErrorMessage()`/`getTaskErrorMessage()` → use `getApiResponseError`

| File to Modify | Delete Function | Replacement |
|----------------|-----------------|-------------|
| `features/events/hooks/events.hooks.ts:23` | `getErrorMessage()` | `import { getApiResponseError } from "@/hooks/use-get-error"` |
| `features/intern/hooks/use-intern.ts:16` | `getErrorMessage()` | `import { getApiResponseError } from "@/hooks/use-get-error"` |
| `features/intern/hooks/use-manage-interns.ts:18` | `getErrorMessage()` | `import { getApiResponseError } from "@/hooks/use-get-error"` |
| `features/organizations/hooks/org-error.ts:8` | `getOrgErrorMessage()` | Update `useOrgQueryErrorToast` to use `getApiResponseError` |
| `features/tasks/hooks/task-error.ts:8` | `getTaskErrorMessage()` | Update `useTaskQueryErrorToast` to use `getApiResponseError` |

### Phase 3: Migration Example

**Before** (e.g., `use-learning-circle.ts`):
```ts
onError: (error) => {
  toast.error(
    error instanceof ApiError ? error.message : "Failed to create circle",
  );
},
```

**After**:
```ts
import { getApiResponseError } from "@/hooks/use-get-error";

onError: (error) => {
  toast.error(getApiResponseError(error, { fallback: "Failed to create circle" }));
},
```

**Before** (e.g., `org-error.ts`):
```ts
export function getOrgErrorMessage(error: unknown, fallback: string): string {
  const directMessage = extractDjangoMessage(error);
  if (directMessage) return directMessage;
  if (error instanceof ApiError) {
    const dataMessage = extractDjangoMessage(error.data);
    if (dataMessage) return dataMessage;
    if (error.message) return error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
```

**After**:
```ts
import { getApiResponseError } from "@/hooks/use-get-error";

// Delete getOrgErrorMessage entirely

export function useOrgQueryErrorToast(error: unknown, fallback: string): void {
  useEffect(() => {
    if (!error) return;
    toast.error(getApiResponseError(error, { fallback }));
  }, [error, fallback]);
}
```

### Phase 4: Component Error Message Cleanup

These components render raw `error.message` in production and need guards:

| File | Line | Fix |
|------|------|-----|
| `src/components/ui/errors/InlineErrorFallback.tsx` | 33 | Add `NODE_ENV` guard |
| `src/app/(dashboard)/dashboard/company/error.tsx` | 42 | Add `NODE_ENV` guard |
| `src/app/(dashboard)/dashboard/manage-events/error.tsx` | 26 | Add `NODE_ENV` guard |
| `src/app/(dashboard)/dashboard/learning-circle/error.tsx` | 26 | Add `NODE_ENV` guard |
| `src/app/(dashboard)/dashboard/management/error.tsx` | 26 | Add `NODE_ENV` guard |
| `src/features/mujourney/components/StartLearningTab.tsx` | 74 | Wrap in NODE_ENV guard or use fallback |
| `src/features/mujourney/components/BecomeExpertTab.tsx` | 167 | Wrap in NODE_ENV guard or use fallback |
| `src/features/karma-voucher/components/karma-voucher-page.tsx` | 188 | Wrap in NODE_ENV guard or use fallback |

---

## Summary Scores

| Dimension | Score | Key Risk |
|-----------|-------|----------|
| 1. Error Architecture & Hydration | **6/10** | Dead code, DataTableErrorBoundary leaks, no (auth)/(onboarding) error.tsx, no global rejection handler |
| 2. Security & Information Leakage | **4/10** | Unauthenticated filesystem write API, non-httpOnly token cookies, 8+ components leak error messages in production |
| 3. Next.js Feature Integration | **5/10** | Unauthenticated API route, no middleware.ts, no not-found.tsx |
| 4. Telemetry & Log Masking | **3/10** | Zero production monitoring, no PII masking, 4 section errors + DataTableErrorBoundary not logged |
| 5. Backward Compatibility & Config | **4/10** | 6 duplicate error extractors, inconsistent Django error parsing, string-based error control flow |

**Overall Production Readiness: 4.4/10**

---

## Priority Order for Fixes

### Wave 1 — Critical (Do before launch)
1. **Delete or secure `src/app/api/log_mismatch/route.ts`** — unauthenticated filesystem write (Dim 2, 3)
2. Integrate Sentry/error monitoring (Dim 4)
3. Migrate tokens to httpOnly cookies (Dim 2)
4. Create `middleware.ts` for route protection (Dim 3)
5. Add NODE_ENV guards to all 8+ production error renders (Dim 2)

### Wave 2 — High (First sprint post-launch)
6. Unify all hooks to use `getApiResponseError` (Dim 5) — ~50 files, mechanical change
7. Delete 5 duplicate error extraction functions (Dim 5)
8. Fix section error boundaries + DataTableErrorBoundary to call `errorLogger` (Dim 4)
9. Add `not-found.tsx` pages (Dim 3)
10. Add PII scrubbing to error logging (Dim 4)
11. Add `error.tsx` for `(auth)` and `(onboarding)` route groups (Dim 1)

### Wave 3 — Medium/Low (Following sprints)
12. Add global `unhandledrejection` handler (Dim 1)
13. Create full API route handler suite for auth (Dim 3)
14. Make error logging async (Dim 4)
15. Replace string matching in DataTableErrorBoundary with error subclass (Dim 1)
16. Redact values in `logSchemaMismatch` (Dim 4)
17. Gate raw `console.error` calls behind NODE_ENV across src/ (Dim 4)
18. Clean up dead code: `withErrorBoundary` HOC (Dim 1)
19. Lazy-load ReactQueryDevtools (Dim 1)
20. Add minimal styling to `global-error.tsx` fallback (Dim 1)
