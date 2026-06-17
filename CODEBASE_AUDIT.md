# Full Codebase Audit — mulearn-dashboard

**Date:** 2026-06-17
**Codebase:** Next.js 16 App Router + Django backend + React Query + shadcn/ui
**Auditors:** 6 parallel analysis passes (security, perf, UX, data, hooks, components)

---

## Executive Summary

| Area | Score | Critical | High | Medium | Low |
|------|-------|----------|------|--------|-----|
| Security & Auth | **3/10** | 4 | 4 | 5 | 4 |
| Error Handling | **4/10** | 1 | 5 | 6 | 4 |
| Performance & Bundle | **4/10** | 1 | 5 | 6 | 3 |
| Data & API | **5/10** | 1 | 3 | 8 | 5 |
| UX & Content | **5/10** | 0 | 3 | 6 | 5 |
| Architecture & Types | **5/10** | 0 | 3 | 5 | 4 |
| SEO & Discoverability | **2/10** | 3 | 4 | 6 | 2 |
| **TOTAL** | **4.0/10** | **10** | **27** | **42** | **27** |

**Overall: 106 findings. 10 critical, 27 high.**

---

## CRITICAL (7)

```
[CRITICAL] [SECURITY] src/app/api/log_mismatch/route.ts:4-8
  Unauthenticated arbitrary filesystem write. No auth, no validation, no try/catch.
  Anyone can POST arbitrary data to server disk. Crashes on malformed JSON.
  FIX: Delete this route entirely or add auth + input validation.

[CRITICAL] [SECURITY] src/lib/auth/token-store.ts:20-29
  Auth tokens in non-httpOnly cookies via js-cookie. Any XSS steals all tokens.
  Server-side cookie sets (server.ts:57, refresh/route.ts:43) also lack httpOnly.
  FIX: Move token storage to httpOnly cookies via server-side Route Handler.

[CRITICAL] [SECURITY] src/app/(dashboard)/dashboard/management/**
  ALL admin/management pages lack server-side authorization. No requireAuth(),
  requireRole(), or requirePermission() calls. Only manage-events/page.tsx calls
  requireAuth(). Middleware JWT decode has NO signature verification (proxy.ts:85).
  Crafted JWT with admin roles bypasses middleware and renders admin pages.
  FIX: Add await requireRole([ROLES.ADMIN]) to every admin page server component.

[CRITICAL] [SECURITY] src/api/client.ts:195-289
  Token refresh has no mutex/deduplication. Concurrent 401s each independently
  call refreshAccessToken(). Backend may invalidate old refresh token on first
  use, causing all but first to fail → spurious logout.
  FIX: Add shared refreshPromise so concurrent 401s share single refresh call.

[CRITICAL] [ERROR] src/hooks/use-get-error.ts:8
  getApiResponseError defined but imported by ZERO files. 185 error handlers
  across codebase use 6 different duplicate patterns. 0 use the canonical helper.
  FIX: Adopt getApiResponseError everywhere (see Error Handling section).

[CRITICAL] [PERF] src/features/campus-manage/components/campus-manage-dashboard.tsx
  2,326 lines in single component. Impossible to code-split, maintain, or
  optimize re-renders. 6 more page.tsx files exceed 600 lines.
  FIX: Split into 8-10 smaller components.

[CRITICAL] [TELEMETRY] src/lib/error-handling/error-logging.service.ts:13-23
  Zero production error monitoring. ConsoleLogger only logs in development.
  In production, errorLogger.logError() is a no-op — errors vanish silently.
  FIX: Integrate Sentry/Datadog. Register production adapter.

[CRITICAL] [SEO] src/app/ — No sitemap.ts or sitemap.xml.
  Search engines cannot discover pages. Zero crawl guidance.
  FIX: Create src/app/sitemap.ts with dynamic route generation.

[CRITICAL] [SEO] src/app/ — No robots.ts or robots.txt.
  No crawl directives, no sitemap pointer. Bots crawl blindly.
  FIX: Create src/app/robots.ts with allow/disallow rules + sitemap URL.

[CRITICAL] [SEO] src/app/layout.tsx:22-37 — No metadataBase configured.
  Without metadataBase, canonical URLs, Open Graph URLs, and Twitter card URLs
  cannot be auto-generated. All relative metadata URLs resolve to nothing.
  FIX: Add metadataBase: new URL("https://app.mulearn.org") to root layout metadata.
```

