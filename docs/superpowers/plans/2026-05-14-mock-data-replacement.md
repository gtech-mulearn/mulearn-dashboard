# Mock Data Replacement — API Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every mock data constant in the mulearn-dashboard frontend with real API calls, using the 8 new backend endpoints documented in `Mock_Data_Replacement_Endpoints.md`.

**Architecture:** Each persona's dashboard (Learner, Mentor, Company, Campus) gets its own `home-summary` endpoint that replaces multiple ad-hoc data sources with a single authenticated GET. Additional standalone endpoints cover public company profile, public jobs by slug, and campus sub-widgets. All integrations follow the established pattern: Zod schema → API function → React Query hook → component prop update.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Zod 4, TanStack React Query 5, custom `apiClient` at `src/api/client.ts`, centralized endpoints at `src/api/endpoints.ts`.

---

## Codebase Reference

Before starting, bookmark these files — every task touches at least one of them.

| File | Role |
|------|------|
| `src/api/endpoints.ts` | All API URL strings live here |
| `src/features/home/schemas/home.schema.ts` | Zod schemas for home feature |
| `src/features/home/api/home.api.ts` | API functions for home feature |
| `src/features/home/hooks/use-home.ts` | React Query hooks for home feature |
| `src/features/home/hooks/query-keys.ts` | Query key factory |
| `src/features/home/constants/mock-campus.ts` | Campus mock data (DELETE at end of Task 4) |
| `src/features/company-jobs/schemas/jobs.schema.ts` | Company/jobs Zod schemas |
| `src/features/company-jobs/api/jobs.api.ts` | Company/jobs API functions |
| `src/features/company-jobs/constants/mock-company-profile.ts` | Company mock data (DELETE at end of Task 5) |

---

## Task 1: Learner Dashboard Summary

Integrates `GET /api/v1/dashboard/home/learner/summary/` to replace the hardcoded `circleCount = 0` in `MuLearnerHome`, and wires up the already-built `HomeStatsPanel` component (which currently receives no data).

**Files:**
- Modify: `src/api/endpoints.ts`
- Modify: `src/features/home/schemas/home.schema.ts`
- Modify: `src/features/home/api/home.api.ts`
- Modify: `src/features/home/hooks/query-keys.ts`
- Modify: `src/features/home/hooks/use-home.ts`
- Modify: `src/features/home/components/mulearner-home.tsx`

- [ ] **Step 1.1: Add endpoints**

Open `src/api/endpoints.ts`. Inside the `dashboard` namespace (or create a new `learner` namespace), add:

```typescript
// inside the `export const endpoints = {` object, add a top-level key:
learner: {
  /** GET - Learner dashboard summary (stats, next meeting, quick action counts) */
  homeSummary: "/api/v1/dashboard/home/learner/summary/",
  /** GET - Standalone streak data */
  streak: "/api/v1/dashboard/home/learner/streak/",
},
```

- [ ] **Step 1.2: Add Zod schemas**

Open `src/features/home/schemas/home.schema.ts`. Append at the end of the file:

```typescript
// ============================================
// Learner Home Summary (/dashboard/home/learner/summary/)
// ============================================

export const LearnerStatsSchema = z.object({
  weekly_karma: z.number(),
  total_karma: z.number(),
  rank: z.number().nullable(),
  active_circles: z.number(),
  streak_days: z.number(),
});
export type LearnerStats = z.infer<typeof LearnerStatsSchema>;

export const LearnerNextMeetingSchema = z
  .object({
    id: z.string(),
    circle_id: z.string(),
    circle_name: z.string(),
    title: z.string(),
    starts_at: z.string(),
    duration_minutes: z.number(),
    meeting_link: z.string().nullable(),
    rsvp_status: z.string(),
  })
  .nullable();
export type LearnerNextMeeting = z.infer<typeof LearnerNextMeetingSchema>;

export const LearnerQuickActionCountsSchema = z.object({
  circles: z.number(),
  leaderboard_rank: z.number().nullable(),
  job_openings: z.number(),
});
export type LearnerQuickActionCounts = z.infer<
  typeof LearnerQuickActionCountsSchema
>;

export const LearnerHomeSummaryDataSchema = z.object({
  stats: LearnerStatsSchema,
  next_meeting: LearnerNextMeetingSchema,
  quick_action_counts: LearnerQuickActionCountsSchema,
});
export type LearnerHomeSummaryData = z.infer<typeof LearnerHomeSummaryDataSchema>;

export const LearnerHomeSummaryResponseSchema = ApiResponseSchema(
  LearnerHomeSummaryDataSchema,
);

// ============================================
// Learner Streak (/dashboard/home/learner/streak/)
// ============================================

export const LearnerStreakDataSchema = z.object({
  streak_days: z.number(),
  last_activity_at: z.string().nullable(),
  activity_dates: z.array(z.string()),
});
export type LearnerStreakData = z.infer<typeof LearnerStreakDataSchema>;

export const LearnerStreakResponseSchema = ApiResponseSchema(
  LearnerStreakDataSchema,
);
```

- [ ] **Step 1.3: Export new schemas from schemas/index.ts**

Open `src/features/home/schemas/index.ts`. Add exports:

```typescript
export {
  LearnerHomeSummaryResponseSchema,
  LearnerStreakResponseSchema,
} from "./home.schema";
export type {
  LearnerStats,
  LearnerNextMeeting,
  LearnerQuickActionCounts,
  LearnerHomeSummaryData,
  LearnerStreakData,
} from "./home.schema";
```

- [ ] **Step 1.4: Add API functions**

Open `src/features/home/api/home.api.ts`. Add imports at top:

```typescript
import {
  // existing imports ...
  LearnerHomeSummaryResponseSchema,
  LearnerStreakResponseSchema,
} from "../schemas";
```

Append functions at the end:

```typescript
// ============================================
// Learner Home Summary
// ============================================

export async function getLearnerHomeSummary() {
  const response = await apiClient.get(
    endpoints.learner.homeSummary,
    LearnerHomeSummaryResponseSchema,
  );
  return response.response;
}

export async function getLearnerStreak() {
  const response = await apiClient.get(
    endpoints.learner.streak,
    LearnerStreakResponseSchema,
  );
  return response.response;
}
```

- [ ] **Step 1.5: Add query keys**

Open `src/features/home/hooks/query-keys.ts`. Add to the `homeKeys` object:

```typescript
export const homeKeys = {
  // ... existing keys ...
  learnerHomeSummary: () => [...homeKeys.all, "learner", "home-summary"] as const,
  learnerStreak: () => [...homeKeys.all, "learner", "streak"] as const,
};
```

- [ ] **Step 1.6: Add React Query hooks**

Open `src/features/home/hooks/use-home.ts`. Add imports:

```typescript
import {
  // existing imports ...
  getLearnerHomeSummary,
  getLearnerStreak,
} from "../api";
```

Append hooks:

```typescript
export function useLearnerHomeSummary() {
  return useQuery({
    queryKey: homeKeys.learnerHomeSummary(),
    queryFn: getLearnerHomeSummary,
    staleTime: HOME_STALE_TIME,
  });
}

export function useLearnerStreak() {
  return useQuery({
    queryKey: homeKeys.learnerStreak(),
    queryFn: getLearnerStreak,
    staleTime: HOME_STALE_TIME,
  });
}
```

- [ ] **Step 1.7: Export new hooks from hooks/index.ts**

Open `src/features/home/hooks/index.ts`. Add:

```typescript
export { useLearnerHomeSummary, useLearnerStreak } from "./use-home";
```

- [ ] **Step 1.8: Update MuLearnerHome**

Open `src/features/home/components/mulearner-home.tsx`. Replace the full file with:

```tsx
"use client";

import { useUserInfo, useUserProfile } from "@/features/auth/hooks/use-session";
import {
  useCalendarEvents,
  useInterestGroupsList,
  useLearnerHomeSummary,
} from "../hooks";
import { EventCalendarCard } from "./event-calendar-card";
import { HeroCard } from "./hero-card";
import { HomeStatsPanel } from "./home-stats-panel";
import { InterestGroupsCard } from "./interest-groups-card";
import { KarmaEarnersCard } from "./karma-earners-card";
import { LearningCirclesCard } from "./learning-circles-card";
import { QuickActionRow } from "./quick-action-row";

export function MuLearnerHome() {
  const { data: userInfo } = useUserInfo();
  const { data: userProfile } = useUserProfile();
  const { data: interestGroups, isLoading: loadingGroups } =
    useInterestGroupsList();
  const { data: calendarEvents, isLoading: loadingCalendar } =
    useCalendarEvents();
  const { data: summary } = useLearnerHomeSummary();

  const displayName = userInfo?.full_name?.split(" ")[0] ?? "Learner";
  const groups = interestGroups ?? [];

  const circleCount = summary?.quick_action_counts.circles ?? 0;
  const rank = summary?.stats.rank ?? userProfile?.rank ?? null;
  const jobCount = summary?.quick_action_counts.job_openings ?? 0;

  return (
    <div className="space-y-5">
      <QuickActionRow
        circleCount={circleCount}
        rank={rank}
        jobCount={jobCount}
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_296px]">
        <div className="space-y-5">
          <HeroCard name={displayName} />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-[3fr_2fr]">
            <LearningCirclesCard
              userInterestGroups={userProfile?.interest_groups}
            />
            <InterestGroupsCard groups={groups} isLoading={loadingGroups} />
          </div>
          <KarmaEarnersCard />
        </div>
        <div className="space-y-5 self-start lg:sticky lg:top-5">
          <HomeStatsPanel
            karma={summary?.stats.total_karma ?? 0}
            rank={rank}
            activeCircles={circleCount}
            streakDays={summary?.stats.streak_days ?? 0}
          />
          <EventCalendarCard
            events={calendarEvents}
            isLoading={loadingCalendar}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 1.9: Commit**

```bash
git add src/api/endpoints.ts \
        src/features/home/schemas/home.schema.ts \
        src/features/home/schemas/index.ts \
        src/features/home/api/home.api.ts \
        src/features/home/hooks/query-keys.ts \
        src/features/home/hooks/use-home.ts \
        src/features/home/hooks/index.ts \
        src/features/home/components/mulearner-home.tsx
git commit -m "feat(learner): integrate home summary API, wire HomeStatsPanel and QuickActionRow"
```

---

## Task 2: Mentor Dashboard Summary

Integrates `GET /api/v1/dashboard/mentor/overview/home-summary/` to replace the three separate API calls in `MentorHome` (overview + sessions + mentees) with one consolidated call. The new endpoint delivers `next_session`, `stat_cards[]`, `upcoming_sessions`, `session_requests`, `mentee_progress`, and `expertise_tags`.

**Files:**
- Modify: `src/api/endpoints.ts`
- Modify: `src/features/home/schemas/home.schema.ts`
- Modify: `src/features/home/api/home.api.ts`
- Modify: `src/features/home/hooks/query-keys.ts`
- Modify: `src/features/home/hooks/use-home.ts`
- Modify: `src/features/home/hooks/index.ts`
- Modify: `src/features/home/components/mentor-home.tsx`
- Modify: `src/features/home/components/mentor/mentor-stat-cards.tsx`
- Modify: `src/features/home/components/mentor/mentor-hero-card.tsx`

- [ ] **Step 2.1: Add endpoint**

In `src/api/endpoints.ts`, inside the existing `mentor` namespace add:

```typescript
mentor: {
  // existing keys (overview, sessions, mentees, personaIgRoles, personaSwitch) ...
  /** GET - Single-call mentor home summary */
  homeSummary: "/api/v1/dashboard/mentor/overview/home-summary/",
},
```

- [ ] **Step 2.2: Add Zod schemas**

Append to `src/features/home/schemas/home.schema.ts`:

```typescript
// ============================================
// Mentor Home Summary (/mentor/overview/home-summary/)
// ============================================

export const MentorStatCardSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.number(),
  delta: z.number(),
  delta_type: z.enum(["positive", "negative", "neutral"]),
  period: z.string(),
});
export type MentorStatCard = z.infer<typeof MentorStatCardSchema>;

