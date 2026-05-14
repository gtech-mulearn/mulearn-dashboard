# Dashboard Home API Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all mock data on the dashboard home page with live API calls across MuLearner, Mentor, Campus, and Company home views.

**Architecture:** Feature-by-feature hooks pattern — each API call gets its own `useQuery` hook; data flows from parent component (via hooks) down to children as typed props. Zod schemas validate every response at the boundary. No component fetches data directly.

**Tech Stack:** Next.js 14, TanStack Query v5, Zod, TypeScript, existing `apiClient` / `publicApiClient`

---

## File Map

| Action | File |
|--------|------|
| Modify | `src/api/endpoints.ts` |
| Modify | `src/features/home/schemas/home.schema.ts` |
| Modify | `src/features/home/api/home.api.ts` |
| Modify | `src/features/home/hooks/query-keys.ts` |
| Modify | `src/features/home/hooks/use-home.ts` |
| **Create** | `src/features/home/components/mentor/mentor-setup-prompt.tsx` |
| Modify | `src/features/home/components/mentor-home.tsx` |
| Modify | `src/features/home/components/mentor/mentor-stat-cards.tsx` |
| Modify | `src/features/home/components/mentor/mentor-hero-card.tsx` |
| Modify | `src/features/home/components/mentor/upcoming-sessions-card.tsx` |
| Modify | `src/features/home/components/mentor/session-requests-card.tsx` |
| Modify | `src/features/home/components/mentor/mentee-progress-card.tsx` |
| Modify | `src/features/home/components/mentor/availability-card.tsx` |
| Modify | `src/features/home/components/quick-action-row.tsx` |
| Modify | `src/features/home/components/mulearner-home.tsx` |
| Modify | `src/features/home/components/campus/campus-stat-cards.tsx` |
| Modify | `src/features/home/components/company-home.tsx` |
| Modify | `src/features/home/components/company/company-hero-card.tsx` |
| Modify | `src/features/home/components/company/company-stat-cards.tsx` |
| Modify | `src/features/home/components/company/talent-pool-card.tsx` |
| Modify | `src/features/home/components/company/company-verified-banner.tsx` |
| **Delete** | `src/features/home/constants/mock-mentor.ts` |
| **Delete** | `src/features/home/constants/mock-company.ts` |
| **Delete** | `src/features/home/constants/mock-stats.ts` |
| Modify | `src/features/home/constants/mock-campus.ts` (remove one export) |

---

## Task 1: Add mentor + publicJobs endpoints

**Files:**
- Modify: `src/api/endpoints.ts`

- [ ] **Step 1: Add endpoints**

  In `src/api/endpoints.ts`, after the `company` block and before the `user` block, add:

  ```ts
  // ============================================
  // Mentor Dashboard Endpoints
  // ============================================
  mentor: {
    /** GET - Mentor overview (stats, profile, persona, mentees summary) */
    overview: "/api/v1/dashboard/mentor/overview/",
    /** GET - Mentor sessions list (?status=SCHEDULED|PENDING|COMPLETED) */
    sessions: "/api/v1/dashboard/mentor/sessions/",
    /** GET - Mentor's active mentees list */
    mentees: "/api/v1/dashboard/mentor/mentees/",
    /** POST - Switch mentor persona (active IG) */
    personaSwitch: "/api/v1/dashboard/mentor/persona/switch/",
  },

  // ============================================
  // Public Endpoints
  // ============================================
  public: {
    /** GET - Public job listings (AllowAny) — use pagination.total for count */
    jobs: "/api/v1/public/jobs/",
  },
  ```

  Also update the stale `dashboard.events` entry to remove the Google Sheets URL (replace the entire events line):

  ```ts
  /** GET - Featured events (replaced Google Sheets) — use events.featured instead */
  events: "/api/v1/dashboard/events/featured/",
  ```

- [ ] **Step 2: Verify TypeScript compiles**

  ```bash
  cd mulearn-dashboard && npx tsc --noEmit 2>&1 | head -30
  ```

  Expected: no errors about `endpoints`.

- [ ] **Step 3: Commit**

  ```bash
  git add src/api/endpoints.ts
  git commit -m "feat(home): add mentor and public endpoints to endpoints.ts"
  ```

---

## Task 2: Add Zod schemas for mentor API responses

**Files:**
- Modify: `src/features/home/schemas/home.schema.ts`

- [ ] **Step 1: Append mentor schemas**

  At the bottom of `src/features/home/schemas/home.schema.ts`, add:

  ```ts
  // ============================================
  // Pagination (shared)
  // ============================================

  export const PaginationSchema = z.object({
    totalPages: z.number(),
    currentPage: z.number(),
    totalCount: z.number(),
    nextPage: z.number().nullable(),
    previousPage: z.number().nullable(),
  });

  // ============================================
  // Mentor Overview (/mentor/overview/)
  // ============================================

  export const MentorOverviewSchema = z.object({
    user: z.object({
      full_name: z.string(),
      muid: z.string(),
      profile_pic: z.string().nullable(),
    }),
    mentor_profile: z.object({
      about: z.string().nullable(),
      expertise: z.array(z.string()),
      reason: z.string().nullable(),
      volunteer_hours: z.number(),
      mentor_tier: z.string().nullable(),
      is_verified: z.boolean(),
    }),
    active_persona: z
      .object({
        active_persona: z.string().nullable(),
        active_role_link_id: z.string().nullable(),
        active_ig_id: z.string().nullable(),
        ig_name: z.string().nullable(),
        is_verified: z.boolean(),
      })
      .nullable(),
    authorized_igs: z.array(
      z.object({
        role_link_id: z.string(),
        ig_id: z.string(),
        ig_name: z.string(),
        is_primary: z.boolean(),
        is_verified: z.boolean(),
      }),
    ),
    stats: z.object({
      total_mentees: z.number(),
      sessions_conducted: z.number(),
      pending_task_approvals: z.number(),
      volunteer_hours: z.number(),
    }),
  });
  export type MentorOverview = z.infer<typeof MentorOverviewSchema>;

  export const MentorOverviewResponseSchema = ApiResponseSchema(MentorOverviewSchema);

  // ============================================
  // Mentor Sessions (/mentor/sessions/)
  // ============================================

  export const MentorSessionParticipantSchema = z.object({
    user_id: z.string(),
    full_name: z.string(),
    participant_role: z.string(),
    attendance_status: z.string().nullable(),
  });

  export const MentorSessionSchema = z.object({
    id: z.string(),
    ig_name: z.string().nullable(),
    title: z.string(),
    mode: z.string(),
    starts_at: z.string(),
    ends_at: z.string(),
    status: z.string(),
    meeting_link: z.string().nullable(),
    participants: z.array(MentorSessionParticipantSchema),
  });
  export type MentorSession = z.infer<typeof MentorSessionSchema>;

  export const MentorSessionsResponseSchema = ApiResponseSchema(
    z.object({
      data: z.array(MentorSessionSchema),
      pagination: PaginationSchema,
    }),
  );

  // ============================================
  // Mentor Mentees (/mentor/mentees/)
  // ============================================

  export const MentorMenteeSchema = z.object({
    user_id: z.string(),
    full_name: z.string(),
    muid: z.string(),
    profile_pic: z.string().nullable(),
    karma: z.number(),
    level: z.string().nullable(),
    ig_karma: z.number(),
    ig_level: z.string().nullable(),
    session_count: z.number(),
    last_session_at: z.string().nullable(),
  });
  export type MentorMentee = z.infer<typeof MentorMenteeSchema>;

  export const MentorMenteesResponseSchema = ApiResponseSchema(
    z.object({
      active_ig_id: z.string().nullable(),
      data: z.array(MentorMenteeSchema),
      pagination: PaginationSchema,
    }),
  );

  // ============================================
  // Public Jobs Count (/public/jobs/)
  // ============================================

  export const PublicJobsResponseSchema = ApiResponseSchema(
    z.object({
      data: z.array(z.unknown()),
      pagination: PaginationSchema,
    }),
  );
  ```

