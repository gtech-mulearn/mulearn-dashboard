# Dashboard Home — API Integration Design

**Date:** 2026-05-14  
**Status:** Approved  
**Author:** Claude (brainstorming session)

---

## Goal

Replace all mock data on the dashboard home page with live API calls, across four
role-specific home views: MuLearner, Campus Lead/Enabler, Mentor, Company.
The integration must be type-safe (Zod schemas + inferred TypeScript types) and
match the existing per-feature-hook pattern already used in this codebase.

---

## Scope

### In scope

| Area | What changes |
|---|---|
| **MuLearner QuickActionRow** | Replace `MOCK_QUICK_ACTION_COUNTS` (my circles count, leaderboard rank, job openings) with real API data. Add "Find Mentors" quick action link. |
| **Mentor Home** | Wire all 4 stat cards, upcoming sessions, session requests, mentee list, expertise tags to real APIs. Add persona-not-configured guard. |
| **Campus Stat Cards** | Remove `MOCK_CAMPUS_STAT_DELTAS` hardcoded strings. Compute deltas client-side from two-period data, or omit badge when prior value unavailable. |
| **Company Stat Cards** | Replace `MOCK_COMPANY_STAT_CARDS` with data derived from `/company/jobs/` (job views, applications) and `/company/learners/` (talent pool size). |
| **Company Talent Pool** | Replace `MOCK_LEVEL_DISTRIBUTION` and `MOCK_TOP_INTEREST_GROUPS` with data from `/company/learners/` and `/ig/list/`. |
| **Company Verified Banner** | Replace `MOCK_VERIFIED_COMPANY_NAME` with real company profile name from `/company/profile/`. |
| **Events Slider** | Replace Google Sheets URL with `/api/v1/dashboard/events/featured/`. Update schema to match real backend shape. |

### Not in scope (this PR)

- Campus Member Funnel, Circle Health, Recent Activity — no backend API yet; mocks stay
- Intern module — no backend
- Calendar events — `/events/calendar/` missing from backend; existing behaviour unchanged
- Student-facing mentor session booking — no backend API exists; only link to existing search page
- Any page outside `features/home`

---

## Approach

**Option A — Feature-by-feature hooks (selected)**

Each API call gets its own `useQuery` hook. Components receive typed props from
hooks in their parent. No component fetches data itself. This matches the existing
pattern in `EnablerHome` → `CampusStatCards`.

---

## Architecture

### 1. New endpoints added to `src/api/endpoints.ts`

```ts
mentor: {
  overview:    "/api/v1/dashboard/mentor/overview/",
  sessions:    "/api/v1/dashboard/mentor/sessions/",
  mentees:     "/api/v1/dashboard/mentor/mentees/",
  profile:     "/api/v1/dashboard/mentor/profile/",
},
publicJobs: "/api/v1/public/jobs/",
// events.featured already exists — update dashboard.events to point here
```

### 2. Schemas — `src/features/home/schemas/home.schema.ts`

Add Zod schemas derived directly from backend serializers:

**Mentor Overview** (`/mentor/overview/`):
```
MentorOverviewSchema {
  user: { full_name, muid, profile_pic }
  mentor_profile: { about, expertise: string[], volunteer_hours, mentor_tier, is_verified }
  active_persona: { active_ig_id, ig_name, is_verified }
  authorized_igs: [{ role_link_id, ig_id, ig_name, is_primary, is_verified }]
  stats: { total_mentees, sessions_conducted, pending_task_approvals, volunteer_hours }
}
```

**Mentor Sessions** (`/mentor/sessions/?status=SCHEDULED`):
```
MentorSessionSchema {
  id, title, mode, starts_at, ends_at, status, meeting_link,
  participants: [{ user_id, full_name, participant_role, attendance_status }]
}
MentorSessionsResponseSchema { data: MentorSessionSchema[], pagination }
```

**Mentor Mentees** (`/mentor/mentees/`):
```
MentorMenteeSchema {
  user_id, full_name, muid, profile_pic, karma, level,
  ig_karma, ig_level, session_count, last_session_at
}
MentorMenteesResponseSchema { active_ig_id, data: MentorMenteeSchema[], pagination }
```

**Events Featured** (replaces OpenSheet schema):
```
FeaturedEventSchema {
  id, title, description, banner_image, link, starts_at, ends_at, status, tags
}
FeaturedEventsResponseSchema { data: FeaturedEventSchema[] }
```

**Public Jobs count** (re-use existing response, select `pagination.total`):
```
PublicJobsCountSchema — parse pagination.total from /public/jobs/
```

### 3. API functions — `src/features/home/api/home.api.ts`

