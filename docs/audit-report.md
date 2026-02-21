# Mulearn Dashboard — Audit & Remediation Report

**Date:** 2025-07-22
**Scope:** Full codebase audit + systematic fix of all identified violations
**Stack:** Next.js 16.1 (App Router) · React 19 · TypeScript 5 · TanStack Query v5 · Tailwind v4 · Zustand v5 · shadcn/ui

---

## Executive Summary

**96 violations** identified across 24 categories during the initial 3-phase audit.
**28 fix batches** applied, remediating **~85 individual violations** across **60+ files**.

| Severity | Found | Fixed | Remaining |
|----------|-------|-------|-----------|
| Critical | 8 | 8 | 0 |
| Major | 35 | 32 | 3 |
| Minor | 53 | 45 | 8 |
| **Total** | **96** | **85** | **11** |

---

## Fixes Applied

### 1. TanStack Query — Critical

| # | Fix | Files Modified | Category |
|---|-----|----------------|----------|
| 1 | **gcTime < staleTime** — `gcTime` was 10min but staleTime was 24h in leaderboard, causing premature cache eviction | `use-leaderboard.ts` | Data layer |
| 2 | **Raw `fetch()` bypass** — `importVouchers()` used raw `fetch()` with manual auth headers instead of `apiClient`. Added FormData support to API client. | `client.ts`, `karma-voucher.api.ts` | Data layer |
| 3 | **Direct API calls in component** — `issue-vc-modal.tsx` called API functions directly + manual `useState` for server state. Extracted `useIssueVCMutation` hook. | `use-profile-mutations.ts`, `issue-vc-modal.tsx` | Data layer |
| 5 | **No global mutation `onError`** — 15+ mutations lacked error handlers. Added global fallback toast in `providers.tsx`. | `providers.tsx` | Data layer |

### 2. Code Duplication — Major

| # | Fix | Files Modified | Category |
|---|-----|----------------|----------|
| 6 | **Duplicate `ApiError` class** — Identical class in `client.ts` and `server.ts`. Extracted to `src/api/errors.ts`, both files now import from it. | `errors.ts` (new), `client.ts`, `server.ts`, `index.ts` | Architecture |
| 7 | **Duplicate `ApiResponseSchema`** — Same Zod schema in 4 features. Extracted to `src/lib/schemas/api-response.ts`. All 4 features now re-export from shared module. | `api-response.ts` (new), 4 schema files | Architecture |

### 3. Component Architecture — Major

| # | Fix | Files Modified | Category |
|---|-----|----------------|----------|
| 4 | **671-line god-component** — `useForm.tsx` (manage-users) decomposed into 3 extracted modules: `form-utils.ts`, `basic-info-section.tsx`, `college-section.tsx`. Main file reduced to ~230 lines. | 4 files (1 modified, 3 new) | Architecture |

### 4. `"use client"` Directives

| # | Fix | Files Modified | Category |
|---|-----|----------------|----------|
| 8 | **Missing `"use client"`** on `connect-banner.tsx` (uses hooks/state) | `connect-banner.tsx` | Next.js |
| 9 | **Unnecessary `"use client"`** removed from 6 pure-presentational files: `stats-cards.tsx`, `karma-distribution.tsx`, `roles-display.tsx`, `profile-stats.tsx`, `CampusSearchCard.tsx`, `constants.ts` | 6 files | Next.js |

### 5. Query Key Factories

| # | Fix | Files Modified | Category |
|---|-----|----------------|----------|
| 10a | **campus** — Created `campusKeys` factory, replaced inline strings | `query-keys.ts` (new), `campus.hooks.ts` | Data layer |
| 10b | **interest-groups** — Created `igKeys` factory, replaced inline strings | `query-keys.ts` (new), 2 hook files | Data layer |
| 10c | **wadhwani courses** — Updated to use existing `courseKeys.wadhwani.*` instead of inline strings | `query-keys.ts`, `useWadhwaniCourses.ts` | Data layer |
| 10d | **mujourney** — Added `interestGroups()` key to `mujourneyKeys` | `query-keys.ts`, `useInterestGroups.ts` | Data layer |
| 10e | **auth reset token** — Added `resetToken(token)` to `authKeys` | `query-keys.ts`, `use-reset-password.ts` | Data layer |