---

## HIGH (23)

### Security & Auth

```
[HIGH] [SECURITY] next.config.ts
  No security headers. No CSP, X-Frame-Options, X-Content-Type-Options,
  HSTS, Referrer-Policy, or Permissions-Policy anywhere.
  FIX: Add headers() to next.config.ts with all security headers.

[HIGH] [SECURITY] src/app/api/auth/refresh/route.ts:24,50
  Open redirect via ruri parameter. User-controlled returnPath used in
  new URL(`/${returnPath}`, request.url). Protocol-relative URLs bypass.
  FIX: Validate returnPath starts with allowed prefix, no //, no \.

[HIGH] [SECURITY] No CSRF protection mechanism. sameSite: strict cookies
  may not apply to cross-origin API requests (frontend → Django).
  FIX: Confirm backend validates Authorization header, not cookies.

[HIGH] [SECURITY] src/app/(dashboard)/dashboard/changelog/page.tsx:18
  ReactMarkdown without rehype-sanitize. Other markdown renderers use it.
  FIX: Add rehypePlugins={[rehypeSanitize]}.
```

### SEO & Discoverability

```
[HIGH] [SEO] src/app/layout.tsx — Missing Open Graph metadata.
  No og:image, og:url, og:type, og:locale. Shared links show no preview.
  FIX: Add openGraph object with image, url, type, locale, siteName.

[HIGH] [SEO] src/app/layout.tsx — Missing Twitter Card metadata.
  No twitter:card, twitter:image, twitter:creator. No Twitter/X previews.
  FIX: Add twitter object with card:"summary_large_image", image, creator.

[HIGH] [SEO] 82 of 110 page.tsx files (75%) missing metadata export.
  Browser tab shows generic "muLearn Dashboard" everywhere. No per-page
  title/description for search indexing. Missing: root page, login, register,
  forgot-password, changelog, jobs, district, profile, leaderboard, +72 more.
  FIX: Add metadata exports to all public-facing pages minimum.

[HIGH] [SEO] 78 of 110 pages (71%) lack any heading hierarchy (h1-h6).
  No semantic heading structure for screen readers or search crawlers.
  Missing on: root page, login, register, leaderboard, profile, +73 more.
  FIX: Add proper h1 per page, maintain h1→h2→h3 hierarchy.
```

### Error Handling

```
[HIGH] [ERROR] 19 components render error.message in production DOM without NODE_ENV guard:
  - src/components/ui/errors/InlineErrorFallback.tsx:33
  - src/components/dashboard/DataTableErrorBoundary.tsx:52,62-77
  - src/app/(dashboard)/dashboard/company/error.tsx:40-43
  - src/app/(dashboard)/dashboard/manage-events/error.tsx:24-27
  - src/app/(dashboard)/dashboard/learning-circle/error.tsx:24-27
  - src/app/(dashboard)/dashboard/management/error.tsx:24-27
  - src/app/(dashboard)/dashboard/company/jobs/page.tsx:68-70
  - src/app/(dashboard)/dashboard/company/jobs/[jobId]/page.tsx:91-93
  - src/app/(dashboard)/dashboard/company/jobs/[jobId]/edit/page.tsx:107-109
  - src/app/(dashboard)/dashboard/company/analytics/page.tsx:195,338,599,854
  - src/features/events/components/manage-event-detail-view.tsx:209
  - src/features/events/components/event-detail-view.tsx:39
  - src/features/events/components/manage-events-dashboard.tsx:252-254
  - src/features/mujourney/components/BecomeExpertTab.tsx:167
  - src/features/mujourney/components/StartLearningTab.tsx:74
  - src/features/company-jobs/components/company-status-guard.tsx:49-51
  FIX: Add process.env.NODE_ENV === "development" guard on all.

[HIGH] [ERROR] 185 error handlers, 0 use getApiResponseError. Breakdown:
  - 65 use error instanceof ApiError ? error.message : "fallback"
  - 50 use duplicate local helpers (getOrgErrorMessage/getTaskErrorMessage/getErrorMessage)
  - 42 use raw err.message with/without fallback
  - 12 use raw err.message with NO fallback
  - 10 use hardcoded strings ignoring error
  - 6 other (console-only, empty, custom deep access)
  FIX: Replace all with getApiResponseError(error, { fallback: "..." }).

[HIGH] [ERROR] 4 section error boundaries + DataTableErrorBoundary skip errorLogger.
  Errors caught but silently dropped — never logged.
  FIX: Add errorLogger.logError() calls.

[HIGH] [ERROR] No PII masking. ErrorLogContext accepts arbitrary [key: string]: unknown.
  When Sentry is added, user emails/tokens/muid will flow to external service.
  FIX: Add PII scrubbing before dispatching to adapters.

[HIGH] [ERROR] No error.tsx in (auth) or (onboarding) route groups.
  Auth/onboarding errors show generic GlobalErrorFallback with no contextual recovery.
  FIX: Add error.tsx with appropriate recovery UI.
```