export const MentorNextSessionSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    mentee_name: z.string(),
    mentee_muid: z.string(),
    starts_at: z.string(),
    mode: z.string(),
    meeting_link: z.string().nullable(),
  })
  .nullable();
export type MentorNextSession = z.infer<typeof MentorNextSessionSchema>;

// Reuse MentorSessionSchema (already defined) for upcoming_sessions list
// Reuse MentorMenteeSchema (already defined) for mentee_progress list

export const MentorHomeSummaryDataSchema = z.object({
  next_session: MentorNextSessionSchema,
  stat_cards: z.array(MentorStatCardSchema),
  upcoming_sessions: z.array(MentorSessionSchema),
  session_requests: z.array(MentorSessionSchema),
  mentee_progress: z.array(MentorMenteeSchema),
  expertise_tags: z.array(z.string()),
});
export type MentorHomeSummaryData = z.infer<typeof MentorHomeSummaryDataSchema>;

export const MentorHomeSummaryResponseSchema = ApiResponseSchema(
  MentorHomeSummaryDataSchema,
);
```

- [ ] **Step 2.3: Export new schemas from schemas/index.ts**

In `src/features/home/schemas/index.ts` add:

```typescript
export {
  MentorHomeSummaryResponseSchema,
} from "./home.schema";
export type {
  MentorStatCard,
  MentorNextSession,
  MentorHomeSummaryData,
} from "./home.schema";
```

- [ ] **Step 2.4: Add API function**

In `src/features/home/api/home.api.ts`, add import and function:

```typescript
import {
  // existing ...
  MentorHomeSummaryResponseSchema,
} from "../schemas";

// ============================================
// Mentor Home Summary
// ============================================