- [ ] **Step 2: Verify TypeScript compiles**

  ```bash
  npx tsc --noEmit 2>&1 | head -30
  ```

  Expected: no new errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/features/home/schemas/home.schema.ts
  git commit -m "feat(home): add Zod schemas for mentor overview, sessions, mentees"
  ```

---

## Task 3: Add API functions

**Files:**
- Modify: `src/features/home/api/home.api.ts`

- [ ] **Step 1: Add imports and new functions**

  Replace the entire file content with:

  ```ts
  import { apiClient } from "@/api/client";
  import { endpoints } from "@/api/endpoints";
  import {
    CalendarEventsResponseSchema,
    InterestGroupsListResponseSchema,
    KarmaFeedResponseSchema,
    MentorMenteesResponseSchema,
    MentorOverviewResponseSchema,
    MentorSessionsResponseSchema,
    PublicJobsResponseSchema,
  } from "../schemas";

  // ============================================
  // Interest Groups
  // ============================================

  export async function getInterestGroupsList() {
    const response = await apiClient.get(
      endpoints.dashboard.interestGroups,
      InterestGroupsListResponseSchema,
    );
    return response.response.interestGroup;
  }

  // ============================================
  // Karma Feed
  // ============================================

  export async function getKarmaFeed() {
    const response = await apiClient.get(
      endpoints.dashboard.karmaFeed,
      KarmaFeedResponseSchema,
    );
    return response.response;
  }

  // ============================================
  // Calendar Events
  // ============================================

  export async function getCalendarEvents() {
    const response = await apiClient.get(
      endpoints.dashboard.calendarEvents,
      CalendarEventsResponseSchema,
    );
    return response.response.events;
  }

  // ============================================
  // Mentor Overview
  // ============================================

  export async function getMentorOverview() {
    const response = await apiClient.get(
      endpoints.mentor.overview,
      MentorOverviewResponseSchema,
    );
    return response.response;
  }

  // ============================================
  // Mentor Sessions
  // ============================================

  export async function getMentorSessions(status = "SCHEDULED") {
    const url = `${endpoints.mentor.sessions}?status=${status}`;
    const response = await apiClient.get(url, MentorSessionsResponseSchema);
    return response.response.data;
  }

  // ============================================
  // Mentor Mentees
  // ============================================

  export async function getMentorMentees() {
    const response = await apiClient.get(
      endpoints.mentor.mentees,
      MentorMenteesResponseSchema,
    );
    return response.response.data;
  }

  // ============================================
  // Public Jobs Count (for QuickActionRow)
  // ============================================

  export async function getPublicJobsCount(): Promise<number> {
    const response = await apiClient.get(
      endpoints.public.jobs,
      PublicJobsResponseSchema,
    );
    return response.response.pagination.totalCount;
  }
  ```

  Note: `getEvents()` (Google Sheets) is removed — `EventsSliderCard` already uses `useFeaturedEvents` from the events feature and does not need this.

- [ ] **Step 2: Verify TypeScript**

  ```bash
  npx tsc --noEmit 2>&1 | head -30
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add src/features/home/api/home.api.ts
  git commit -m "feat(home): add mentor and publicJobs API functions; drop dead getEvents()"
  ```

---

## Task 4: Add query keys and hooks

**Files:**
- Modify: `src/features/home/hooks/query-keys.ts`
- Modify: `src/features/home/hooks/use-home.ts`

- [ ] **Step 1: Extend query keys**

  Replace `src/features/home/hooks/query-keys.ts` with:

  ```ts
  export const homeKeys = {
    all: ["home"] as const,

    interestGroups: () => [...homeKeys.all, "interest-groups"] as const,
    karmaFeed: () => [...homeKeys.all, "karma-feed"] as const,
    events: () => [...homeKeys.all, "events"] as const,
    calendarEvents: () => [...homeKeys.all, "calendar-events"] as const,
    topPerformers: () => [...homeKeys.all, "top-performers"] as const,

    mentorOverview: () => [...homeKeys.all, "mentor", "overview"] as const,
    mentorSessions: (status?: string) =>
      [...homeKeys.all, "mentor", "sessions", status ?? "SCHEDULED"] as const,
    mentorMentees: () => [...homeKeys.all, "mentor", "mentees"] as const,
    publicJobsCount: () => [...homeKeys.all, "public-jobs-count"] as const,
  };
  ```

- [ ] **Step 2: Add new hooks**

  Replace `src/features/home/hooks/use-home.ts` with:

  ```ts
  import { useQuery } from "@tanstack/react-query";
  import { fetchStudentLeaderboard } from "@/features/leaderboard/api/leaderboard.api";
  import {
    getCalendarEvents,
    getInterestGroupsList,
    getKarmaFeed,
    getMentorMentees,
    getMentorOverview,
    getMentorSessions,
    getPublicJobsCount,
  } from "../api";
  import { homeKeys } from "./query-keys";

  const HOME_STALE_TIME = 5 * 60 * 1000;

  export function useInterestGroupsList() {
    return useQuery({
      queryKey: homeKeys.interestGroups(),
      queryFn: getInterestGroupsList,
      staleTime: 10 * 60 * 1000,
    });
  }

  export function useKarmaFeed() {
    return useQuery({
      queryKey: homeKeys.karmaFeed(),
      queryFn: getKarmaFeed,
      staleTime: HOME_STALE_TIME,
    });
  }

  export function useCalendarEvents() {
    return useQuery({
      queryKey: homeKeys.calendarEvents(),
      queryFn: getCalendarEvents,
      staleTime: HOME_STALE_TIME,
    });
  }

  export function useTopPerformers() {
    return useQuery({
      queryKey: homeKeys.topPerformers(),
      queryFn: () => fetchStudentLeaderboard(false),
      staleTime: HOME_STALE_TIME,
      select: (data) => data.slice(0, 5),
    });
  }

  export function useMentorOverview() {
    return useQuery({
      queryKey: homeKeys.mentorOverview(),
      queryFn: getMentorOverview,
      staleTime: HOME_STALE_TIME,
      retry: (failureCount, error: unknown) => {
        // Do not retry on 403 — mentor persona not configured
        if (
          error instanceof Error &&
          "status" in error &&
          (error as { status: number }).status === 403
        ) {
          return false;
        }
        return failureCount < 2;
      },
    });
  }

  export function useMentorSessions(status = "SCHEDULED") {
    return useQuery({
      queryKey: homeKeys.mentorSessions(status),
      queryFn: () => getMentorSessions(status),
      staleTime: 2 * 60 * 1000,
    });
  }

  export function useMentorMentees() {
    return useQuery({
      queryKey: homeKeys.mentorMentees(),
      queryFn: getMentorMentees,
      staleTime: HOME_STALE_TIME,
    });
  }

  export function usePublicJobsCount() {
    return useQuery({
      queryKey: homeKeys.publicJobsCount(),
      queryFn: getPublicJobsCount,
      staleTime: 15 * 60 * 1000,
    });
  }
  ```

- [ ] **Step 3: Verify TypeScript**

  ```bash
  npx tsc --noEmit 2>&1 | head -30
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add src/features/home/hooks/query-keys.ts src/features/home/hooks/use-home.ts
  git commit -m "feat(home): add mentor hooks and publicJobsCount hook"
  ```

---

## Task 5: Create MentorSetupPrompt component

**Files:**
- Create: `src/features/home/components/mentor/mentor-setup-prompt.tsx`

- [ ] **Step 1: Create the component**

  ```tsx
  import { UserCheck } from "lucide-react";
  import Link from "next/link";

  export function MentorSetupPrompt() {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border bg-card p-12 text-center shadow-sm">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <UserCheck className="size-7 text-primary" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-foreground">
          Your mentor dashboard isn&apos;t active yet
        </h2>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          Set up your mentor profile and select your active interest group to
          unlock your full mentor dashboard.
        </p>
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Set up mentor profile
        </Link>
      </div>
    );
  }
  ```

- [ ] **Step 2: Verify TypeScript**

  ```bash
  npx tsc --noEmit 2>&1 | head -20
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add src/features/home/components/mentor/mentor-setup-prompt.tsx
  git commit -m "feat(home): add MentorSetupPrompt component for 403 persona-not-configured state"
  ```

---

## Task 6: Wire MentorHome — fetch data, guard 403, pass props

**Files:**
- Modify: `src/features/home/components/mentor-home.tsx`

- [ ] **Step 1: Rewrite MentorHome**

  Replace `src/features/home/components/mentor-home.tsx` with:

  ```tsx
  "use client";

  import { useMentorMentees, useMentorOverview, useMentorSessions } from "../hooks";
  import { MentorSetupPrompt } from "./mentor/mentor-setup-prompt";
  import { AvailabilityCard } from "./mentor/availability-card";
  import { MenteeProgressCard } from "./mentor/mentee-progress-card";
  import { MentorHeroCard } from "./mentor/mentor-hero-card";
  import { MentorStatCards } from "./mentor/mentor-stat-cards";
  import { SessionRequestsCard } from "./mentor/session-requests-card";
  import { UpcomingSessionsCard } from "./mentor/upcoming-sessions-card";

  export function MentorHome() {
    const { data: overview, isLoading: overviewLoading, error: overviewError } =
      useMentorOverview();
    const { data: scheduledSessions = [], isLoading: sessionsLoading } =
      useMentorSessions("SCHEDULED");
    const { data: pendingSessions = [], isLoading: pendingLoading } =
      useMentorSessions("PENDING");
    const { data: mentees = [], isLoading: menteesLoading } = useMentorMentees();

    // 403 = mentor persona not configured
    const is403 =
      overviewError instanceof Error &&
      "status" in overviewError &&
      (overviewError as { status: number }).status === 403;

    if (is403) {
      return <MentorSetupPrompt />;
    }

    return (
      <div className="space-y-5">
        <MentorHeroCard
          nextSession={scheduledSessions[0] ?? null}
          isVerified={overview?.mentor_profile.is_verified ?? false}
        />
        <MentorStatCards
          totalMentees={overview?.stats.total_mentees ?? 0}
          hoursMentored={overview?.stats.volunteer_hours ?? 0}
          sessionsConducted={overview?.stats.sessions_conducted ?? 0}
          pendingApprovals={overview?.stats.pending_task_approvals ?? 0}
          isLoading={overviewLoading}
        />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <UpcomingSessionsCard
            sessions={scheduledSessions}
            isLoading={sessionsLoading}
          />
          <SessionRequestsCard
            sessions={pendingSessions}
            isLoading={pendingLoading}
          />
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr]">
          <MenteeProgressCard mentees={mentees} isLoading={menteesLoading} />
          <AvailabilityCard
            expertise={overview?.mentor_profile.expertise ?? []}
            isLoading={overviewLoading}
          />
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 2: TypeScript check**

  ```bash
  npx tsc --noEmit 2>&1 | head -40
  ```

  You will see errors about props not matching existing component signatures — that's expected. They get fixed in Tasks 7–12.

- [ ] **Step 3: Commit**

  ```bash
  git add src/features/home/components/mentor-home.tsx
  git commit -m "feat(home): wire MentorHome with real data hooks and 403 guard"
  ```

---

## Task 7: Refactor MentorStatCards

**Files:**
- Modify: `src/features/home/components/mentor/mentor-stat-cards.tsx`

- [ ] **Step 1: Rewrite**

  ```tsx
  import { CheckCircle2, Clock, ListChecks, Users } from "lucide-react";
  import { Skeleton } from "@/components/ui/skeleton";

  type MentorStatCardsProps = {
    totalMentees: number;
    hoursMentored: number;
    sessionsConducted: number;
    pendingApprovals: number;
    isLoading: boolean;
  };

  const CARDS = [
    {
      key: "totalMentees" as const,
      label: "ACTIVE MENTEES",
      icon: Users,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      subLabel: "mentees total",
    },
    {
      key: "hoursMentored" as const,
      label: "HOURS MENTORED",
      icon: Clock,
      iconColor: "text-success",
      iconBg: "bg-success/10",
      subLabel: "volunteer hours",
    },
    {
      key: "sessionsConducted" as const,
      label: "SESSIONS DONE",
      icon: CheckCircle2,
      iconColor: "text-brand-purple",
      iconBg: "bg-brand-purple/10",
      subLabel: "all time",
    },
    {
      key: "pendingApprovals" as const,
      label: "PENDING APPROVALS",
      icon: ListChecks,
      iconColor: "text-warning",
      iconBg: "bg-warning/10",
      subLabel: "tasks awaiting review",
    },
  ] as const;

  export function MentorStatCards({
    totalMentees,
    hoursMentored,
    sessionsConducted,
    pendingApprovals,
    isLoading,
  }: MentorStatCardsProps) {
    const values: Record<(typeof CARDS)[number]["key"], number> = {
      totalMentees,
      hoursMentored,
      sessionsConducted,
      pendingApprovals,
    };

    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className="rounded-2xl border bg-card p-5 shadow-sm"
            >
              <div
                className={`mb-3 flex size-10 items-center justify-center rounded-xl ${card.iconBg}`}
              >
                <Icon className={`size-5 ${card.iconColor}`} />
              </div>
              {isLoading ? (
                <>
                  <Skeleton className="mb-1.5 h-8 w-20 rounded-md" />
                  <Skeleton className="h-3.5 w-28 rounded-md" />
                </>
              ) : (
                <>
                  <p className="text-3xl font-bold tracking-tight text-foreground">
                    {values[card.key]}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {card.label}
                  </p>
                  <p className="mt-2.5 text-xs text-muted-foreground">
                    {card.subLabel}
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  }
  ```

- [ ] **Step 2: TypeScript check**

  ```bash
  npx tsc --noEmit 2>&1 | grep mentor-stat-cards
  ```

  Expected: no errors for this file.

- [ ] **Step 3: Commit**

  ```bash
  git add src/features/home/components/mentor/mentor-stat-cards.tsx
  git commit -m "feat(home): wire MentorStatCards to real API props"
  ```

---

## Task 8: Refactor MentorHeroCard

**Files:**
- Modify: `src/features/home/components/mentor/mentor-hero-card.tsx`

- [ ] **Step 1: Rewrite**

  ```tsx
  import { Calendar, CheckCircle2, Shield } from "lucide-react";
  import { useUserInfo } from "@/features/auth/hooks/use-session";
  import type { MentorSession } from "../../schemas/home.schema";

  type MentorHeroCardProps = {
    nextSession: MentorSession | null;
    isVerified: boolean;
  };

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }

  function formatSessionLabel(session: MentorSession): string {
    const name =
      session.participants.find((p) => p.participant_role !== "MENTOR")
        ?.full_name ?? "a mentee";
    const date = new Intl.DateTimeFormat("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(session.starts_at));
    return `${name} — ${date}`;
  }

  export function MentorHeroCard({ nextSession, isVerified }: MentorHeroCardProps) {
    const { data: userInfo } = useUserInfo();
    const firstName = userInfo?.full_name?.split(" ")[0] ?? "Mentor";

    return (
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            {isVerified ? (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                <CheckCircle2 className="size-3.5" />
                Verified Mentor
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-warning">
                <Shield className="size-3.5" />
                Mentor
              </div>
            )}
            <h2 className="text-2xl font-bold text-foreground">
              {getGreeting()}, <span className="text-primary">{firstName}.</span>
            </h2>
            {nextSession ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="size-4 text-muted-foreground" />
                Next session with{" "}
                <span className="font-medium text-foreground">
                  {formatSessionLabel(nextSession)}
                </span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No upcoming sessions scheduled.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 2: TypeScript check**

  ```bash
  npx tsc --noEmit 2>&1 | grep mentor-hero-card
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add src/features/home/components/mentor/mentor-hero-card.tsx
  git commit -m "feat(home): wire MentorHeroCard to real session data"
  ```

---

## Task 9: Refactor UpcomingSessionsCard

**Files:**
- Modify: `src/features/home/components/mentor/upcoming-sessions-card.tsx`

- [ ] **Step 1: Rewrite**

  ```tsx
  import { CalendarClock } from "lucide-react";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { Skeleton } from "@/components/ui/skeleton";
  import { cn } from "@/lib/utils";
  import type { MentorSession } from "../../schemas/home.schema";

  type Props = {
    sessions: MentorSession[];
    isLoading: boolean;
  };

  function avatarColor(userId: string): string {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${Math.abs(hash) % 360}, 60%, 50%)`;
  }

  function initials(name: string): string {
    return name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }

  function formatDateTime(iso: string): { date: string; time: string } {
    const d = new Date(iso);
    return {
      date: new Intl.DateTimeFormat("en-IN", { month: "short", day: "numeric" }).format(d),
      time: new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(d),
    };
  }

  const STATUS_STYLES: Record<string, string> = {
    SCHEDULED: "bg-success/15 text-success",
    PENDING: "bg-warning/15 text-warning",
    CANCELLED: "bg-destructive/15 text-destructive",
    COMPLETED: "bg-muted text-muted-foreground",
  };

  export function UpcomingSessionsCard({ sessions, isLoading }: Props) {
    return (
      <Card className="rounded-2xl border bg-card shadow-sm">
        <CardHeader className="flex-row items-center gap-2.5 px-5 py-4">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <CalendarClock className="size-4 text-primary" />
          </div>
          <CardTitle className="text-base font-bold text-foreground">
            Upcoming Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0">
          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No upcoming sessions.
            </p>
          ) : (
            <div className="space-y-0">
              {sessions.map((session) => {
                const mentee = session.participants.find(
                  (p) => p.participant_role !== "MENTOR",
                );
                const { date, time } = formatDateTime(session.starts_at);
                const color = avatarColor(mentee?.user_id ?? session.id);
                return (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 border-b border-border py-3 last:border-b-0"
                  >
                    <div
                      className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-foreground"
                      style={{ backgroundColor: color }}
                    >
                      {mentee ? initials(mentee.full_name) : "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {mentee?.full_name ?? "Unknown"}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {session.title}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-medium text-foreground">{date}</p>
                      <p className="text-[11px] text-muted-foreground">{time}</p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                        STATUS_STYLES[session.status] ?? "bg-muted text-muted-foreground",
                      )}
                    >
                      {session.status.charAt(0) + session.status.slice(1).toLowerCase()}
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

- [ ] **Step 2: TypeScript check**

  ```bash
  npx tsc --noEmit 2>&1 | grep upcoming-sessions
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add src/features/home/components/mentor/upcoming-sessions-card.tsx
  git commit -m "feat(home): wire UpcomingSessionsCard to real session data"
  ```

---

## Task 10: Refactor SessionRequestsCard

**Files:**
- Modify: `src/features/home/components/mentor/session-requests-card.tsx`

- [ ] **Step 1: Rewrite**

  ```tsx
  "use client";

  import { Check, Inbox, X } from "lucide-react";
  import { useState } from "react";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { Skeleton } from "@/components/ui/skeleton";
  import type { MentorSession } from "../../schemas/home.schema";

  type Props = {
    sessions: MentorSession[];
    isLoading: boolean;
  };

  function avatarColor(userId: string): string {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${Math.abs(hash) % 360}, 60%, 50%)`;
  }

  function initials(name: string): string {
    return name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }

  function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3_600_000);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  export function SessionRequestsCard({ sessions, isLoading }: Props) {
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());
    const visible = sessions.filter((s) => !dismissed.has(s.id));

    return (
      <Card className="rounded-2xl border bg-card shadow-sm">
        <CardHeader className="flex-row items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-brand-purple/10">
              <Inbox className="size-4 text-brand-purple" />
            </div>
            <CardTitle className="text-base font-bold text-foreground">
              Session Requests
            </CardTitle>
          </div>
          {visible.length > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {visible.length}
            </span>
          )}
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0">
          {isLoading ? (
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No pending requests.
            </p>
          ) : (
            <div className="space-y-0">
              {visible.map((req) => {
                const mentee = req.participants.find(
                  (p) => p.participant_role !== "MENTOR",
                );
                const color = avatarColor(mentee?.user_id ?? req.id);
                return (
                  <div
                    key={req.id}
                    className="flex items-center gap-3 border-b border-border py-3 last:border-b-0"
                  >
                    <div
                      className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-foreground"
                      style={{ backgroundColor: color }}
                    >
                      {mentee ? initials(mentee.full_name) : "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {mentee?.full_name ?? "Unknown"}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {req.title}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {timeAgo(req.starts_at)}
                    </span>
                    <div className="flex shrink-0 gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setDismissed((prev) => new Set([...prev, req.id]))
                        }
                        className="flex size-7 items-center justify-center rounded-full bg-success/15 text-success transition-colors hover:bg-success/25"
                        aria-label="Accept"
                      >
                        <Check className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDismissed((prev) => new Set([...prev, req.id]))
                        }
                        className="flex size-7 items-center justify-center rounded-full bg-destructive/15 text-destructive transition-colors hover:bg-destructive/25"
                        aria-label="Decline"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
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

- [ ] **Step 2: TypeScript check**

  ```bash
  npx tsc --noEmit 2>&1 | grep session-requests
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add src/features/home/components/mentor/session-requests-card.tsx
  git commit -m "feat(home): wire SessionRequestsCard to real pending sessions"
  ```

---

## Task 11: Refactor MenteeProgressCard

**Files:**
- Modify: `src/features/home/components/mentor/mentee-progress-card.tsx`

- [ ] **Step 1: Rewrite**

  ```tsx
  import { TrendingUp } from "lucide-react";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { Skeleton } from "@/components/ui/skeleton";
  import type { MentorMentee } from "../../schemas/home.schema";

  type Props = {
    mentees: MentorMentee[];
    isLoading: boolean;
  };

  function avatarColor(userId: string): string {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${Math.abs(hash) % 360}, 60%, 50%)`;
  }

  function initials(name: string): string {
    return name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }

  const LEVEL_KARMA_TARGETS: Record<string, number> = {
    L1: 2000,
    L2: 5000,
    L3: 8000,
    L4: 12000,
    L5: 20000,
  };

  export function MenteeProgressCard({ mentees, isLoading }: Props) {
    return (
      <Card className="rounded-2xl border bg-card shadow-sm">
        <CardHeader className="flex-row items-center gap-2.5 px-5 py-4">
          <div className="flex size-9 items-center justify-center rounded-xl bg-success/10">
            <TrendingUp className="size-4 text-success" />
          </div>
          <CardTitle className="text-base font-bold text-foreground">
            Mentee Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0">
          {isLoading ? (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : mentees.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No mentees yet.
            </p>
          ) : (
            <div className="space-y-4">
              {mentees.slice(0, 5).map((mentee) => {
                const level = mentee.ig_level ?? mentee.level ?? "L1";
                const target = LEVEL_KARMA_TARGETS[level] ?? 2000;
                const earned = mentee.ig_karma;
                const pct = Math.min(Math.round((earned / target) * 100), 100);
                const color = avatarColor(mentee.user_id);
                return (
                  <div key={mentee.user_id} className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground"
                        style={{ backgroundColor: color }}
                      >
                        {initials(mentee.full_name)}
                      </div>
                      <span className="flex-1 text-sm font-medium text-foreground">
                        {mentee.full_name}
                      </span>
                      <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        {level}
                      </span>
                      <span className="w-8 text-right text-xs font-semibold text-muted-foreground">
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {earned.toLocaleString()} / {target.toLocaleString()} karma
                    </p>
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

- [ ] **Step 2: TypeScript check**

  ```bash
  npx tsc --noEmit 2>&1 | grep mentee-progress
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add src/features/home/components/mentor/mentee-progress-card.tsx
  git commit -m "feat(home): wire MenteeProgressCard to real mentees data"
  ```

---

## Task 12: Refactor AvailabilityCard (expertise from real API)

**Files:**
- Modify: `src/features/home/components/mentor/availability-card.tsx`

- [ ] **Step 1: Rewrite**

  ```tsx
  "use client";

  import { Sparkles } from "lucide-react";
  import { useState } from "react";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { Skeleton } from "@/components/ui/skeleton";
  import { cn } from "@/lib/utils";

  type Props = {
    expertise: string[];
    isLoading: boolean;
  };

  export function AvailabilityCard({ expertise, isLoading }: Props) {
    const [available, setAvailable] = useState(true);
    const [selected, setSelected] = useState<Set<string>>(new Set(expertise));

    function toggleTag(tag: string) {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(tag)) next.delete(tag);
        else next.add(tag);
        return next;
      });
    }

    return (
      <Card className="rounded-2xl border bg-card shadow-sm">
        <CardHeader className="flex-row items-center gap-2.5 px-5 py-4">
          <div className="flex size-9 items-center justify-center rounded-xl bg-warning/10">
            <Sparkles className="size-4 text-warning" />
          </div>
          <CardTitle className="text-base font-bold text-foreground">
            Availability &amp; Expertise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 px-5 pb-5 pt-0">
          <div className="flex items-center justify-between rounded-xl border bg-muted/40 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Available for mentoring
              </p>
              <p className="text-[11px] text-muted-foreground">
                {available ? "Accepting new mentees" : "Not accepting requests"}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={available}
              onClick={() => setAvailable((v) => !v)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                available ? "bg-success" : "bg-muted-foreground/30",
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block size-5 rounded-full bg-card shadow-lg transition-transform",
                  available ? "translate-x-5" : "translate-x-0",
                )}
              />
            </button>
          </div>

          <div>
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Expertise
            </p>
            {isLoading ? (
              <div className="flex flex-wrap gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-6 w-20 rounded-full" />
                ))}
              </div>
            ) : expertise.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No expertise tags set.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {expertise.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      selected.has(tag)
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground hover:bg-muted/80",
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
  ```

- [ ] **Step 2: TypeScript check**

  ```bash
  npx tsc --noEmit 2>&1 | head -20
  ```

  Expected: no errors.

- [ ] **Step 3: Delete mock-mentor.ts**

  ```bash
  rm src/features/home/constants/mock-mentor.ts
  npx tsc --noEmit 2>&1 | head -20
  ```

  Expected: no errors about mock-mentor.

- [ ] **Step 4: Commit**

  ```bash
  git add src/features/home/components/mentor/availability-card.tsx
  git rm src/features/home/constants/mock-mentor.ts
  git commit -m "feat(home): wire AvailabilityCard to real expertise; delete mock-mentor.ts"
  ```

---

## Task 13: Wire QuickActionRow — real circle count, rank, job count

**Files:**
- Modify: `src/features/home/components/quick-action-row.tsx`
- Modify: `src/features/home/components/mulearner-home.tsx`

- [ ] **Step 1: Rewrite QuickActionRow to accept props**

  ```tsx
  import { Briefcase, Layers, Search, Trophy, Users, Zap } from "lucide-react";
  import Link from "next/link";
  import { Card } from "@/components/ui/card";

  type QuickActionRowProps = {
    circleCount: number;
    rank: number | null;
    jobCount: number;
  };

  export function QuickActionRow({ circleCount, rank, jobCount }: QuickActionRowProps) {
    const actions = [
      {
        id: "mujourney",
        label: "µJourney",
        sub: "Track your progress",
        href: "/dashboard/mujourney",
        icon: Zap,
        iconBg: "bg-primary/10",
        iconColor: "text-primary",
      },
      {
        id: "claim-karma",
        label: "Claim Karma",
        sub: "Submit your tasks",
        href: "/dashboard/mujourney",
        icon: Layers,
        iconBg: "bg-success/10",
        iconColor: "text-success",
      },
      {
        id: "my-circles",
        label: "My Circles",
        sub: `${circleCount} active circle${circleCount !== 1 ? "s" : ""}`,
        href: "/dashboard/learning-circle",
        icon: Users,
        iconBg: "bg-brand-purple/10",
        iconColor: "text-brand-purple",
      },
      {
        id: "leaderboard",
        label: "Leaderboard",
        sub: rank != null ? `You're ranked #${rank}` : "View rankings",
        href: "/dashboard/leaderboard",
        icon: Trophy,
        iconBg: "bg-warning/10",
        iconColor: "text-warning",
      },
      {
        id: "jobs-board",
        label: "Jobs Board",
        sub: `${jobCount} new openings`,
        href: "/dashboard/company/jobs",
        icon: Briefcase,
        iconBg: "bg-destructive/10",
        iconColor: "text-destructive",
      },
      {
        id: "find-mentors",
        label: "Find Mentors",
        sub: "Connect with experts",
        href: "/dashboard/search/mentors",
        icon: Search,
        iconBg: "bg-brand-blue/10",
        iconColor: "text-brand-blue",
      },
    ] as const;

    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {actions.map(({ id, label, sub, href, icon: Icon, iconBg, iconColor }) => (
          <Link key={id} href={href}>
            <Card className="flex cursor-pointer items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
              >
                <Icon className={`size-4 ${iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {label}
                </p>
                <p className="truncate text-xs text-muted-foreground">{sub}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    );
  }
  ```

- [ ] **Step 2: Wire MuLearnerHome to pass counts**

  Replace `src/features/home/components/mulearner-home.tsx` with:

  ```tsx
  "use client";

  import { useUserInfo, useUserProfile } from "@/features/auth/hooks/use-session";
  import { useCircles } from "@/features/learning-circle/hooks/use-learning-circle";
  import {
    useCalendarEvents,
    useInterestGroupsList,
    usePublicJobsCount,
  } from "../hooks";
  import { EventCalendarCard } from "./event-calendar-card";
  import { HeroCard } from "./hero-card";
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
    const { data: circles = [] } = useCircles();
    const { data: jobCount = 0 } = usePublicJobsCount();

    const displayName = userInfo?.full_name?.split(" ")[0] ?? "Learner";
    const groups = interestGroups ?? [];
    const rank: number | null = userProfile?.rank ?? null;

    return (
      <div className="space-y-5">
        <QuickActionRow
          circleCount={circles.length}
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
          <div className="hidden self-start lg:sticky lg:top-5 lg:block">
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

  > Note: `useCircles` — check the actual export name in `src/features/learning-circle/hooks/use-learning-circle.ts`. Replace `useCircles` with the actual hook name if different.

- [ ] **Step 3: Verify actual hook name**

  ```bash
  grep -n "^export function" src/features/learning-circle/hooks/use-learning-circle.ts | head -10
  ```

  If the hook is named differently (e.g., `useLearningCircles`), update the import in step 2.

- [ ] **Step 4: TypeScript check**

  ```bash
  npx tsc --noEmit 2>&1 | head -30
  ```

- [ ] **Step 5: Delete mock-stats.ts**

  ```bash
  rm src/features/home/constants/mock-stats.ts
  npx tsc --noEmit 2>&1 | head -20
  ```

- [ ] **Step 6: Commit**

  ```bash
  git add src/features/home/components/quick-action-row.tsx \
          src/features/home/components/mulearner-home.tsx
  git rm src/features/home/constants/mock-stats.ts
  git commit -m "feat(home): wire QuickActionRow with real counts; add Find Mentors; delete mock-stats"
  ```

---

## Task 14: Remove delta badges from CampusStatCards

**Files:**
- Modify: `src/features/home/components/campus/campus-stat-cards.tsx`
- Modify: `src/features/home/constants/mock-campus.ts`

- [ ] **Step 1: Rewrite CampusStatCards (remove delta row)**

  ```tsx
  import { Activity, BarChart2, CircleDot, Users } from "lucide-react";
  import { Skeleton } from "@/components/ui/skeleton";
  import type { CampusOverview } from "@/features/campus-manage/types";

  type CampusStatCardsProps = {
    overview?: CampusOverview;
    isLoading?: boolean;
  };

  const CARDS = [
    {
      key: "activeMembers" as const,
      label: "ACTIVE MEMBERS",
      icon: Users,
      iconColor: "text-warning",
      iconBg: "bg-warning/10",
      getValue: (o: CampusOverview) => o.activeMembers.toLocaleString(),
    },
    {
      key: "campusKarma" as const,
      label: "CAMPUS KARMA",
      icon: BarChart2,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      getValue: (o: CampusOverview) => o.totalKarma.toLocaleString(),
    },
    {
      key: "activeCircles" as const,
      label: "ACTIVE CIRCLES",
      icon: CircleDot,
      iconColor: "text-success",
      iconBg: "bg-success/10",
      getValue: (o: CampusOverview) => o.igChaptersCount.toString(),
    },
    {
      key: "campusRank" as const,
      label: "CAMPUS RANK",
      icon: Activity,
      iconColor: "text-brand-purple",
      iconBg: "bg-brand-purple/10",
      getValue: (o: CampusOverview) => `#${o.rank}`,
    },
  ] as const;

  export function CampusStatCards({ overview, isLoading }: CampusStatCardsProps) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className="rounded-2xl border bg-card p-5 shadow-sm"
            >
              <div
                className={`mb-3 flex size-10 items-center justify-center rounded-xl ${card.iconBg}`}
              >
                <Icon className={`size-5 ${card.iconColor}`} />
              </div>
              {isLoading || !overview ? (
                <>
                  <Skeleton className="mb-1.5 h-8 w-24 rounded-md" />
                  <Skeleton className="h-3.5 w-32 rounded-md" />
                </>
              ) : (
                <>
                  <p className="text-3xl font-bold tracking-tight text-foreground">
                    {card.getValue(overview)}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {card.label}
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  }
  ```

- [ ] **Step 2: Remove MOCK_CAMPUS_STAT_DELTAS from mock-campus.ts**

  Open `src/features/home/constants/mock-campus.ts` and delete the `MOCK_CAMPUS_STAT_DELTAS` export (keep everything else — funnel, circle health, recent activity).

  The file should no longer contain anything about `MOCK_CAMPUS_STAT_DELTAS`.

- [ ] **Step 3: TypeScript check**

  ```bash
  npx tsc --noEmit 2>&1 | head -20
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add src/features/home/components/campus/campus-stat-cards.tsx \
          src/features/home/constants/mock-campus.ts
  git commit -m "feat(home): remove mock delta badges from CampusStatCards"
  ```

---

## Task 15: Wire CompanyHome — real jobs + profile data

**Files:**
- Modify: `src/features/home/components/company-home.tsx`
- Modify: `src/features/home/components/company/company-hero-card.tsx`
- Modify: `src/features/home/components/company/company-stat-cards.tsx`
- Modify: `src/features/home/components/company/talent-pool-card.tsx`
- Modify: `src/features/home/components/company/company-verified-banner.tsx`

- [ ] **Step 1: Rewrite CompanyHome to fetch and pass data**

  ```tsx
  "use client";

  import { useCompanyOnboardingStatus } from "@/features/auth/hooks";
  import { useUserInfo } from "@/features/auth/hooks/use-session";
  import { useCompanyProfile } from "@/features/company-jobs/hooks/use-company-profile";
  import { useJobs } from "@/features/company-jobs/hooks/use-jobs";
  import { ROLES } from "@/lib/auth";
  import { useInterestGroupsList } from "../hooks";
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
    const { data: interestGroups = [], isLoading: igsLoading } =
      useInterestGroupsList();

    const jobsPosted = jobsData?.pagination?.totalCount ?? 0;
    const companyName = profile?.name ?? undefined;

    return (
      <div className="space-y-5">
        <CompanyVerifiedBanner status={companyStatus} companyName={companyName} />
        <CompanyHeroCard
          jobsPosted={jobsPosted}
          isLoading={jobsLoading || profileLoading}
        />
        <CompanyStatCards
          jobsPosted={jobsPosted}
          isLoading={jobsLoading}
        />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_296px]">
          <ActiveJobListingsCard />
          <TalentPoolCard
            interestGroups={interestGroups}
            igsLoading={igsLoading}
          />
        </div>
      </div>
    );
  }
  ```

  > Note: `JobsListResponse.pagination` — check the actual shape in `src/features/company-jobs/types.ts`. The `totalCount` field may be named differently. Run `grep -n totalCount src/features/company-jobs/` to confirm.

- [ ] **Step 2: Check actual jobs pagination field name**

  ```bash
  grep -rn "totalCount\|total_count\|count" src/features/company-jobs/schemas/ | head -20
  ```

  Update the `jobsPosted` line in CompanyHome to use the correct field name.

- [ ] **Step 3: Rewrite CompanyHeroCard**

  ```tsx
  import { Plus, Users } from "lucide-react";
  import Link from "next/link";
  import { Skeleton } from "@/components/ui/skeleton";

  type Props = {
    jobsPosted: number;
    isLoading: boolean;
  };

  export function CompanyHeroCard({ jobsPosted, isLoading }: Props) {
    return (
      <div className="flex flex-col gap-6 rounded-2xl bg-foreground p-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4">
          <div className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
            Company Dashboard
          </div>
          <h1 className="text-3xl font-black leading-tight text-background">
            Find your next <span className="text-primary">hire.</span>
          </h1>
          <p className="max-w-sm text-sm text-background/60">
            Post jobs with karma and level filters — reach talent that&apos;s
            actually ready.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/company/jobs/create"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="size-4" />
              Post a Job
            </Link>
            <Link
              href="/dashboard/talent-pool"
              className="inline-flex items-center gap-1.5 rounded-full border border-background/30 px-5 py-2.5 text-sm font-semibold text-background/70 transition-colors hover:border-background/60 hover:text-background"
            >
              <Users className="size-4" />
              Browse Talent
            </Link>
          </div>
        </div>

        <div className="shrink-0 space-y-3 md:min-w-52">
          <div className="flex items-baseline justify-between gap-8">
            <span className="text-sm text-background/60">Jobs Posted</span>
            {isLoading ? (
              <Skeleton className="h-6 w-12 bg-background/20" />
            ) : (
              <span className="text-xl font-bold text-background">
                {jobsPosted}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 4: Rewrite CompanyStatCards**

  ```tsx
  import { Briefcase, Globe, Users } from "lucide-react";
  import { Skeleton } from "@/components/ui/skeleton";

  type Props = {
    jobsPosted: number;
    isLoading: boolean;
  };

  export function CompanyStatCards({ jobsPosted, isLoading }: Props) {
    const cards = [
      {
        key: "jobsPosted",
        label: "JOBS POSTED",
        icon: Briefcase,
        iconColor: "text-primary",
        iconBg: "bg-primary/10",
        value: jobsPosted.toString(),
        subLabel: "active listings",
      },
      {
        key: "talentPool",
        label: "TALENT POOL",
        icon: Globe,
        iconColor: "text-success",
        iconBg: "bg-success/10",
        value: "MuLearn",
        subLabel: "verified learners",
      },
      {
        key: "network",
        label: "NETWORK",
        icon: Users,
        iconColor: "text-brand-purple",
        iconBg: "bg-brand-purple/10",
        value: "Kerala",
        subLabel: "region coverage",
      },
    ];

    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className="rounded-2xl border bg-card p-5 shadow-sm"
            >
              <div
                className={`mb-3 flex size-10 items-center justify-center rounded-xl ${card.iconBg}`}
              >
                <Icon className={`size-5 ${card.iconColor}`} />
              </div>
              {isLoading && card.key === "jobsPosted" ? (
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
                  <p className="mt-2.5 text-xs text-muted-foreground">
                    {card.subLabel}
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  }
  ```

- [ ] **Step 5: Rewrite TalentPoolCard**

  ```tsx
  import { Users } from "lucide-react";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { Skeleton } from "@/components/ui/skeleton";
  import type { InterestGroupListItem } from "../../schemas/home.schema";

  type Props = {
    interestGroups: InterestGroupListItem[];
    igsLoading: boolean;
  };

  const LEVEL_COLORS = ["#374151", "#6366f1", "#a855f7", "#f59e0b", "#10b981"];

  export function TalentPoolCard({ interestGroups, igsLoading }: Props) {
    const topIgs = interestGroups.slice(0, 4);

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
            MuLearn verified learners network
          </p>

          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Top Interest Groups
          </p>
          {igsLoading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-5 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {topIgs.map((ig, idx) => (
                <div key={ig.id} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate text-xs font-medium text-foreground">
                    {ig.name}
                  </span>
                  <div className="flex-1 overflow-hidden rounded-full bg-muted h-2">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${100 - idx * 18}%`,
                        backgroundColor: LEVEL_COLORS[idx % LEVEL_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  ```

- [ ] **Step 6: TypeScript check**

  ```bash
  npx tsc --noEmit 2>&1 | head -30
  ```

- [ ] **Step 7: Delete mock-company.ts**

  ```bash
  rm src/features/home/constants/mock-company.ts
  npx tsc --noEmit 2>&1 | head -20
  ```

  Expected: no errors about mock-company.

- [ ] **Step 8: Commit**

  ```bash
  git add src/features/home/components/company-home.tsx \
          src/features/home/components/company/company-hero-card.tsx \
          src/features/home/components/company/company-stat-cards.tsx \
          src/features/home/components/company/talent-pool-card.tsx
  git rm src/features/home/constants/mock-company.ts
  git commit -m "feat(home): wire CompanyHome to real jobs and IG data; delete mock-company"
  ```

---

## Task 16: Final cleanup — verify no mock imports remain

- [ ] **Step 1: Search for remaining mock imports**

  ```bash
  grep -rn "mock-mentor\|mock-company\|mock-stats" src/features/home/
  ```

  Expected: no output.

- [ ] **Step 2: Full TypeScript build check**

  ```bash
  npx tsc --noEmit
  ```

  Expected: exit code 0 (no errors).

- [ ] **Step 3: Check `useEvents` is no longer imported anywhere in home**

  ```bash
  grep -rn "useEvents\|getEvents" src/features/home/
  ```

  Expected: no output (dead code already removed in Task 3).

- [ ] **Step 4: Commit**

  ```bash
  git add -A
  git commit -m "feat(home): complete dashboard home API integration — all mocks removed"
  ```

---

## Self-review against spec

| Spec requirement | Task |
|---|---|
| Add `mentor.*` endpoints | Task 1 |
| Add `public.jobs` endpoint | Task 1 |
| Remove Google Sheets URL from `dashboard.events` | Task 1 |
| Zod schemas: MentorOverview, MentorSessions, MentorMentees | Task 2 |
| API functions: getMentorOverview, getMentorSessions, getMentorMentees, getPublicJobsCount | Task 3 |
| Remove dead `getEvents()` | Task 3 |
| Query keys: mentorOverview, mentorSessions, mentorMentees, publicJobsCount | Task 4 |
| Hooks: useMentorOverview (with 403 no-retry), useMentorSessions, useMentorMentees, usePublicJobsCount | Task 4 |
| MentorSetupPrompt component | Task 5 |
| MentorHome: hook wiring, 403 guard, typed props | Task 6 |
| MentorStatCards: typed props, no mock, skeleton loading | Task 7 |
| MentorHeroCard: real session data, verified/unverified badge | Task 8 |
| UpcomingSessionsCard: real sessions, deterministic avatar color | Task 9 |
| SessionRequestsCard: real PENDING sessions | Task 10 |
| MenteeProgressCard: real mentees, deterministic avatar | Task 11 |
| AvailabilityCard: expertise from API | Task 12 |
| Delete mock-mentor.ts | Task 12 |
| QuickActionRow: real circle/rank/job counts, Find Mentors action | Task 13 |
| Delete mock-stats.ts | Task 13 |
| CampusStatCards: remove delta badges | Task 14 |
| Remove MOCK_CAMPUS_STAT_DELTAS from mock-campus.ts | Task 14 |
| CompanyHome: hook wiring | Task 15 |
| CompanyHeroCard, CompanyStatCards, TalentPoolCard: real data | Task 15 |
| Delete mock-company.ts | Task 15 |
| EventsSliderCard: already uses useFeaturedEvents — no change needed | — |
| Final clean check | Task 16 |