### Performance & Bundle

```
[HIGH] [BUNDLE] 20+ feature barrel files use export * re-exports.
  When any consumer imports one symbol, bundler pulls entire feature module.
  FIX: Use named exports or direct path imports.

[HIGH] [BUNDLE] package.json:44 - Monolithic "radix-ui" AND individual @radix-ui/react-* both installed.
  Duplicates Radix primitives in bundle.
  FIX: Remove "radix-ui", keep individual packages.

[HIGH] [BUNDLE] recharts (~300KB gzipped) statically imported in 8+ files.
  framer-motion (~50KB), react-markdown (~40KB) also static.
  FIX: Dynamic import with next/dynamic({ ssr: false }).

[HIGH] [PERF] 31 of 110 page.tsx files use "use client" at top level.
  Prevents SSR entirely for those routes.
  FIX: page.tsx should be server component that renders *Client.tsx.

[HIGH] [DATA-FETCH] 92 inline query key strings vs 10 features using factories.
  FIX: Create query-keys.ts factories for all features.
```

### Data & API

```
[HIGH] [API] src/features/organizations/api/transfer.api.ts:29
  `{ params: { source_org } } as any` — params field doesn't exist on ClientOptions.
  Query param silently never sent. Transfer feature is broken.
  FIX: Append ?source_org=... to URL string.

[HIGH] [REACT-QUERY] src/features/auth/hooks/use-google-login.ts:43-100
  useQuery for side-effectful operation (set tokens, navigate, clear cache).
  Queries re-execute on window focus / mount → duplicate OAuth exchanges.
  FIX: Refactor to useMutation triggered once on mount.

[HIGH] [SCHEMA] 40 instances of z.any() across schemas.
  Mutation response schemas accept anything, defeating runtime validation.
  FIX: Define actual expected response shapes.
```

### UX & Content

```
[HIGH] [META] 47+ pages missing metadata (title/description).
  Browser tab shows "muLearn Dashboard" for everything.
  FIX: Add metadata exports to all pages.

[HIGH] [MISSING-PAGE] No not-found.tsx at any route level.
  Invalid URLs show default Next.js 404.
  FIX: Add not-found.tsx at src/app/, src/app/(dashboard)/, src/app/(auth)/.

[HIGH] [FORMS] 9 forms with useForm but no Zod schema resolver.
  No client-side validation beyond HTML required attributes.
  FIX: Add zodResolver with proper schemas.
```

---

## MEDIUM (36)

### Security

```
[MEDIUM] [SECURITY] No rate limiting on any Route Handler.
  /api/auth/refresh can be brute-forced.
[MEDIUM] [SECURITY] src/api/client.ts:279 — catch-all clears tokens on ANY error during refresh.
  Network timeout → spurious logout.
[MEDIUM] [SECURITY] src/features/auth/hooks/use-google-login.ts:28
  Redirect URL from backend used directly in window.location.href. No validation.
[MEDIUM] [SECURITY] Client-side RoleGate is only authorization on many admin UI elements.
  Bypassable via DevTools.
[MEDIUM] [SECURITY] File uploads (projects.api.ts:103) — no client-side size/type validation.
```

### Error Handling

```
[MEDIUM] [ERROR] DataTableErrorBoundary uses string matching error.message.includes("schema mismatch").
  Fragile — breaks if wording changes.
[MEDIUM] [ERROR] No window.addEventListener("unhandledrejection") or window.onerror.
  Promise rejections outside React tree go uncaught.
[MEDIUM] [ERROR] Error logging is synchronous. Will block rendering when real adapter added.
[MEDIUM] [ERROR] logSchemaMismatch logs unconditionally in prod including Zod issue details.
[MEDIUM] [ERROR] extractDjangoMessage passes through raw Django text including field names.
[MEDIUM] [ERROR] ApiError.data stores full raw backend response. use-company-tasks.ts:68 casts as Record.
```