New functions added:
- `getMentorOverview()` → `MentorOverview`
- `getMentorSessions(status?: string)` → `MentorSessionsResponse`
- `getMentorMentees()` → `MentorMenteesResponse`
- `getPublicJobsCount()` → `number`
- `getFeaturedEvents()` → `FeaturedEvent[]` (replaces `getEvents()`)

### 4. Query hooks — `src/features/home/hooks/use-home.ts`

New hooks:
- `useMentorOverview()` — staleTime 5 min; returns `{ data, isLoading, isError }`
- `useMentorSessions()` — filters `?status=SCHEDULED`, staleTime 2 min
- `useMentorMentees()` — staleTime 5 min
- `usePublicJobsCount()` — staleTime 15 min (public, changes rarely)
- `useFeaturedEvents()` — replaces `useEvents()`; staleTime 5 min

Existing hooks reused:
- `useUserCircles` (from `features/learning-circle/hooks`) — `userCircles.length`
- `useUserProfile` (from `features/auth/hooks/use-session`) — `.rank` field
- `useCompanyJobs` (from `features/company-jobs`) — derive counts
- `useCompanyProfile` (from company feature) — company name
- `useCompanyLearners` — level distribution + learner count

### 5. Component changes

#### MuLearner — `QuickActionRow`

- Convert from static `QUICK_ACTIONS` constant to data-driven component
- Accepts `circleCount`, `rank`, `jobCount` as props
- Parent `MuLearnerHome` wires hooks → props
- Add "Find Mentors" action (5th → 6th card, or replace a less-used one): links to `/dashboard/search/mentors`
- Loading state: show skeleton sub-text while counts load
- `mock-stats.ts` fully deleted once wired

#### Mentor — `MentorHome`

- Calls `useMentorOverview()` at top level
- If error is `ApiError` with status 403 → renders `<MentorSetupPrompt>` card
  (message: "Activate your mentor dashboard", link to `/dashboard/profile`)
- If loading → skeleton layout matching 4-card + 2-card grid
- Passes `overview.stats` → `MentorStatCards` as typed props
- Passes `sessions.data` → `UpcomingSessionsCard` as typed props
- Pending sessions (status=PENDING) → `SessionRequestsCard`
- Passes `mentees.data` → `MenteeProgressCard` as typed props
- Passes `overview.mentor_profile.expertise` → `MentorHeroCard` as typed props
- `mock-mentor.ts` fully deleted

**MentorStatCards** refactor: remove `MOCK_MENTOR_STAT_DELTAS` import. Accept typed props:
```ts
type MentorStatCardsProps = {
  totalMentees: number
  hoursMentored: number
  sessionsConducted: number
  pendingApprovals: number
  isLoading: boolean
}
```
Delta strings are removed — real API doesn't return period-over-period deltas.
Cards show the raw value with a neutral sub-label instead.

**UpcomingSessionsCard** refactor: accept `sessions: MentorSession[]` prop. Map
`starts_at` to display label using `Intl.DateTimeFormat`. Status mapped from
`SCHEDULED → confirmed`, `CANCELLED → cancelled`, etc.

**SessionRequestsCard** refactor: sessions with `status=PENDING` treated as requests.

**MenteeProgressCard** refactor: accept `mentees: MentorMentee[]` prop. Use
`ig_karma` / `ig_level` for progress bar. Use initials derived from `full_name`.
Avatar color generated deterministically from `user_id` (simple hash → hsl).

**MentorHeroCard** refactor: accept `expertise: string[]` prop (from
`mentor_profile.expertise`, which is a JSON array in the DB).

#### Campus — `CampusStatCards`

- Remove `MOCK_CAMPUS_STAT_DELTAS` import
- Delta badge: removed entirely from the 4 stat cards
- Values still come from real `overview` prop (already wired)
- `mock-campus.ts` trimmed: remove `MOCK_CAMPUS_STAT_DELTAS` export only;
  funnel/health/activity mocks stay for their respective components

#### Company — `CompanyHome`

Calls at top level:
- `useCompanyProfile()` (already exists) → company name for banner
- `useCompanyJobs()` (already exists) → count of jobs for stat card
- `useCompanyLearners()` — talent pool count, level distribution

**CompanyStatCards** refactor: accept typed props derived from jobs + learners:
```ts
type CompanyStatCardsProps = {
  jobsPosted: number
  totalApplications: number
  talentPoolSize: number
  isLoading: boolean
}
```
`jobViews` and `avgKarma` cards removed or replaced with available data
(jobsPosted, applications, talentPoolSize, learnerCount). Delta strings removed.