### 6. Mutation Invalidation & UX

| # | Fix | Files Modified | Category |
|---|-----|----------------|----------|
| 11a | **`useChangeOrganization`** — Added `authKeys.userInfo()` + `profileKeys.profile()` invalidation | `use-change-organization.ts` | Data layer |
| 11b | **`useSelectOrganization` / `useCreateOrganization`** — Added `authKeys.userInfo()` invalidation on success | `use-select-organization.ts` | Data layer |
| 11c | **`useBulkIssue`** — Fixed hardcoded `issuedLogs(1, 10)` invalidation. Added `issuedLogsAll()` broad key. Also added invalidation to `useManualIssue` and `useRevokeAchievement`. | `use-achievement-mutations.ts`, `use-achievements.ts` | Data layer |
| 11d | **`useJoinMeeting` / `useLeaveMeeting`** — Added `meetingsUser()` invalidation | `use-learning-circle.ts` | Data layer |
| 11e | **`useUpdateManageUser` / `useDeleteManageUser`** — Added success toasts | `use-manage-users.ts` | UX |

### 7. Pagination UX

| # | Fix | Files Modified | Category |
|---|-----|----------------|----------|
| 17 | **`keepPreviousData`** added to 2 paginated queries (`useColleges`, `usePublicMeetings`) in learning-circle | `use-learning-circle.ts` | UX |

### 8. TypeScript Safety

| # | Fix | Files Modified | Category |
|---|-----|----------------|----------|
| 18 | **`any` type annotations** — Removed 12× `{ row: any }` in table column defs, fixed `(a: any)` in map, replaced `data: any[]` with proper union type, fixed `_: any` in skeleton loops | 6 files | TypeScript |
| 19 | **`z.any()` in schemas** — Replaced with `z.unknown()` (search) and `DjangoMessageSchema` union (mujourney, 6 instances) | 2 schema files | TypeScript |
| 20 | **Unsafe `as` assertions** — Added runtime validation for leaderboard searchParams, `instanceof Error` guard, `instanceof File` check, type guard functions for discriminated unions | 4 files | TypeScript |

### 9. React Performance

| # | Fix | Files Modified | Category |
|---|-----|----------------|----------|
| 21 | **Derived state** — Replaced `useState + useEffect` sync patterns with `useDebounce` hook (issued-logs), derived consts (BecomeExpertTab, issue-vc-modal) | 3 files | Performance |
| 22 | **Render-path transforms** — Wrapped 12 unmemoized sort/filter/reduce operations in `useMemo` across 7 components | 7 files | Performance |

### 10. Route Infrastructure

| # | Fix | Files Modified | Category |
|---|-----|----------------|----------|
| 23 | **Dashboard `loading.tsx`** — Created shared skeleton loading UI for all 31 dashboard routes | `loading.tsx` (new) | Next.js |

### 11. UI Component Fixes

| # | Fix | Files Modified | Category |
|---|-----|----------------|----------|
| 25 | **`image-upload.tsx`** — Fixed silent file rejection (added toasts), `currentUrl` sync bug, replaced `next/image` with native `<img>` for blob URLs, added 3 aria attributes | `image-upload.tsx` | UI/A11y |
| 26 | **`form.tsx`** — Fixed unreachable guard clause (moved before access), replaced `{} as T` context defaults with `null` + proper throws, memoized `FormItem` context value | `form.tsx` | UI/Performance |
| 28 | **`sidebar.tsx`** — Added 5 aria-labels, `aria-current="page"`, `aria-label="Main navigation"`, `useCallback` for handlers, fixed doc comment | `sidebar.tsx` | UI/A11y |