export async function getMentorHomeSummary() {
  const response = await apiClient.get(
    endpoints.mentor.homeSummary,
    MentorHomeSummaryResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return response.response;
}
```

- [ ] **Step 2.5: Add query key and hook**

In `src/features/home/hooks/query-keys.ts` add:

```typescript
mentorHomeSummary: () => [...homeKeys.all, "mentor", "home-summary"] as const,
```

In `src/features/home/hooks/use-home.ts` add import and hook:

```typescript
import { getMentorHomeSummary, /* existing */ } from "../api";

export function useMentorHomeSummary() {
  return useQuery({
    queryKey: homeKeys.mentorHomeSummary(),
    queryFn: getMentorHomeSummary,
    staleTime: HOME_STALE_TIME,
    retry: no403Retry,
  });
}
```

Export from `src/features/home/hooks/index.ts`:

```typescript
export { useMentorHomeSummary } from "./use-home";
```

- [ ] **Step 2.6: Update MentorStatCards to accept stat_cards array**

Open `src/features/home/components/mentor/mentor-stat-cards.tsx`. Read its current props. Replace the hardcoded-number props with the new stat_cards array:

```tsx
import type { MentorStatCard } from "../../schemas/home.schema";

type Props = {
  statCards: MentorStatCard[];
  isLoading: boolean;
};

export function MentorStatCards({ statCards, isLoading }: Props) {
  // derive values from stat_cards by key for backwards-compatible display
  const get = (key: string) =>
    statCards.find((c) => c.key === key)?.value ?? 0;

  const cards = [
    {
      key: "active_mentees",
      label: "Active Mentees",
      value: get("active_mentees"),
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      key: "sessions_conducted",
      label: "Sessions Conducted",
      value: get("sessions_conducted"),
      iconColor: "text-success",
      iconBg: "bg-success/10",
    },
    {
      key: "volunteer_hours",
      label: "Hours Mentored",
      value: get("volunteer_hours"),
      iconColor: "text-warning",
      iconBg: "bg-warning/10",
    },
    {
      key: "pending_task_approvals",
      label: "Pending Approvals",
      value: get("pending_task_approvals"),
      iconColor: "text-destructive",
      iconBg: "bg-destructive/10",
    },
  ];

  // Render each card using the same visual style as before.
  // Keep the existing Skeleton / value display markup — only prop shape changes.
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.key} className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className={`mb-3 flex size-10 items-center justify-center rounded-xl ${card.iconBg}`}>
            {/* icon placeholder — keep whatever icons were used before */}
          </div>
          {isLoading ? (
            <>
              <Skeleton className="mb-1.5 h-8 w-16 rounded-md" />
              <Skeleton className="h-3.5 w-28 rounded-md" />
            </>
          ) : (
            <>
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {card.value}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {card.label}
              </p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
```

**Note:** Read the full existing file first so you preserve all Lucide icons and styling exactly. Only the props type and data sourcing change.

- [ ] **Step 2.7: Update MentorHome to use home-summary**

Open `src/features/home/components/mentor-home.tsx`. Replace the three `useMentorOverview`, `useMentorSessions`, `useMentorMentees` calls with a single `useMentorHomeSummary`:

```tsx
"use client";

import { useMentorHomeSummary } from "../hooks";
import { AvailabilityCard } from "./mentor/availability-card";
import { MenteeProgressCard } from "./mentor/mentee-progress-card";
import { MentorHeroCard } from "./mentor/mentor-hero-card";
import { MentorSetupPrompt } from "./mentor/mentor-setup-prompt";
import { MentorStatCards } from "./mentor/mentor-stat-cards";
import { SessionRequestsCard } from "./mentor/session-requests-card";
import { UpcomingSessionsCard } from "./mentor/upcoming-sessions-card";

export function MentorHome() {
  const { data: summary, isLoading, error } = useMentorHomeSummary();

  const is403 =
    error instanceof Error &&
    "status" in error &&
    (error as { status: number }).status === 403;

  if (is403) {
    return <MentorSetupPrompt />;
  }

  return (
    <div className="space-y-5">
      <MentorHeroCard
        nextSession={summary?.next_session ?? null}
        isVerified={false}
      />
      <MentorStatCards
        statCards={summary?.stat_cards ?? []}
        isLoading={isLoading}
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <UpcomingSessionsCard
          sessions={summary?.upcoming_sessions ?? []}
          isLoading={isLoading}
        />
        <SessionRequestsCard
          sessions={summary?.session_requests ?? []}
          isLoading={isLoading}
        />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr]">
        <MenteeProgressCard
          mentees={summary?.mentee_progress ?? []}
          isLoading={isLoading}
        />
        <AvailabilityCard
          expertise={summary?.expertise_tags ?? []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
```

**Note:** `MentorHeroCard` currently expects a `MentorSession` for `nextSession`. The home-summary returns a `MentorNextSession` object with a different shape (`mentee_name`, `mentee_muid` instead of `participants`). Read `mentor-hero-card.tsx` first — if it reads `participants[0]`, update the card to accept the new type as a union or update the prop type to `MentorNextSession | null`.

- [ ] **Step 2.8: Commit**

```bash
git add src/api/endpoints.ts \
        src/features/home/schemas/home.schema.ts \
        src/features/home/schemas/index.ts \
        src/features/home/api/home.api.ts \
        src/features/home/hooks/query-keys.ts \
        src/features/home/hooks/use-home.ts \
        src/features/home/hooks/index.ts \
        src/features/home/components/mentor-home.tsx \
        src/features/home/components/mentor/mentor-stat-cards.tsx
git commit -m "feat(mentor): replace 3 separate API calls with home-summary endpoint"
```

---

## Task 3: Company Dashboard Summary

Integrates `GET /api/v1/dashboard/company/home-summary/` to surface real application counts and a richer talent pool breakdown (total learners, level distribution, top IGs with learner counts) in `CompanyStatCards` and `TalentPoolCard`.

**Files:**
- Modify: `src/api/endpoints.ts`
- Modify: `src/features/home/schemas/home.schema.ts`
- Modify: `src/features/home/api/home.api.ts`
- Modify: `src/features/home/hooks/query-keys.ts`
- Modify: `src/features/home/hooks/use-home.ts`
- Modify: `src/features/home/hooks/index.ts`
- Modify: `src/features/home/components/company-home.tsx`
- Modify: `src/features/home/components/company/company-stat-cards.tsx`
- Modify: `src/features/home/components/company/talent-pool-card.tsx`

- [ ] **Step 3.1: Add endpoint**

In `src/api/endpoints.ts`, inside the existing `company` namespace add:

```typescript
company: {
  // existing keys ...
  /** GET - Company home dashboard summary */
  homeSummary: "/api/v1/dashboard/company/home-summary/",
  /** GET - Standalone talent pool analytics */
  talentPoolAnalytics: "/api/v1/dashboard/company/talent-pool/analytics/",
},
```

- [ ] **Step 3.2: Add Zod schemas**

Append to `src/features/home/schemas/home.schema.ts`:

```typescript
// ============================================
// Company Home Summary (/dashboard/company/home-summary/)
// ============================================

export const CompanyQuickStatsSchema = z.object({
  jobs_posted: z.number(),
  total_views: z.number(),
  applications: z.number(),
  hired: z.number(),
});
export type CompanyQuickStats = z.infer<typeof CompanyQuickStatsSchema>;

export const LevelDistributionItemSchema = z.object({
  level_id: z.string(),
  level_name: z.string(),
  level_order: z.number(),
  count: z.number(),
  percentage: z.number(),
});
export type LevelDistributionItem = z.infer<typeof LevelDistributionItemSchema>;

export const TalentPoolTopIgSchema = z.object({
  ig_id: z.string(),
  name: z.string(),
  learner_count: z.number(),
  total_karma: z.number(),
});
export type TalentPoolTopIg = z.infer<typeof TalentPoolTopIgSchema>;

export const CompanyTalentPoolSchema = z.object({
  total_learners: z.number(),
  level_distribution: z.array(LevelDistributionItemSchema),
  top_interest_groups: z.array(TalentPoolTopIgSchema),
});
export type CompanyTalentPool = z.infer<typeof CompanyTalentPoolSchema>;

export const CompanyHomeSummaryDataSchema = z.object({
  company: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    status: z.string(),
    logo: z.string().nullable(),
  }),
  quick_stats: CompanyQuickStatsSchema,
  stat_cards: z.array(z.unknown()),
  talent_pool: CompanyTalentPoolSchema,
});
export type CompanyHomeSummaryData = z.infer<typeof CompanyHomeSummaryDataSchema>;

export const CompanyHomeSummaryResponseSchema = ApiResponseSchema(
  CompanyHomeSummaryDataSchema,
);
```

- [ ] **Step 3.3: Export schemas from schemas/index.ts**

Add to `src/features/home/schemas/index.ts`:

```typescript
export { CompanyHomeSummaryResponseSchema } from "./home.schema";
export type {
  CompanyQuickStats,
  CompanyTalentPool,
  TalentPoolTopIg,
  LevelDistributionItem,
  CompanyHomeSummaryData,
} from "./home.schema";
```

- [ ] **Step 3.4: Add API function**

In `src/features/home/api/home.api.ts`, add:

```typescript
import {
  // existing ...
  CompanyHomeSummaryResponseSchema,
} from "../schemas";

// ============================================
// Company Home Summary
// ============================================

export async function getCompanyHomeSummary() {
  const response = await apiClient.get(
    endpoints.company.homeSummary,
    CompanyHomeSummaryResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return response.response;
}
```

- [ ] **Step 3.5: Add query key and hook**

In `src/features/home/hooks/query-keys.ts` add:

```typescript
companyHomeSummary: () => [...homeKeys.all, "company", "home-summary"] as const,
```

In `src/features/home/hooks/use-home.ts` add:

```typescript
import { getCompanyHomeSummary, /* existing */ } from "../api";

export function useCompanyHomeSummary() {
  return useQuery({
    queryKey: homeKeys.companyHomeSummary(),
    queryFn: getCompanyHomeSummary,
    staleTime: HOME_STALE_TIME,
    retry: no403Retry,
  });
}
```

Export from `src/features/home/hooks/index.ts`:

```typescript
export { useCompanyHomeSummary } from "./use-home";
```

- [ ] **Step 3.6: Update CompanyStatCards to show applications and hired**

Open `src/features/home/components/company/company-stat-cards.tsx`. The component currently shows hardcoded "MuLearn" and "Kerala" for two of three cards. Update it to accept `quickStats` from the API:

```tsx
import { Briefcase, Target, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { CompanyQuickStats } from "../../schemas/home.schema";

type Props = {
  quickStats?: CompanyQuickStats;
  isLoading: boolean;
};

export function CompanyStatCards({ quickStats, isLoading }: Props) {
  const cards = [
    {
      key: "jobsPosted",
      label: "JOBS POSTED",
      icon: Briefcase,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      value: quickStats?.jobs_posted.toString() ?? "—",
      subLabel: "active listings",
    },
    {
      key: "applications",
      label: "APPLICATIONS",
      icon: Target,
      iconColor: "text-success",
      iconBg: "bg-success/10",
      value: quickStats?.applications.toString() ?? "—",
      subLabel: "total received",
    },
    {
      key: "hired",
      label: "HIRED",
      icon: Users,
      iconColor: "text-brand-purple",
      iconBg: "bg-brand-purple/10",
      value: quickStats?.hired.toString() ?? "—",
      subLabel: "via muLearn",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.key} className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className={`mb-3 flex size-10 items-center justify-center rounded-xl ${card.iconBg}`}>
              <Icon className={`size-5 ${card.iconColor}`} />
            </div>
            {isLoading ? (
              <>
                <Skeleton className="mb-1.5 h-8 w-16 rounded-md" />
                <Skeleton className="h-3.5 w-24 rounded-md" />
              </>
            ) : (
              <>
                <p className="text-3xl font-bold tracking-tight text-foreground">
                  {card.value}
                </p>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {card.label}
                </p>
                <p className="mt-2.5 text-xs text-muted-foreground">{card.subLabel}</p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3.7: Update TalentPoolCard to use real talent pool data**

Open `src/features/home/components/company/talent-pool-card.tsx`. It currently accepts `interestGroups: InterestGroupListItem[]` (generic list from the IGs endpoint). Update it to accept `talentPool?: CompanyTalentPool`:

```tsx
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CompanyTalentPool } from "../../schemas/home.schema";

type Props = {
  talentPool?: CompanyTalentPool;
  isLoading: boolean;
};

const LEVEL_COLORS = ["#374151", "#6366f1", "#a855f7", "#f59e0b", "#10b981"];

export function TalentPoolCard({ talentPool, isLoading }: Props) {
  const topIgs = talentPool?.top_interest_groups.slice(0, 4) ?? [];
  const totalLearners = talentPool?.total_learners ?? 0;

  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex-row items-center gap-2.5 px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-success/10">
          <Users className="size-4 text-success" />
        </div>
        <CardTitle className="text-base font-bold text-foreground">
          Talent Pool
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        <p className="mb-5 text-xs text-muted-foreground">
          {totalLearners > 0
            ? `${totalLearners.toLocaleString()} MuLearn verified learners`
            : "MuLearn verified learners network"}
        </p>

        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Top Interest Groups
        </p>
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-5 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {topIgs.map((ig, idx) => {
              const maxCount = topIgs[0]?.learner_count ?? 1;
              const pct = Math.round((ig.learner_count / maxCount) * 100);
              return (
                <div key={ig.ig_id} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate text-xs font-medium text-foreground">
                    {ig.name}
                  </span>
                  <div className="flex-1 overflow-hidden rounded-full bg-muted h-2">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: LEVEL_COLORS[idx % LEVEL_COLORS.length],
                      }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-[11px] text-muted-foreground">
                    {ig.learner_count.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3.8: Update CompanyHome**

Open `src/features/home/components/company-home.tsx`. Replace the `useInterestGroupsList` + individual data sources with `useCompanyHomeSummary`:

```tsx
"use client";

import { useCompanyOnboardingStatus } from "@/features/auth/hooks";
import { useUserInfo } from "@/features/auth/hooks/use-session";
import { useCompanyProfile } from "@/features/company-jobs/hooks/use-company-profile";
import { useJobs } from "@/features/company-jobs/hooks/use-jobs";
import { ROLES } from "@/lib/auth";
import { useCompanyHomeSummary } from "../hooks";
import { ActiveJobListingsCard } from "./company/active-job-listings-card";
import { CompanyHeroCard } from "./company/company-hero-card";
import { CompanyStatCards } from "./company/company-stat-cards";
import { CompanyVerifiedBanner } from "./company/company-verified-banner";
import { TalentPoolCard } from "./company/talent-pool-card";

export function CompanyHome() {
  const { data: userInfo } = useUserInfo();
  const isCompany = userInfo?.roles?.includes(ROLES.COMPANY) ?? false;
  const { data: companyStatus } = useCompanyOnboardingStatus(isCompany);
  const { profile, isLoading: profileLoading } = useCompanyProfile();
  const { data: jobsData, isLoading: jobsLoading } = useJobs({ perPage: 100 });
  const { data: summary, isLoading: summaryLoading } = useCompanyHomeSummary();

  const jobsPosted = summary?.quick_stats.jobs_posted ?? jobsData?.pagination?.count ?? 0;
  const companyName = profile?.name ?? undefined;

  return (
    <div className="space-y-5">
      <CompanyVerifiedBanner status={companyStatus} companyName={companyName} />
      <CompanyHeroCard
        jobsPosted={jobsPosted}
        isLoading={jobsLoading || profileLoading}
      />
      <CompanyStatCards
        quickStats={summary?.quick_stats}
        isLoading={summaryLoading}
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_296px]">
        <ActiveJobListingsCard />
        <TalentPoolCard
          talentPool={summary?.talent_pool}
          isLoading={summaryLoading}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3.9: Commit**

```bash
git add src/api/endpoints.ts \
        src/features/home/schemas/home.schema.ts \
        src/features/home/schemas/index.ts \
        src/features/home/api/home.api.ts \
        src/features/home/hooks/query-keys.ts \
        src/features/home/hooks/use-home.ts \
        src/features/home/hooks/index.ts \
        src/features/home/components/company-home.tsx \
        src/features/home/components/company/company-stat-cards.tsx \
        src/features/home/components/company/talent-pool-card.tsx
git commit -m "feat(company): integrate home-summary API, add applications/hired stats, real talent pool data"
```

---

## Task 4: Campus Dashboard — Replace All Three Mock Constants

Integrates four campus endpoints to permanently delete `src/features/home/constants/mock-campus.ts`. Uses the home-summary for a single round-trip, with standalone endpoints available for future independent refresh.

**Endpoints:**
- `GET /api/v1/dashboard/campus/home-summary/`
- `GET /api/v1/dashboard/campus/member-funnel/`
- `GET /api/v1/dashboard/campus/circle-health/`
- `GET /api/v1/dashboard/campus/recent-activity/`

**Files:**
- Modify: `src/api/endpoints.ts`
- Modify: `src/features/home/schemas/home.schema.ts`
- Modify: `src/features/home/api/home.api.ts`
- Modify: `src/features/home/hooks/query-keys.ts`
- Modify: `src/features/home/hooks/use-home.ts`
- Modify: `src/features/home/hooks/index.ts`
- Modify: `src/features/home/components/campus/member-funnel-card.tsx`
- Modify: `src/features/home/components/campus/circle-health-card.tsx`
- Modify: `src/features/home/components/campus/recent-activity-card.tsx`
- Modify: `src/features/home/components/enabler-home.tsx`
- Delete: `src/features/home/constants/mock-campus.ts`

- [ ] **Step 4.1: Add endpoints**

In `src/api/endpoints.ts`, add inside the existing `campusManage` namespace (or create a new `campusDashboard` key):

```typescript
campusDashboard: {
  /** GET - Single-call campus home summary */
  homeSummary: "/api/v1/dashboard/campus/home-summary/",
  /** GET - Standalone member funnel */
  memberFunnel: "/api/v1/dashboard/campus/member-funnel/",
  /** GET - Standalone circle health */
  circleHealth: "/api/v1/dashboard/campus/circle-health/",
  /** GET - Standalone recent activity feed */
  recentActivity: "/api/v1/dashboard/campus/recent-activity/",
},
```

- [ ] **Step 4.2: Add Zod schemas**

Append to `src/features/home/schemas/home.schema.ts`:

```typescript
// ============================================
// Campus Dashboard (/dashboard/campus/*)
// ============================================

// Member Funnel
export const CampusFunnelStageSchema = z.object({
  key: z.string(),
  label: z.string(),
  count: z.number(),
  percentage: z.number(),
});
export type CampusFunnelStage = z.infer<typeof CampusFunnelStageSchema>;

export const CampusMemberFunnelDataSchema = z.object({
  max: z.number(),
  stages: z.array(CampusFunnelStageSchema),
});
export type CampusMemberFunnelData = z.infer<typeof CampusMemberFunnelDataSchema>;

export const CampusMemberFunnelResponseSchema = ApiResponseSchema(
  CampusMemberFunnelDataSchema,
);

// Circle Health
export const CampusCircleHealthItemSchema = z.object({
  circle_id: z.string(),
  circle_name: z.string(),
  ig_id: z.string(),
  ig_name: z.string(),
  member_count: z.number(),
  sessions_per_month: z.number(),
  last_session_at: z.string().nullable(),
  status: z.enum(["active", "slow", "inactive"]),
});
export type CampusCircleHealthItem = z.infer<typeof CampusCircleHealthItemSchema>;

export const CampusCircleHealthResponseSchema = ApiResponseSchema(
  z.object({ data: z.array(CampusCircleHealthItemSchema) }),
);

// Recent Activity
export const CampusActivityActorSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  muid: z.string(),
  profile_pic: z.string().nullable(),
});

export const CampusRecentActivityItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  description: z.string(),
  created_at: z.string(),
  actor: CampusActivityActorSchema,
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type CampusRecentActivityItem = z.infer<
  typeof CampusRecentActivityItemSchema
>;

export const CampusRecentActivityResponseSchema = ApiResponseSchema(
  z.object({ data: z.array(CampusRecentActivityItemSchema) }),
);

// Campus Home Summary (wraps all three)
export const CampusHomeSummaryDataSchema = z.object({
  campus: z.object({
    org_id: z.string(),
    college_name: z.string(),
    campus_code: z.string(),
    campus_zone: z.string(),
  }),
  stat_cards: z.array(z.unknown()),
  member_funnel: CampusMemberFunnelDataSchema,
  circle_health: z.array(CampusCircleHealthItemSchema),
  recent_activity: z.array(CampusRecentActivityItemSchema),
});
export type CampusHomeSummaryData = z.infer<typeof CampusHomeSummaryDataSchema>;

export const CampusHomeSummaryResponseSchema = ApiResponseSchema(
  CampusHomeSummaryDataSchema,
);
```

- [ ] **Step 4.3: Export schemas**

Add to `src/features/home/schemas/index.ts`:

```typescript
export {
  CampusMemberFunnelResponseSchema,
  CampusCircleHealthResponseSchema,
  CampusRecentActivityResponseSchema,
  CampusHomeSummaryResponseSchema,
} from "./home.schema";
export type {
  CampusFunnelStage,
  CampusMemberFunnelData,
  CampusCircleHealthItem,
  CampusRecentActivityItem,
  CampusHomeSummaryData,
} from "./home.schema";
```

- [ ] **Step 4.4: Add API functions**

In `src/features/home/api/home.api.ts`, add imports and functions:

```typescript
import {
  // existing ...
  CampusMemberFunnelResponseSchema,
  CampusCircleHealthResponseSchema,
  CampusRecentActivityResponseSchema,
  CampusHomeSummaryResponseSchema,
} from "../schemas";

// ============================================
// Campus Dashboard
// ============================================

export async function getCampusHomeSummary() {
  const response = await apiClient.get(
    endpoints.campusDashboard.homeSummary,
    CampusHomeSummaryResponseSchema,
  );
  return response.response;
}

export async function getCampusMemberFunnel() {
  const response = await apiClient.get(
    endpoints.campusDashboard.memberFunnel,
    CampusMemberFunnelResponseSchema,
  );
  return response.response;
}

export async function getCampusCircleHealth() {
  const response = await apiClient.get(
    endpoints.campusDashboard.circleHealth,
    CampusCircleHealthResponseSchema,
  );
  return response.response.data;
}

export async function getCampusRecentActivity(limit = 10) {
  const url = `${endpoints.campusDashboard.recentActivity}?limit=${limit}`;
  const response = await apiClient.get(
    url,
    CampusRecentActivityResponseSchema,
  );
  return response.response.data;
}
```

- [ ] **Step 4.5: Add query keys and hooks**

In `src/features/home/hooks/query-keys.ts` add:

```typescript
campusHomeSummary: () => [...homeKeys.all, "campus", "home-summary"] as const,
campusMemberFunnel: () => [...homeKeys.all, "campus", "member-funnel"] as const,
campusCircleHealth: () => [...homeKeys.all, "campus", "circle-health"] as const,
campusRecentActivity: () => [...homeKeys.all, "campus", "recent-activity"] as const,
```

In `src/features/home/hooks/use-home.ts` add:

```typescript
import {
  getCampusHomeSummary,
  getCampusMemberFunnel,
  getCampusCircleHealth,
  getCampusRecentActivity,
  // existing ...
} from "../api";

export function useCampusHomeSummary() {
  return useQuery({
    queryKey: homeKeys.campusHomeSummary(),
    queryFn: getCampusHomeSummary,
    staleTime: HOME_STALE_TIME,
  });
}

export function useCampusMemberFunnel() {
  return useQuery({
    queryKey: homeKeys.campusMemberFunnel(),
    queryFn: getCampusMemberFunnel,
    staleTime: HOME_STALE_TIME,
  });
}

export function useCampusCircleHealth() {
  return useQuery({
    queryKey: homeKeys.campusCircleHealth(),
    queryFn: getCampusCircleHealth,
    staleTime: HOME_STALE_TIME,
  });
}

export function useCampusRecentActivity() {
  return useQuery({
    queryKey: homeKeys.campusRecentActivity(),
    queryFn: getCampusRecentActivity,
    staleTime: 2 * 60 * 1000,
  });
}
```

Export from `src/features/home/hooks/index.ts`:

```typescript
export {
  useCampusHomeSummary,
  useCampusMemberFunnel,
  useCampusCircleHealth,
  useCampusRecentActivity,
} from "./use-home";
```

- [ ] **Step 4.6: Update MemberFunnelCard**

Open `src/features/home/components/campus/member-funnel-card.tsx`. Replace mock data with props:

```tsx
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CampusFunnelStage, CampusMemberFunnelData } from "../../schemas/home.schema";

type MemberFunnelCardProps = {
  funnelData?: CampusMemberFunnelData;
  campusLabel?: string;
  isLoading?: boolean;
};

function FunnelRow({ stage, maxValue }: { stage: CampusFunnelStage; maxValue: number }) {
  const pct = Math.round((stage.count / maxValue) * 100);
  const colors = ["#6366f1", "#8b5cf6", "#3b82f6", "#10b981", "#06b6d4"];
  const colorIdx = ["registered", "onboarded", "active"].indexOf(stage.key);
  const color = colors[colorIdx >= 0 ? colorIdx : 0];
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-xs font-medium text-muted-foreground">
        {stage.label}
      </span>
      <div className="flex-1 overflow-hidden rounded-full bg-muted h-2.5">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-xs font-semibold text-foreground">
        {stage.count}
      </span>
    </div>
  );
}

export function MemberFunnelCard({ funnelData, campusLabel, isLoading }: MemberFunnelCardProps) {
  return (
    <Card className="h-full rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex-row items-center gap-2.5 px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-warning/10">
          <BarChart3 className="size-4 text-warning" />
        </div>
        <CardTitle className="text-base font-bold text-foreground">Member Funnel</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        {campusLabel && (
          <p className="mb-4 text-[11px] text-muted-foreground">{campusLabel}</p>
        )}
        {isLoading ? (
          <div className="space-y-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-2.5 flex-1 rounded-full" />
                <Skeleton className="h-3 w-8 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {(funnelData?.stages ?? []).map((stage) => (
              <FunnelRow key={stage.key} stage={stage} maxValue={funnelData?.max ?? 1} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4.7: Update CircleHealthCard**

Open `src/features/home/components/campus/circle-health-card.tsx`. Remove the mock import entirely and accept real data as a prop:

```tsx
import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { CampusCircleHealthItem } from "../../schemas/home.schema";

type CircleHealthCardProps = {
  items?: CampusCircleHealthItem[];
  isLoading?: boolean;
};

const STATUS_STYLES: Record<"active" | "slow" | "inactive", string> = {
  active: "bg-success/15 text-success",
  slow: "bg-warning/15 text-warning",
  inactive: "bg-destructive/15 text-destructive",
};

export function CircleHealthCard({ items = [], isLoading }: CircleHealthCardProps) {
  return (
    <Card className="h-full rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex-row items-center gap-2.5 px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-success/10">
          <Activity className="size-4 text-success" />
        </div>
        <CardTitle className="text-base font-bold text-foreground">Circle Health</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-36 rounded" />
                  <Skeleton className="h-3 w-28 rounded" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            {items.map((item) => (
              <div
                key={item.circle_id}
                className="flex items-center justify-between border-b border-border py-3 last:border-b-0"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.circle_name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {item.member_count} members · {item.sessions_per_month} sessions/month
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                    STATUS_STYLES[item.status],
                  )}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4.8: Update RecentActivityCard**

Open `src/features/home/components/campus/recent-activity-card.tsx`. Remove mock import. Accept `items` prop and map API `type` to icons:

```tsx
import { CheckCircle2, CirclePlus, UserPlus, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CampusRecentActivityItem } from "../../schemas/home.schema";

type Props = {
  items?: CampusRecentActivityItem[];
  isLoading?: boolean;
};

const TYPE_META: Record<string, { icon: typeof Zap; color: string }> = {
  level_up: { icon: CheckCircle2, color: "text-success" },
  circle_created: { icon: CirclePlus, color: "text-primary" },
  member_joined: { icon: UserPlus, color: "text-brand-blue" },
  karma_voucher: { icon: Zap, color: "text-warning" },
};
const DEFAULT_META = { icon: Zap, color: "text-muted-foreground" };

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function RecentActivityCard({ items = [], isLoading }: Props) {
  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex-row items-center gap-2.5 px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
          <Zap className="size-4 text-primary" />
        </div>
        <CardTitle className="text-base font-bold text-foreground">
          Recent Campus Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 py-3">
                <Skeleton className="mt-0.5 size-4 rounded-full" />
                <Skeleton className="h-4 flex-1 rounded" />
                <Skeleton className="h-3 w-10 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            {items.map((item) => {
              const meta = TYPE_META[item.type] ?? DEFAULT_META;
              const Icon = meta.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 border-b border-border py-3 last:border-b-0"
                >
                  <Icon className={`mt-0.5 size-4 shrink-0 ${meta.color}`} />
                  <p className="flex-1 text-sm text-foreground">{item.title}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {timeAgo(item.created_at)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4.9: Update EnablerHome**

Open `src/features/home/components/enabler-home.tsx`. Replace the `useIgChapters` pattern for circle health and add hooks for the new data:

```tsx
"use client";

import { useCampusHomeSummary, useCalendarEvents } from "../hooks";
import { CampusStatCards } from "./campus/campus-stat-cards";
import { CircleHealthCard } from "./campus/circle-health-card";
import { MemberFunnelCard } from "./campus/member-funnel-card";
import { RecentActivityCard } from "./campus/recent-activity-card";
import { TopStudentsCard } from "./campus/top-students-card";
import { EventCalendarCard } from "./event-calendar-card";
import {
  useCampusLeaderboard,
  useCampusOverview,
} from "@/features/campus-manage/hooks";

export function EnablerHome() {
  const { data: summary, isLoading: summaryLoading } = useCampusHomeSummary();
  const { data: overview, isLoading: loadingOverview } = useCampusOverview();
  const { data: leaderboardData, isLoading: loadingLeaderboard } =
    useCampusLeaderboard({
      page: 1,
      orgId: overview?.orgId,
      search: "",
      ig: "",
      cluster: "",
      alumni: "all",
    });
  const { data: calendarEvents, isLoading: loadingCalendar } =
    useCalendarEvents();

  const campusLabel = overview
    ? `${overview.collegeName} · ${new Date().toLocaleString("default", { month: "long", year: "numeric" })}`
    : undefined;

  return (
    <div className="space-y-5">
      <CampusStatCards overview={overview} isLoading={loadingOverview} />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <MemberFunnelCard
          funnelData={summary?.member_funnel}
          campusLabel={campusLabel}
          isLoading={summaryLoading}
        />
        <EventCalendarCard
          events={calendarEvents}
          isLoading={loadingCalendar}
        />
        <CircleHealthCard
          items={summary?.circle_health}
          isLoading={summaryLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr]">
        <TopStudentsCard
          items={leaderboardData?.items}
          isLoading={loadingLeaderboard}
          campusName={overview?.collegeName}
        />
        <RecentActivityCard
          items={summary?.recent_activity}
          isLoading={summaryLoading}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 4.10: Delete the mock file**

```bash
git rm src/features/home/constants/mock-campus.ts
```

Verify there are no remaining imports:

```bash
grep -r "mock-campus" src/
# Expected: no output
```

- [ ] **Step 4.11: Commit**

```bash
git add src/api/endpoints.ts \
        src/features/home/schemas/home.schema.ts \
        src/features/home/schemas/index.ts \
        src/features/home/api/home.api.ts \
        src/features/home/hooks/query-keys.ts \
        src/features/home/hooks/use-home.ts \
        src/features/home/hooks/index.ts \
        src/features/home/components/campus/member-funnel-card.tsx \
        src/features/home/components/campus/circle-health-card.tsx \
        src/features/home/components/campus/recent-activity-card.tsx \
        src/features/home/components/enabler-home.tsx
git commit -m "feat(campus): replace all campus mock data with real API endpoints, delete mock-campus.ts"
```

---

## Task 5: Company Public Profile, Extended Fields, and Public Jobs

Integrates three endpoints to replace `MOCK_COMPANY_EXTENDED` and `MOCK_PUBLIC_JOBS` in `company-public-view.tsx`, enabling the public company profile page to show real culture text, tech stack, perks, testimonials, hire stats, and job listings. Also extends the `CompanyProfileSchema` so the own-profile page surfaces the same new fields.

**Endpoints:**
- `GET /api/v1/dashboard/company/profile/public/<slug>/` (extended response — existing URL, new fields)
- `GET /api/v1/dashboard/company/profile/public/<slug>/jobs/` (new)
- `GET /api/v1/dashboard/company/profile/` (extended response for own profile)

**Files:**
- Modify: `src/api/endpoints.ts`
- Modify: `src/features/company-jobs/schemas/jobs.schema.ts`
- Modify: `src/features/company-jobs/api/jobs.api.ts`
- Modify: `src/features/company-jobs/hooks/use-company-profile.ts`
- Modify: `src/features/company-jobs/types/jobs.types.ts`
- Modify: `src/features/company-jobs/components/profile/company-public-view.tsx`
- Delete: `src/features/company-jobs/constants/mock-company-profile.ts`

- [ ] **Step 5.1: Add endpoints**

In `src/api/endpoints.ts`, inside the `company` namespace, add:

```typescript
company: {
  // existing keys ...
  /** GET - Public company profile with extended fields (no auth) */
  publicProfileBySlug: (slug: string) =>
    `/api/v1/dashboard/company/profile/public/${slug}/`,
  /** GET - Public company jobs by slug (no auth) */
  publicJobsBySlug: (slug: string) =>
    `/api/v1/dashboard/company/profile/public/${slug}/jobs/`,
},
```

Note: `company.publicProfile` already exists at line 126 of `endpoints.ts` but uses a different key. Add `publicProfileBySlug` and `publicJobsBySlug` as new keys to avoid breaking existing usages.

- [ ] **Step 5.2: Extend CompanyProfileSchema with optional extended fields**

Open `src/features/company-jobs/schemas/jobs.schema.ts`. Add the extended fields as optional to `CompanyProfileSchema` (these are returned for own profile via the existing GET endpoint):

```typescript
export const CompanyTestimonialSchema = z.object({
  learner_name: z.string(),
  role: z.string(),
  quote: z.string(),
});

export const CompanyGalleryItemSchema = z.object({
  image_url: z.string(),
  caption: z.string().optional(),
  sort_order: z.number().optional(),
});

export const CompanyProfileSchema = z.object({
  // ... keep all existing fields ...
  // Add optional extended fields:
  founded_year: z.number().nullable().optional(),
  remote_policy: z.string().nullable().optional(),
  culture_text: z.string().nullable().optional(),
  tech_stack: z.array(z.string()).optional().default([]),
  perks: z.array(z.string()).optional().default([]),
  testimonials: z.array(CompanyTestimonialSchema).optional().default([]),
  gallery: z.array(CompanyGalleryItemSchema).optional().default([]),
  hire_count: z.number().optional().default(0),
  alumni_count: z.number().optional().default(0),
  avg_karma_of_hires: z.number().optional().default(0),
  campus_events_count: z.number().optional().default(0),
});
```

Add schemas for public profile and public jobs responses:

```typescript
// Public company profile response (no auth, full extended fields)
export const PublicCompanyProfileResponseSchema = DjangoResponse(
  CompanyProfileSchema,
);

// Public company jobs (no auth)
export const PublicJobSchema = z.object({
  id: z.string(),
  title: z.string(),
  job_type: z.string(),
  location: z.string(),
  salary_range: z.string(),
  created_at: z.string(),
  min_karma: z.number().optional(),
  min_level: z.number().optional(),
  tags: z.array(z.string()).optional().default([]),
});
export type PublicJob = z.infer<typeof PublicJobSchema>;

export const PublicJobsPaginationSchema = z.object({
  count: z.number(),
  totalPages: z.number(),
  isFirst: z.boolean(),
  isLast: z.boolean(),
});

export const PublicJobsBySlugDataSchema = z.object({
  company: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
  }),
  jobs: z.array(PublicJobSchema),
  pagination: PublicJobsPaginationSchema,
});

export const PublicJobsBySlugResponseSchema = DjangoResponse(
  PublicJobsBySlugDataSchema,
);
export type PublicJobsBySlugData = z.infer<typeof PublicJobsBySlugDataSchema>;
```

- [ ] **Step 5.3: Add API functions**

In `src/features/company-jobs/api/jobs.api.ts`, add:

```typescript
import {
  // existing ...
  PublicCompanyProfileResponseSchema,
  PublicJobsBySlugResponseSchema,
} from "../schemas";
import type { CompanyProfile, PublicJobsBySlugData } from "../types";

export async function fetchPublicCompanyProfile(slug: string): Promise<CompanyProfile> {
  const res = await apiClient.get(
    endpoints.company.publicProfileBySlug(slug),
    PublicCompanyProfileResponseSchema,
  );
  return res.response;
}

export async function fetchPublicCompanyJobsBySlug(
  slug: string,
  params?: { pageIndex?: number; perPage?: number; search?: string },
): Promise<PublicJobsBySlugData> {
  const query = new URLSearchParams();
  if (params?.pageIndex) query.set("pageIndex", String(params.pageIndex));
  if (params?.perPage) query.set("perPage", String(params.perPage));
  if (params?.search?.trim()) query.set("search", params.search.trim());
  const qs = query.toString();
  const url = qs
    ? `${endpoints.company.publicJobsBySlug(slug)}?${qs}`
    : endpoints.company.publicJobsBySlug(slug);
  const res = await apiClient.get(url, PublicJobsBySlugResponseSchema);
  return res.response;
}
```

- [ ] **Step 5.4: Add hooks**

Open `src/features/company-jobs/hooks/use-company-profile.ts`. Append two new hooks:

```typescript
import { fetchPublicCompanyProfile, fetchPublicCompanyJobsBySlug } from "../api";
// existing imports...

export function usePublicCompanyProfile(slug?: string) {
  return useQuery({
    queryKey: ["company", "public-profile", slug],
    queryFn: () => fetchPublicCompanyProfile(slug!),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });
}

export function usePublicCompanyJobs(slug?: string) {
  return useQuery({
    queryKey: ["company", "public-jobs", slug],
    queryFn: () => fetchPublicCompanyJobsBySlug(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}
```

Export from `src/features/company-jobs/hooks/index.ts`:

```typescript
export { usePublicCompanyProfile, usePublicCompanyJobs } from "./use-company-profile";
```

- [ ] **Step 5.5: Update CompanyPublicView**

Open `src/features/company-jobs/components/profile/company-public-view.tsx`. Replace the entire file:

```tsx
"use client";

/**
 * Company Public View
 *
 * Fetches the company profile by slug from the public API.
 * Slug is derived from userProfile.muid (matches backend slug for company users).
 */

import type { UserProfile } from "@/features/profile/schemas";
import {
  usePublicCompanyJobs,
  usePublicCompanyProfile,
} from "../../hooks";
import type { CompanyProfile } from "../../types";
import { CompanyCredibilitySection } from "./company-credibility-section";
import { CompanyCultureSection } from "./company-culture-section";
import { CompanyJobsSection } from "./company-jobs-section";
import { CompanyProfileHeader } from "./company-profile-header";
import { CompanyTestimonialsSection } from "./company-testimonials-section";

interface CompanyPublicViewProps {
  userProfile: UserProfile;
}

export function CompanyPublicView({ userProfile }: CompanyPublicViewProps) {
  const slug = userProfile.muid;
  const { data: apiProfile, isLoading: profileLoading } =
    usePublicCompanyProfile(slug);
  const { data: jobsData, isLoading: jobsLoading } =
    usePublicCompanyJobs(slug);

  // Fall back to userProfile identity fields while the API loads
  const companyProfile: CompanyProfile = apiProfile ?? {
    id: userProfile.id,
    name: userProfile.full_name,
    slug: userProfile.muid,
    status: "active",
    logo: userProfile.profile_pic ?? null,
    description: null,
    industry_sector: null,
    website_link: null,
    email: userProfile.email ?? null,
    location: null,
    company_size: null,
    linkedin_url: null,
    created_at: userProfile.joined,
  };

  const publicJobs = jobsData?.jobs ?? [];

  return (
    <div className="space-y-5">
      <CompanyProfileHeader
        profile={companyProfile}
        activeJobsCount={jobsData?.pagination.count ?? publicJobs.length}
        isOwnProfile={false}
        foundedYear={apiProfile?.founded_year ?? null}
        remotePolicy={apiProfile?.remote_policy ?? null}
        isLoading={profileLoading}
      />

      <CompanyJobsSection
        isOwnProfile={false}
        publicJobs={publicJobs}
        isLoading={jobsLoading}
      />

      <CompanyCultureSection
        cultureText={apiProfile?.culture_text ?? null}
        techStack={apiProfile?.tech_stack ?? []}
        perks={apiProfile?.perks ?? []}
        isLoading={profileLoading}
      />

      <CompanyCredibilitySection
        hireCount={apiProfile?.hire_count ?? 0}
        avgKarmaOfHires={apiProfile?.avg_karma_of_hires ?? 0}
        campusEventsCount={apiProfile?.campus_events_count ?? 0}
        memberSince={userProfile.joined}
        isLoading={profileLoading}
      />

      <CompanyTestimonialsSection
        testimonials={apiProfile?.testimonials ?? []}
        isLoading={profileLoading}
      />
    </div>
  );
}
```

**Note:** Read `CompanyProfileHeader`, `CompanyJobsSection`, `CompanyCultureSection`, `CompanyCredibilitySection`, and `CompanyTestimonialsSection` before this step to confirm their prop types. If any component does not accept `isLoading`, add it or omit the prop.

- [ ] **Step 5.6: Update types/jobs.types.ts to export PublicJob**

Open `src/features/company-jobs/types/jobs.types.ts`. Add:

```typescript
export type { PublicJob, PublicJobsBySlugData } from "../schemas/jobs.schema";
```

- [ ] **Step 5.7: Delete the mock file**

```bash
git rm src/features/company-jobs/constants/mock-company-profile.ts
```

Verify no remaining imports:

```bash
grep -r "mock-company-profile" src/
# Expected: no output
```

- [ ] **Step 5.8: Commit**

```bash
git add src/api/endpoints.ts \
        src/features/company-jobs/schemas/jobs.schema.ts \
        src/features/company-jobs/api/jobs.api.ts \
        src/features/company-jobs/hooks/use-company-profile.ts \
        src/features/company-jobs/hooks/index.ts \
        src/features/company-jobs/types/jobs.types.ts \
        src/features/company-jobs/components/profile/company-public-view.tsx
git commit -m "feat(company-public): replace MOCK_COMPANY_EXTENDED and MOCK_PUBLIC_JOBS with real API, delete mock file"
```

---

## Self-Review

### Spec Coverage Check

| Endpoint (from spec) | Task | Status |
|---|---|---|
| `GET /api/v1/dashboard/home/learner/summary/` | Task 1 | ✅ |
| `GET /api/v1/dashboard/home/learner/streak/` | Task 1 | ✅ |
| `GET /api/v1/dashboard/mentor/overview/home-summary/` | Task 2 | ✅ |
| `GET /api/v1/dashboard/company/home-summary/` | Task 3 | ✅ |
| `GET /api/v1/dashboard/company/talent-pool/analytics/` | Task 3 | ✅ (endpoint registered, available for future use) |
| `GET /api/v1/dashboard/campus/home-summary/` | Task 4 | ✅ |
| `GET /api/v1/dashboard/campus/member-funnel/` | Task 4 | ✅ |
| `GET /api/v1/dashboard/campus/circle-health/` | Task 4 | ✅ |
| `GET /api/v1/dashboard/campus/recent-activity/` | Task 4 | ✅ |
| `GET /api/v1/dashboard/company/profile/` (extended) | Task 5 | ✅ (schema extended) |
| `PATCH /api/v1/dashboard/company/profile/` (extended) | Task 5 | ⚠️ Mutation not added — add when the company profile edit form is updated |
| `GET /api/v1/dashboard/company/profile/public/<slug>/` (extended) | Task 5 | ✅ |
| `GET /api/v1/dashboard/company/profile/public/<slug>/jobs/` | Task 5 | ✅ |

**Gap:** The PATCH endpoint for extended company profile fields (founded_year, remote_policy, tech_stack, etc.) is not covered. This belongs in the company profile edit form task, not in the dashboard home integration.

### Known Dependencies / Gotchas

1. **MentorHeroCard prop type** (Task 2, Step 2.7): The current `nextSession` prop accepts `MentorSession` (which has `participants[]`). The home-summary returns `MentorNextSession` (with `mentee_name`/`mentee_muid`). Read `mentor-hero-card.tsx` before editing `mentor-home.tsx` and update the prop type to accept `MentorNextSession | null`.

2. **CompanyPublicView slug** (Task 5, Step 5.5): The component uses `userProfile.muid` as the company slug. If the backend company slug differs from the user's muid, the public profile fetch will 404. If this happens, request `company_slug` be added to the user-profile API response.

3. **`CompanyJobsSection` publicJobs type** (Task 5): Currently typed as `MockPublicJob[]`. After deleting the mock file, update the prop type to `PublicJob[]` from the new schema.

4. **`useCampusLeaderboard` in EnablerHome** (Task 4, Step 4.9): `orgId` is still sourced from `useCampusOverview`, not from the campus home-summary. Keep both calls — the summary for funnel/health/activity data, and campusOverview for leaderboard's orgId and stat cards.