**TalentPoolCard** refactor: accept `levelDistribution: LevelDistItem[]` and
`topIgs: IgListItem[]` as props. Level distribution aggregated client-side from
`/company/learners/` response (group by `level`). Top IGs from existing
`useInterestGroupsList()` sorted by member count (proxy for karma).
`mock-company.ts` fully deleted.

**CompanyVerifiedBanner**: accept `companyName: string` from company profile API
(already wired via `useCompanyOnboardingStatus` / `useCompanyProfile`).

#### Events Slider — `EventsSliderCard` / `home.api.ts`

- `getEvents()` replaced by `getFeaturedEvents()` pointing to `/api/v1/dashboard/events/featured/`
- Schema updated to match real backend response (id, title, banner_image, starts_at, link)
- `useEvents()` renamed to `useFeaturedEvents()`; update all consumers
- Google Sheets URL removed from `endpoints.ts`

---

## Error & Loading States

- All new hooks use `isLoading` → existing `<Skeleton>` components (already in place for campus cards)
- Mentor cards that previously had no skeletons: add `<Skeleton>` matching card dimensions
- All hooks use `isError` → silent empty state (no crash); error logged to console
- Mentor 403 → `<MentorSetupPrompt>` instead of dashboard
- Company API errors → show `—` in place of numbers; no crash

---

## Mock file deletion plan

| File | Action |
|---|---|
| `mock-mentor.ts` | Delete entirely |
| `mock-company.ts` | Delete entirely |
| `mock-stats.ts` | Delete entirely |
| `mock-campus.ts` | Remove `MOCK_CAMPUS_STAT_DELTAS` only; keep funnel/health/activity |

---

## Query key additions — `src/features/home/hooks/query-keys.ts`

```ts
mentorOverview: () => ['home', 'mentor', 'overview'],
mentorSessions: (status?: string) => ['home', 'mentor', 'sessions', status],
mentorMentees:  () => ['home', 'mentor', 'mentees'],
publicJobsCount: () => ['home', 'public-jobs-count'],
featuredEvents:  () => ['home', 'featured-events'],
```

---

## Files changed (summary)

| File | Change |
|---|---|
| `src/api/endpoints.ts` | Add `mentor.*`, `publicJobs`; fix `dashboard.events` |
| `src/features/home/schemas/home.schema.ts` | Add 5 new schemas; update events schema |
| `src/features/home/api/home.api.ts` | Add 4 new API fns; replace `getEvents` |
| `src/features/home/hooks/use-home.ts` | Add 4 new hooks; rename `useEvents` |
| `src/features/home/hooks/query-keys.ts` | Add 5 new query keys |
| `src/features/home/components/quick-action-row.tsx` | Wire counts; add Find Mentors |
| `src/features/home/components/mulearner-home.tsx` | Pass counts as props |
| `src/features/home/components/mentor-home.tsx` | Wire all mentor hooks; add persona guard |
| `src/features/home/components/mentor/mentor-stat-cards.tsx` | Accept props, rm mock |
| `src/features/home/components/mentor/upcoming-sessions-card.tsx` | Accept props, rm mock |
| `src/features/home/components/mentor/session-requests-card.tsx` | Accept props, rm mock |
| `src/features/home/components/mentor/mentee-progress-card.tsx` | Accept props, rm mock |
| `src/features/home/components/mentor/mentor-hero-card.tsx` | Accept expertise prop |
| `src/features/home/components/mentor/availability-card.tsx` | No change (no API yet) |
| `src/features/home/components/campus/campus-stat-cards.tsx` | Remove delta badge |
| `src/features/home/components/company-home.tsx` | Wire company hooks |
| `src/features/home/components/company/company-stat-cards.tsx` | Accept props, rm mock |
| `src/features/home/components/company/talent-pool-card.tsx` | Accept props, rm mock |
| `src/features/home/components/company/company-verified-banner.tsx` | Use real name |
| `src/features/home/components/events-slider-card.tsx` | Use `useFeaturedEvents` |
| `src/features/home/constants/mock-mentor.ts` | **Delete** |
| `src/features/home/constants/mock-company.ts` | **Delete** |
| `src/features/home/constants/mock-stats.ts` | **Delete** |
| `src/features/home/constants/mock-campus.ts` | Remove `MOCK_CAMPUS_STAT_DELTAS` |

---

## New component

`src/features/home/components/mentor/mentor-setup-prompt.tsx`
- Simple card: icon + "Your mentor dashboard isn't active yet" + CTA button to `/dashboard/profile`
- Shown when `useMentorOverview` returns a 403 `ApiError`