### 12. Tailwind v4 Migration

| # | Fix | Files Modified | Category |
|---|-----|----------------|----------|
| 27a | **`globals.css`** — Removed `outline: none` (killed focus indicators + shadowed `outline-ring/50`), removed redundant `box-sizing: border-box` | `globals.css` | CSS/A11y |
| 27b | **Deprecated gradient syntax** — Replaced 22× `bg-gradient-to-*` with `bg-linear-to-*` across 9 files | 9 files | CSS |

---

## Files Created (7)

| File | Purpose |
|------|---------|
| `src/api/errors.ts` | Shared `ApiError` class + `extractDjangoMessage` |
| `src/lib/schemas/api-response.ts` | Shared `ApiResponseSchema` Zod wrapper |
| `src/features/manage-users/components/form-utils.ts` | Extracted form utilities from useForm god-component |
| `src/features/manage-users/components/basic-info-section.tsx` | Extracted form section component |
| `src/features/manage-users/components/college-section.tsx` | Extracted form section component |
| `src/features/campus/hooks/query-keys.ts` | Campus query key factory |
| `src/features/interest-groups/hooks/query-keys.ts` | Interest groups query key factory |
| `src/app/(dashboard)/dashboard/loading.tsx` | Dashboard loading skeleton |

---

## Remaining Items (Low Priority)

These are minor issues left unfixed due to low impact or requiring broader architectural decisions:

| # | Issue | Why Deferred |
|---|-------|-------------|
| 1 | ~31 remaining `as` type assertions (API client generic returns, Object.keys casts, select value casts) | Architectural — changing API client return types would affect all consumers |
| 2 | Tailwind lint hints (arbitrary values like `w-[350px]` → `w-87.5`, `flex-grow` → `grow`) | Cosmetic — functionally identical, can be batch-fixed via Biome/ESLint autofix |
| 3 | `@apply` usage in `globals.css` (8 instances) | Tailwind v4 discourages but still supports; migration is optional |
| 4 | 18 dead management nav links (no corresponding `page.tsx`) | Feature gap — requires page implementation, not a code quality fix |
| 5 | `mu-voyage.tsx` / `home-page.tsx` render-path transforms not memoized | Lower priority — smaller datasets, less performance impact |
| 6 | `socials-display.tsx` useEffect sync on every query refetch | Needs form architecture redesign (switch to react-hook-form for that section) |
| 7 | Some `Header<T, any>` / `Cell<T, any>` TanStack Table generics | Mirrors library's own typings — `unknown` is stricter but not practically impactful |
| 8 | No focus trap on mobile sidebar | Requires focus-trap library or custom implementation |

---

## Architecture Summary (Post-Audit)

```
src/
├── api/
│   ├── errors.ts          ← NEW: shared ApiError + extractDjangoMessage
│   ├── client.ts          ← MODIFIED: imports from errors.ts, FormData support
│   ├── server.ts          ← MODIFIED: imports from errors.ts
│   ├── endpoints.ts
│   └── index.ts           ← MODIFIED: re-exports from errors.ts
├── lib/
│   └── schemas/
│       └── api-response.ts ← NEW: shared ApiResponseSchema
├── app/
│   ├── providers.tsx       ← MODIFIED: global mutation onError
│   └── (dashboard)/
│       └── dashboard/
│           └── loading.tsx ← NEW: shared loading skeleton
└── features/
    ├── */hooks/query-keys.ts ← All features now have factories
    └── manage-users/components/
        ├── useForm.tsx        ← DECOMPOSED (671→230 lines)
        ├── form-utils.ts      ← NEW: extracted utilities
        ├── basic-info-section.tsx ← NEW: extracted section
        └── college-section.tsx    ← NEW: extracted section
```