### Performance

```
[MEDIUM] [PERF] 7 component files exceed 800 lines:
  event-create-wizard.tsx (1129), quest-log-history.tsx (1070), ig-form-dialog.tsx (980),
  quest-log.tsx (944), manage-location-page.tsx (852), project-wizard.tsx (820),
  manage-interns/tasks/page.tsx (1198), timesheet-reviews/page.tsx (1028), analytics/page.tsx (964).
[MEDIUM] [PERF] Inline array literals in JSX props cause re-renders (10+ instances).
[MEDIUM] [PERF] framer-motion and react-markdown statically imported.
[MEDIUM] [IMAGES] 6 instances of unoptimized on <Image>.
[MEDIUM] [DATA-FETCH] Missing loading.tsx — only 3 exist for 100+ routes.
[MEDIUM] [DATA-FETCH] notification polling refetchInterval:60000 continues in background.
```

### Data & API

```
[MEDIUM] [API] src/features/profile/api/profile.api.ts:209-230
  File upload bypasses API gateway, misses token refresh.
[MEDIUM] [API] src/features/projects/api/projects.api.ts:110-133
  postMultipart() uses raw fetch, misses gateway features.
[MEDIUM] [API] src/features/courses/api/courses.api.ts:48
  External fetch with no error handling for non-OK responses.
[MEDIUM] [API] src/api/server.ts — no business error check (hasError:true with res.ok).
[MEDIUM] [REACT-QUERY] use-manage-interns.ts — dual query key pattern (legacy + factory).
[MEDIUM] [REACT-QUERY] project-detail-modal.tsx — mutations without onError feedback.
[MEDIUM] [REACT-QUERY] use-forgot-password.ts, use-request-otp.ts — no onError handler.
[MEDIUM] [SCHEMA] Extensive z.any() and .passthrough() in company-jobs, auth, orgs schemas.
```

### UX & Content

```
[MEDIUM] [UX] No breadcrumbs anywhere. Deep pages have no navigation trail.
[MEDIUM] [UX] "shortner" typo in url-shortner feature directory and filenames.
[MEDIUM] [UX] company/register/status/ — empty directory, blank page.
[MEDIUM] [UX] district-dashboard.tsx — no error state handling for 5+ queries.
[MEDIUM] [UX] campus-view.tsx:28 — conflates empty data with "not found".
[MEDIUM] [UX] event-inline-edit-form.tsx:540 — submit button not disabled during submission.
[MEDIUM] [RESPONSIVE] 5+ shadcn Table components without overflow-x wrapper for mobile.
[MEDIUM] [UI] isloading (lowercase) prop vs isLoading — triggers React DOM warnings (10 occurrences).
[MEDIUM] [UI] Date formatting inconsistency (4 different approaches across codebase).
[MEDIUM] [A11Y] 10+ clickable <div> elements missing role="button", tabIndex, onKeyDown.
```

### SEO & Discoverability

```
[MEDIUM] [SEO] 116/118 page+layout files use <div> wrapper — no <main> semantic element.
  Only 2 files use <main>. Crawlers can't identify primary content region.
[MEDIUM] [SEO] src/app/(dashboard)/layout.tsx:30 — Sidebar/topbar navigation uses <div>.
  No <nav> semantic element. Screen readers and crawlers miss navigation structure.
[MEDIUM] [SEO] src/app/(auth)/layout.tsx:11 — Auth layout sidebar uses <div> not <nav>.
[MEDIUM] [SEO] Zero structured data (JSON-LD / schema.org) anywhere in codebase.
  No Organization, BreadcrumbList, or WebApplication markup for rich results.
[MEDIUM] [SEO] No canonical URL configuration. Zero alternates.canonical usage.
  No metadataBase means no auto-canonicals. Duplicate content risk.
[MEDIUM] [SEO] src/app/(dashboard)/dashboard/reports/page.tsx:84,165 — Two <h1> tags.
  "Event Report Generator" and "Event Report" both use h1. One h1 per page max.
```

### Architecture & Types

```
[MEDIUM] [TYPES] src/features/discord-moderation/*.tsx — as unknown as Data[] double-casts.
[MEDIUM] [TYPES] src/features/manage-users/schemas:86-110 — undefined as unknown as string.
[MEDIUM] [TYPES] 10+ as any casts in event handlers for Select components.
[MEDIUM] [ARCH] src/api/server.ts:57 — cookieStore.set() may fail in streaming Server Components.
[MEDIUM] [ARCH] reports/page.tsx — hardcoded placeholder content ("sample description").
```

---

## LOW (25)

```
[LOW] [SECURITY] logSchemaMismatch logs in production — aids reconnaissance.
[LOW] [SECURITY] next.config.ts images.remotePatterns — overly broad S3 pattern.
[LOW] [SECURITY] isAuthenticated() checks cookie existence, not validity.
[LOW] [DEPS] @radix-ui/react-icons AND lucide-react both installed — duplicate icons.

[LOW] [ERROR] ReactQueryDevtools imported unconditionally.
[LOW] [ERROR] withErrorBoundary HOC — dead code, zero usage.
[LOW] [ERROR] global-error.tsx <html><body> unstyled — no fonts/theme.
[LOW] [ERROR] DataTableErrorBoundary handleReset() calls window.location.reload().

[LOW] [PERF] next.config.ts — no output:"standalone", no poweredByHeader:false.
[LOW] [PERF] next.config.ts:4 — uses require() for package.json, should use import.
[LOW] [PERF] No abort controller/signal usage anywhere — queries not cancelled on unmount.

[LOW] [API] Server delete() method omits body parameter (inconsistent with client).
[LOW] [API] src/api/client.ts:279 — catch-all swallows network errors during refresh.
[LOW] [API] src/features/intern/components/active-quests.tsx:69 — http:// not https://.
[LOW] [API] 23 duplicate endpoint URLs in endpoints.ts.

[LOW] [REACT-QUERY] tasks/use-tasks.ts — inline string query keys instead of factory.
[LOW] [REACT-QUERY] use-sessions.ts:216 — useAddParticipant ignores participant data.

[LOW] [UX] No i18n support — all strings hardcoded English.
[LOW] [UX] No offline behavior handling.
[LOW] [UX] Custom Table mobile view hardcodes full_name as title.

[LOW] [A11Y] 6+ interactive elements missing aria-label (auth forms, search, selects).
[LOW] [A11Y] event-collaborators-section.tsx:72 — <Image fill> without sizes attr.
[LOW] [A11Y] event-registration-card.tsx:108 — target="_blank" without rel="noopener".

[LOW] [TYPES] 30+ as any assertions across codebase (tasks, orgs, events, auth).
[LOW] [UI] 15+ console.error/warn calls left in production code.

[LOW] [SEO] No manifest.json or manifest.webmanifest in public/.
  No PWA metadata, no install prompt, no theme color for mobile browsers.
[LOW] [SEO] No opengraph-image.tsx or twitter-image.tsx for dynamic OG images.
  All shared links use generic fallback (if any). No per-page social previews.
```

---

## Error Handling Migration Plan

### The Problem
`getApiResponseError` at `src/hooks/use-get-error.ts:8` handles ALL error shapes:
- `ApiError` → `extractDjangoMessage(data)` → `.message` → fallback
- Plain string → return it
- Generic `{message}` object → return message
- Unknown → return fallback

**0 of 185 error handlers use it.**

### Per-Feature Migration Map

Every `onError` below needs:
```ts
import { getApiResponseError } from "@/hooks/use-get-error";
// then:
onError: (error) => toast.error(getApiResponseError(error, { fallback: "..." }))
```

| Feature | File | Mutations | Current Pattern |
|---------|------|-----------|-----------------|
| achievements | hooks/use-achievement-mutations.ts | 8 | `err.message ?? "fallback"` |
| auth | hooks/use-register.ts | 3 | `console.error` only |
| campus | hooks/campus.hooks.ts | 2 | `instanceof ApiError` |
| campus-manage | components/*.tsx | 8 | `instanceof ApiError` |
| channels | hooks/use-channel-logic.ts | 3 | `instanceof ApiError` |
| channels | components/channel-page.tsx | 3 | `instanceof ApiError` |
| company-jobs | hooks/use-job-mutations.ts | 3 | mixed |
| company-jobs | hooks/use-mentor-nominate.ts | 1 | `err.message` |
| company-jobs | hooks/use-apply-job.ts | 1 | `instanceof ApiError` |
| company-jobs | hooks/use-learner-applications.ts | 2 | custom deep access |
| company-jobs | hooks/use-job-rules.ts | 3 | `instanceof ApiError` |
| company-jobs | hooks/use-company-tasks.ts | 3 | `err.message` |
| company-profile | hooks/use-profile-edit.ts | 1 | `err.message` |
| company-tasks | hooks/use-company-tasks.ts | 6 | `instanceof ApiError` + custom |
| connect | components/connect-*.tsx | 2 | `instanceof Error` |
| courses | hooks/useWadhwaniCourses.ts | 1 | `error.message` |
| district | hooks/use-district.ts | 2 | `instanceof ApiError` |
| dynamic-type | hooks/use-dynamic-type-mutations.ts | 6 | `instanceof ApiError` |
| error-log | hooks/use-error-log-mutations.ts | 3 | mixed |
| events | hooks/events.hooks.ts | 16 | local `getErrorMessage()` |
| home | components/mentor-home.tsx | 1 | `instanceof ApiError` |
| ig-requests | hooks/useIGRequestMutations.ts | 2 | `error.message` |
| intern | hooks/use-intern.ts | 7 | local `getErrorMessage()` |
| intern | hooks/use-manage-interns.ts | 11 | local `getErrorMessage()` |
| intern | components/quest-log*.tsx | 4 | `instanceof Error` |
| karma-voucher | hooks/use-karma-vouchers-mutation.ts | 3 | `instanceof ApiError` |
| learning-circle | hooks/use-learning-circle.ts | 20 | `instanceof ApiError` + typed |
| manage-companies | hooks/use-manage-companies.ts | 1 | `err.message` |
| manage-ig | hooks/use-ig-requests.ts | 2 | `instanceof ApiError` |
| manage-ig | hooks/use-manage-ig.ts | 5 | `instanceof ApiError` |
| manage-locations | components/manage-location-page.tsx | 2 | `instanceof Error` |
| manage-roles | hooks/use-roles.ts | 3 | `err.message` (no fallback) |
| manage-roles | hooks/use-role-users.ts | 6 | `err.message` (no fallback) |
| manage-roles | components/bulk-import-dialog.tsx | 1 | `instanceof Error` |
| manage-users | components/*.tsx | 2 | hardcoded |
| mentor | hooks/use-session-actions.ts | 2 | `err.message` |
| mentor/sessions | hooks/use-sessions.ts | 10 | `err.message` |
| mentor/onboarding | hooks/use-onboarding.ts | 3 | `err.message` |
| mentor/opportunities | hooks/use-opportunities.ts | 3 | `instanceof ApiError` |
| mentor/task-requests | hooks/use-task-requests.ts | 3 | mixed |
| mentor/tasks | hooks/use-mentor-tasks.ts | 3 | `instanceof ApiError` |
| notification | hooks/use-notification.ts | 6 | `instanceof ApiError` |
| organizations | hooks/use-organizations.ts | 3 | `err.message` (no fallback) |
| organizations | hooks/use-affiliations.ts | 3 | `err.message` (no fallback) |
| organizations | hooks/use-departments.ts | 3 | `getOrgErrorMessage()` |
| organizations | hooks/use-transfer.ts | 2 | `getOrgErrorMessage()` |
| organizations | hooks/use-verification.ts | 1 | `getOrgErrorMessage()` |
| organizations | components/organizations-view.tsx | 1 | `instanceof Error` |
| profile | hooks/use-profile-mutations.ts | 8 | mixed |
| profile | components/*.tsx | 4 | hardcoded |
| projects | components/project-card.tsx | 2 | `instanceof ApiError` |
| projects | components/projects-tab.tsx | 4 | `instanceof Error` |
| projects | components/project-wizard.tsx | 1 | `instanceof Error` |
| role-verification | hooks/use-role-verification.ts | 2 | `error.message` |
| settings | hooks/use-change-password.ts | 1 | `error.message` |
| settings | hooks/use-change-organization.ts | 1 | `instanceof ApiError` |
| tasks | hooks/use-tasks.ts | 6 | `getTaskErrorMessage()` |
| tasks | hooks/use-task-types.ts | 3 | `getTaskErrorMessage()` |
| tasks | hooks/use-task-verification.ts | 1 | `getTaskErrorMessage()` |
| url-shortner | components/*.tsx | 2 | hardcoded |
| auth pages | login/register/forgot/reset-client.tsx | 7 | `instanceof ApiError` |
| onboarding | interests/organization-client.tsx | 3 | `instanceof ApiError` |

**After migration, delete these duplicate helpers:**
- `features/events/hooks/events.hooks.ts:23` — `getErrorMessage()`
- `features/intern/hooks/use-intern.ts:16` — `getErrorMessage()`
- `features/intern/hooks/use-manage-interns.ts:18` — `getErrorMessage()`
- `features/organizations/hooks/org-error.ts:8` — `getOrgErrorMessage()` (keep `useOrgQueryErrorToast`, update to use `getApiResponseError`)
- `features/tasks/hooks/task-error.ts:8` — `getTaskErrorMessage()` (keep `useTaskQueryErrorToast`, update to use `getApiResponseError`)

---

## Priority Fix Waves

### Wave 0 — Immediate (security holes)
1. Delete `src/app/api/log_mismatch/route.ts`
2. Add `requireRole`/`requirePermission` to ALL admin page server components
3. Add token refresh mutex in `src/api/client.ts`
4. Add security headers in `next.config.ts`
5. Validate `ruri` parameter in `/api/auth/refresh`

### Wave 1 — Before launch
1. production error handling
2. Add NODE_ENV guards to all 19 production error renders
3. Migrate tokens to httpOnly cookies
4. Add `not-found.tsx` at root + dashboard + auth levels
5. Add `error.tsx` for `(auth)` and `(onboarding)` route groups
6. Create `src/app/sitemap.ts` with dynamic routes
7. Create `src/app/robots.ts` with crawl rules + sitemap URL
8. Add `metadataBase` to root layout.tsx
9. Add Open Graph + Twitter Card metadata to root layout

### Wave 2 — First sprint
11. Unify 185 error handlers to use `getApiResponseError` (~50 files)
12. Delete 5 duplicate error extraction functions
13. Fix barrel file wildcard re-exports (20+ features)
14. Remove duplicate `radix-ui` monolithic package
15. Dynamic import recharts/framer-motion/react-markdown
16. Add metadata to 82 pages (75% missing)
17. Add Zod resolvers to 9 forms missing validation
18. Fix broken transfer API params (`as any` hiding bug)
19. Fix `useGoogleCallback` — refactor useQuery → useMutation
20. Replace 40 `z.any()` schemas with proper types

### Wave 3 — Following sprints
21. Add heading hierarchy (h1) to 78 pages missing headings
22. Replace div-soup with semantic HTML (<main>, <nav>, <section>)
23. Add JSON-LD structured data (Organization, BreadcrumbList)
24. Add manifest.json for PWA metadata
25. Add opengraph-image.tsx for dynamic social previews
26. Fix duplicate h1 in reports/page.tsx
27. Add canonical URL configuration via alternates.canonical
28. Split 7+ components over 800 lines
29. Convert 31 "use client" page.tsx to server component wrappers
30. Create query key factories for features with inline strings
31. Add loading.tsx to major route groups
32. Add breadcrumbs
33. Fix `isloading` prop naming (10 occurrences)
34. Standardize date formatting
35. Add aria-labels to interactive elements
36. Remove `unoptimized` from 6 Image components
37. Clean up 30+ `as any` type assertions
38. Add abort signal forwarding to API calls
39. Consolidate 23 duplicate endpoints
40. Fix notification polling in background tabs
41. Add PII scrubbing to error logging
42. Add CSRF documentation

---

## Recent Changes Audit (2026-06-17 sync — PRs #153–#157)

### New Files

```
[CRITICAL] [SECURITY] src/app/(dashboard)/dashboard/management/session-verification/page.tsx
  New admin page with NO server-side authorization. No requireAuth() or requireRole() call.
  Renders AdminSessionVerificationPage directly — any authenticated user can access.
  FIX: Add await requireRole([ROLES.ADMIN]) before rendering.
  (Compounds existing CRITICAL: all management pages lack server-side auth)

[HIGH] [SECURITY] src/features/mentor/sessions/components/admin-session-verification-page.tsx:1
  422-line "use client" component handles admin session approve/reject.
  No client-side role gating either — relies solely on middleware JWT (no sig verify).
  FIX: Wrap with RoleGate as interim; real fix is server-side requireRole() in page.tsx.

[HIGH] [TYPES] src/features/mentor/hooks/use-mentor-overview.ts:11,23
  Two `response as MentorOverview` / `response as MentorStatus` type assertions.
  Bypasses runtime validation — if backend shape changes, UI breaks silently.
  FIX: Add Zod schemas for MentorOverview/MentorStatus, parse response.

[MEDIUM] [ERROR] src/features/mentor/sessions/components/approve-session-dialog.tsx:63
  useApproveSession mutation has onSuccess but NO onError handler.
  Failed approve/reject shows no user feedback.
  FIX: Add onError: (error) => toast.error(getApiResponseError(error, { fallback: "..." }))

[MEDIUM] [TYPES] src/features/mentor/sessions/components/approve-session-dialog.tsx:46-50,80
  Three `as any` casts: zodResolver(), defaultValues, and handleSubmit.
  Defeats type checking on form submission.
  FIX: Fix zodResolver typing (likely react-hook-form version mismatch) instead of casting.

[MEDIUM] [RESPONSIVE] src/features/mentor/sessions/components/admin-session-verification-page.tsx
  Table has no overflow-x wrapper. Columns will overflow on mobile.
  FIX: Wrap Table in <div className="overflow-x-auto">.

[MEDIUM] [PERF] src/features/mentor/sessions/components/admin-session-verification-page.tsx:250-275
  Four parallel useAdminSessions() queries fire on mount (all, pending, scheduled, rejected).
  Could fetch once and filter client-side, or use tab-based lazy loading.
  FIX: Fetch all sessions once, derive tab counts via filter. Or enable queries per active tab.

[LOW] [SEO] src/app/(dashboard)/dashboard/management/session-verification/page.tsx
  No metadata export. Browser tab shows generic title.
  FIX: Add export const metadata = { title: "Session Verification | muLearn" }.

[LOW] [SEO] src/features/mentor/sessions/components/admin-session-verification-page.tsx
  No heading hierarchy — h1 exists but no semantic page structure.
  (Minor: dashboard pages inherit layout heading context)
```

### Modified Files

```
[HIGH] [SECURITY] src/lib/auth/role-routing.ts:27
  Admin home path changed from "/dashboard/admin" to "/dashboard/management".
  Good: consolidates admin routing. But "/dashboard/management" route still
  lacks server-side requireRole() — same CRITICAL issue persists.

[MEDIUM] [SECURITY] src/lib/auth/route-access.ts
  Removed "/dashboard/admin" route config. Admin access now only via "/dashboard/management".
  Ensure no dead links or bookmarks point to old /dashboard/admin path.
  FIX: Add redirect from /dashboard/admin → /dashboard/management in middleware or next.config.ts.

[LOW] [UX] src/features/intern/components/intern-stats-cards.tsx
  Expanded rank milestone messages with randomized pools.
  Uses r % pool.length for selection — deterministic per rank, not random per visit. Fine.

[LOW] [UX] src/features/mentor/profile/components/mentor-edit-profile-modal.tsx
  Expanded from ~100 to ~256 lines. Check for error handling in new form fields.

[LOW] [UI] src/features/mentor/public/components/public-mentor-card.tsx
  New 246-line public mentor card. Uses dicebear API for avatars (external dependency).
  No error boundary if profile fetch fails — shows "not found" fallback. Acceptable.
```

### Updated Migration Table Entry

| Feature | File | Mutations | Current Pattern |
|---------|------|-----------|-----------------|
| mentor/sessions | components/approve-session-dialog.tsx | 1 | no onError handler |

### Updated Counts

Post-sync totals:
- Critical: 10 → **11** (+1: session-verification page missing server-side auth)
- High: 27 → **30** (+3: admin page no role gate, type assertions, route still unprotected)
- Medium: 42 → **46** (+4: no onError, as any casts, no overflow-x, 4 parallel queries)
- Low: 27 → **30** (+3: no metadata, no heading, dead admin route)
- **TOTAL: 106 → 117 findings**
