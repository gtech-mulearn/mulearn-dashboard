# Learner Home Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the pixel-perfect learner/student dashboard home page with RBAC routing, wiring real APIs where available and mock data where the backend gap is documented.

**Architecture:** `MuLearnerHome` composes seven focused card components laid out in a two-column grid (main content | calendar). `HomePage` re-enables the role switcher to render the correct home shell per role. Mock constants are isolated to one file so they can be deleted when the real API lands.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind 4, TanStack Query v5, Zod, Lucide React, date-fns

---

## File Map

| Status | File | Purpose |
|--------|------|---------|
| **Create** | `src/features/home/constants/mock-stats.ts` | All mock data in one deletable file |
| **Create** | `src/features/home/components/quick-action-row.tsx` | 5-card action strip at top |
| **Create** | `src/features/home/components/home-stats-panel.tsx` | 4 stat rows inside hero card |
| **Rewrite** | `src/features/home/components/hero-card.tsx` | New design: badge + greeting + stats panel |
| **Rewrite** | `src/features/home/components/interest-groups-card.tsx` | Numbered list with cluster chips |
| **Rewrite** | `src/features/home/components/karma-earners-card.tsx` | Leaderboard row list |
| **Rewrite** | `src/features/home/components/mulearner-home.tsx` | Compose full learner layout |
| **Modify** | `src/features/home/hooks/query-keys.ts` | Add `topPerformers` key |
| **Modify** | `src/features/home/hooks/use-home.ts` | Add `useTopPerformers` hook |
| **Modify** | `src/features/home/components/learning-circles-card.tsx` | Strip decorative SVGs, clean card style |
| **Modify** | `src/features/home/components/event-calendar-card.tsx` | White card bg, remove violet gradient |
| **Modify** | `src/features/home/components/home-page.tsx` | Re-enable RBAC role switcher |

---

## Task 1: Mock constants

**Files:**
- Create: `src/features/home/constants/mock-stats.ts`

These values correspond exactly to the screenshot. When backend Issues #1–#3 land, delete this file and wire real data.

- [ ] **Create the constants file**

```ts
// src/features/home/constants/mock-stats.ts

export const MOCK_STATS = {
  karma: {
    total: 4821,
    thisWeek: 340,
    deltaPct: 12,      // positive = green badge
  },
  rank: {
    current: 142,
    delta: -8,         // negative number = rank improved (display as -8)
  },
  activeCircles: {
    count: 7,
    delta: 2,
  },
  streak: {
    days: 14,
  },
} as const;

export const MOCK_NEXT_MEETING = {
  circleName: "Web Dev Circle",
  dateLabel: "tomorrow at 6 PM",
} as const;

export const MOCK_QUICK_ACTION_COUNTS = {
  myCircles: 7,       // active circle count
  leaderboardRank: 142,
  jobOpenings: 12,
} as const;
```

- [ ] **Commit**

```bash
git add src/features/home/constants/mock-stats.ts
git commit -m "feat(home): add mock stats constants for learner home"
```

---

## Task 2: Add `useTopPerformers` hook

**Files:**
- Modify: `src/features/home/hooks/query-keys.ts`
- Modify: `src/features/home/hooks/use-home.ts`

The existing `useLeaderboard` hook's `select` strips `institution` which we need for the subtext row. Create a dedicated hook in `use-home.ts` using `fetchStudentLeaderboard` directly.

- [ ] **Add key to query-keys.ts**

```ts
// src/features/home/hooks/query-keys.ts
export const homeKeys = {
  all: ["home"] as const,
  interestGroups: () => [...homeKeys.all, "interest-groups"] as const,
  karmaFeed: () => [...homeKeys.all, "karma-feed"] as const,
  events: () => [...homeKeys.all, "events"] as const,
  calendarEvents: () => [...homeKeys.all, "calendar-events"] as const,
  topPerformers: () => [...homeKeys.all, "top-performers"] as const,
};
```

- [ ] **Add hook to use-home.ts**

```ts
// src/features/home/hooks/use-home.ts
import { useQuery } from "@tanstack/react-query";
import {
  getCalendarEvents,
  getEvents,
  getInterestGroupsList,
  getKarmaFeed,
} from "../api";
import { fetchStudentLeaderboard } from "@/features/leaderboard/api/leaderboard.api";
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

export function useEvents() {
  return useQuery({
    queryKey: homeKeys.events(),
    queryFn: getEvents,
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

/** Top 5 student performers for the home leaderboard panel */
export function useTopPerformers() {
  return useQuery({
    queryKey: homeKeys.topPerformers(),
    queryFn: () => fetchStudentLeaderboard(false),
    staleTime: HOME_STALE_TIME,
    select: (data) => data.slice(0, 5),
  });
}
```

- [ ] **Commit**

```bash
git add src/features/home/hooks/query-keys.ts src/features/home/hooks/use-home.ts
git commit -m "feat(home): add useTopPerformers hook for learner home"
```

---

## Task 3: `<QuickActionRow>` component

**Files:**
- Create: `src/features/home/components/quick-action-row.tsx`

Five equal-width cards spanning full page width. Each card: colored icon square, title, subtitle/count. No API calls here — counts come from mock constants (or real props when wired later).

- [ ] **Create the component**

```tsx
// src/features/home/components/quick-action-row.tsx
import {
  Briefcase,
  Layers,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { MOCK_QUICK_ACTION_COUNTS } from "../constants/mock-stats";

const QUICK_ACTIONS = [
  {
    id: "mujourney",
    label: "µJourney",
    sub: "Track your progress",
    href: "/dashboard/mujourney",
    icon: Zap,
    iconBg: "#EEF2FF",
    iconColor: "#4F46E5",
  },
  {
    id: "claim-karma",
    label: "Claim Karma",
    sub: "Submit your tasks",
    href: "/dashboard/mujourney",
    icon: Layers,
    iconBg: "#F0FDF4",
    iconColor: "#16A34A",
  },
  {
    id: "my-circles",
    label: "My Circles",
    sub: `${MOCK_QUICK_ACTION_COUNTS.myCircles} active circles`,
    href: "/dashboard/learning-circle",
    icon: Users,
    iconBg: "#F5F3FF",
    iconColor: "#7C3AED",
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    sub: `You're ranked #${MOCK_QUICK_ACTION_COUNTS.leaderboardRank}`,
    href: "/dashboard/leaderboard",
    icon: Trophy,
    iconBg: "#FFFBEB",
    iconColor: "#D97706",
  },
  {
    id: "jobs-board",
    label: "Jobs Board",
    sub: `${MOCK_QUICK_ACTION_COUNTS.jobOpenings} new openings`,
    href: "/dashboard/company/jobs",
    icon: Briefcase,
    iconBg: "#FFF1F2",
    iconColor: "#E11D48",
  },
] as const;

export function QuickActionRow() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {QUICK_ACTIONS.map(({ id, label, sub, href, icon: Icon, iconBg, iconColor }) => (
        <Link key={id} href={href}>
          <Card className="flex cursor-pointer items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: iconBg }}
            >
              <Icon className="size-4" style={{ color: iconColor }} />
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

- [ ] **Commit**

```bash
git add src/features/home/components/quick-action-row.tsx
git commit -m "feat(home): add QuickActionRow component"
```

---

## Task 4: `<HomeStatsPanel>` component

**Files:**
- Create: `src/features/home/components/home-stats-panel.tsx`

Four stat rows: Total Karma, Rank, Active Circles, Streak. Renders inside the right half of the hero card. Uses mock data until backend Issue #1 lands.

- [ ] **Create the component**

```tsx
// src/features/home/components/home-stats-panel.tsx
import { Flame } from "lucide-react";
import { MOCK_STATS } from "../constants/mock-stats";

function DeltaBadge({
  value,
  isPositiveGood = true,
}: {
  value: number;
  isPositiveGood?: boolean;
}) {
  const isGood = isPositiveGood ? value > 0 : value < 0;
  const label = value > 0 ? `+${value}` : `${value}`;

  return (
    <span
      className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold"
      style={{
        backgroundColor: isGood ? "#DCFCE7" : "#FEE2E2",
        color: isGood ? "#15803D" : "#B91C1C",
      }}
    >
      {label}
    </span>
  );
}

export function HomeStatsPanel() {
  const { karma, rank, activeCircles, streak } = MOCK_STATS;

  const rows = [
    {
      label: "Total Karma",
      value: (
        <span>
          <span className="text-xl font-bold text-foreground">
            {karma.total.toLocaleString()}
          </span>
          <span className="ml-1 text-xs text-muted-foreground">pts</span>
        </span>
      ),
      badge: <DeltaBadge value={karma.deltaPct} />,
    },
    {
      label: "Rank",
      value: (
        <span className="text-xl font-bold text-foreground">
          #{rank.current}
        </span>
      ),
      // rank.delta is negative when rank number improved (142 → 134 = -8 = good)
      badge: <DeltaBadge value={rank.delta} isPositiveGood={false} />,
    },
    {
      label: "Active Circles",
      value: (
        <span className="text-xl font-bold text-foreground">
          {activeCircles.count}
        </span>
      ),
      badge: <DeltaBadge value={activeCircles.delta} />,
    },
    {
      label: "Streak",
      value: (
        <span>
          <span className="text-xl font-bold text-foreground">
            {streak.days}
          </span>
          <span className="ml-1 text-xs text-muted-foreground">days</span>
        </span>
      ),
      badge: (
        <Flame className="size-4" style={{ color: "#F97316" }} />
      ),
    },
  ];

  return (
    <div className="divide-y divide-border">
      {rows.map(({ label, value, badge }) => (
        <div
          key={label}
          className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
        >
          <span className="text-sm text-muted-foreground">{label}</span>
          <div className="flex items-center gap-2">
            {value}
            {badge}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add src/features/home/components/home-stats-panel.tsx
git commit -m "feat(home): add HomeStatsPanel with delta badges"
```

---

## Task 5: Rewrite `<HeroCard>`

**Files:**
- Rewrite: `src/features/home/components/hero-card.tsx`

New layout: white card, split horizontally — left has badge + greeting + subtext + CTAs, right has `<HomeStatsPanel>`. No background gradients. Name in primary colour.

- [ ] **Rewrite hero-card.tsx**

```tsx
// src/features/home/components/hero-card.tsx
import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HomeStatsPanel } from "./home-stats-panel";
import { MOCK_STATS, MOCK_NEXT_MEETING } from "../constants/mock-stats";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "Good morning,";
  if (hour >= 12 && hour < 17) return "Good afternoon,";
  return "Good evening,";
}

type HeroCardProps = {
  name: string;
};

export function HeroCard({ name }: HeroCardProps) {
  const { karma } = MOCK_STATS;
  const { circleName, dateLabel } = MOCK_NEXT_MEETING;

  return (
    <Card className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-col divide-y divide-border md:flex-row md:divide-x md:divide-y-0">
        {/* ── Left: Greeting ─────────────────────────────── */}
        <div className="flex flex-1 flex-col justify-center gap-5 p-6 lg:p-8">
          {/* Active learner badge */}
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="text-xs font-semibold text-primary">
              Active learner
            </span>
          </div>

          {/* Greeting */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
              {getGreeting()}{" "}
              <span className="text-primary">{name}.</span>
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              You&apos;ve earned{" "}
              <strong className="font-semibold text-foreground">
                {karma.thisWeek} karma
              </strong>{" "}
              this week. Your{" "}
              <strong className="font-semibold text-foreground">
                {circleName}
              </strong>{" "}
              meets{" "}
              <strong className="font-semibold text-foreground">
                {dateLabel}
              </strong>
              .
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Button asChild className="gap-2">
              <Link href="/dashboard/mujourney">
                <TrendingUp className="size-4" />
                Continue learning
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/learning-circle">Explore groups</Link>
            </Button>
          </div>
        </div>

        {/* ── Right: Stats panel ──────────────────────────── */}
        <div className="w-full p-6 md:w-72 lg:w-80">
          <HomeStatsPanel />
        </div>
      </div>
    </Card>
  );
}
```

- [ ] **Commit**

```bash
git add src/features/home/components/hero-card.tsx
git commit -m "feat(home): rewrite HeroCard with inline stats panel"
```

---

## Task 6: Rewrite `<InterestGroupsCard>`

**Files:**
- Rewrite: `src/features/home/components/interest-groups-card.tsx`

Numbered list (01–06) with a coloured dot per row, IG name, and a right-aligned neutral cluster chip. Remove image thumbnails and decorative SVGs.

- [ ] **Rewrite interest-groups-card.tsx**

```tsx
// src/features/home/components/interest-groups-card.tsx
import { ArrowRight, Layers } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { InterestGroupListItem } from "../schemas";

type InterestGroupsCardProps = {
  groups: InterestGroupListItem[];
  isLoading?: boolean;
};

/** Colors cycle in order regardless of category — matches the screenshot */
const DOT_COLORS = [
  "#4F46E5", // indigo
  "#7C3AED", // violet
  "#3B82F6", // blue
  "#F59E0B", // amber
  "#EC4899", // pink
  "#06B6D4", // cyan
];

export function InterestGroupsCard({
  groups,
  isLoading,
}: InterestGroupsCardProps) {
  const visible = groups.slice(0, 6);

  return (
    <Card className="h-full rounded-2xl border bg-card shadow-sm">
      {/* Header */}
      <CardHeader className="flex-row items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <Layers className="size-4 text-primary" />
          </div>
          <CardTitle className="text-base font-bold text-foreground">
            Interest Groups
          </CardTitle>
        </div>
        <Link
          href="/dashboard/interest-groups"
          className="group flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Browse
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </CardHeader>

      {/* Body */}
      <CardContent className="px-5 pb-5 pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No interest groups available.
          </p>
        ) : (
          <div className="space-y-0">
            {visible.map((group, index) => {
              const dot = DOT_COLORS[index % DOT_COLORS.length];
              const num = String(index + 1).padStart(2, "0");

              return (
                <Link
                  key={group.id}
                  href={`/dashboard/interest-groups/${group.id}`}
                  className="flex items-center gap-3 border-b border-border py-3 last:border-b-0 hover:bg-muted/40 -mx-1 px-1 rounded-lg transition-colors"
                >
                  {/* Number */}
                  <span className="w-5 shrink-0 text-xs font-medium text-muted-foreground">
                    {num}
                  </span>

                  {/* Dot */}
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: dot }}
                  />

                  {/* Name */}
                  <span className="flex-1 truncate text-sm font-medium text-foreground">
                    {group.name}
                  </span>

                  {/* Cluster chip */}
                  {group.category ? (
                    <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {group.category}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Commit**

```bash
git add src/features/home/components/interest-groups-card.tsx
git commit -m "feat(home): redesign InterestGroupsCard as numbered list with cluster chips"
```

---

## Task 7: Rewrite `<KarmaEarnersCard>` → Top Performers

**Files:**
- Rewrite: `src/features/home/components/karma-earners-card.tsx`

Row-based leaderboard: rank indicator → avatar initials → name + `muid · institution` → karma value. Uses `useTopPerformers()` hook. `muid` not yet in API so falls back to initials-based avatar colour + name only subtext.

- [ ] **Rewrite karma-earners-card.tsx**

```tsx
// src/features/home/components/karma-earners-card.tsx
import { ArrowRight, Trophy } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTopPerformers } from "../hooks/use-home";

/** Avatar background colours cycle by rank position */
const AVATAR_COLORS = [
  { bg: "#EEF2FF", text: "#4F46E5" }, // indigo
  { bg: "#F5F3FF", text: "#7C3AED" }, // violet
  { bg: "#F0FDF4", text: "#16A34A" }, // green
  { bg: "#FFF7ED", text: "#EA580C" }, // orange
  { bg: "#FDF4FF", text: "#A21CAF" }, // fuchsia
];

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function formatKarma(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function RankIndicator({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span className="text-base" style={{ color: "#F59E0B" }}>
        ♦
      </span>
    );
  if (rank === 2)
    return <span className="text-base text-muted-foreground">◆</span>;
  return (
    <span className="flex size-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700">
      {rank}
    </span>
  );
}

export function KarmaEarnersCard() {
  const { data: performers, isLoading } = useTopPerformers();

  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      {/* Header */}
      <CardHeader className="flex-row items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50">
            <Trophy className="size-4 text-amber-500" />
          </div>
          <CardTitle className="text-base font-bold text-foreground">
            Top Performers
          </CardTitle>
        </div>
        <Link
          href="/dashboard/leaderboard"
          className="group flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Full board
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </CardHeader>

      {/* Body */}
      <CardContent className="px-5 pb-5 pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : !performers || performers.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No performers data available.
          </p>
        ) : (
          <div className="space-y-0">
            {performers.map((p, index) => {
              const rank = index + 1;
              const colors = AVATAR_COLORS[index % AVATAR_COLORS.length];
              const inits = initials(p.full_name);

              return (
                <div
                  key={p.full_name + index}
                  className="flex items-center gap-3 border-b border-border py-3 last:border-b-0"
                >
                  {/* Rank */}
                  <div className="flex w-5 shrink-0 items-center justify-center">
                    <RankIndicator rank={rank} />
                  </div>

                  {/* Avatar */}
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                    style={{
                      backgroundColor: colors.bg,
                      color: colors.text,
                    }}
                  >
                    {inits}
                  </div>

                  {/* Name + subtext */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {p.full_name}
                    </p>
                    {p.institution ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {p.institution}
                      </p>
                    ) : null}
                  </div>

                  {/* Karma */}
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-foreground">
                      {formatKarma(p.total_karma)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">karma</p>
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

- [ ] **Commit**

```bash
git add src/features/home/components/karma-earners-card.tsx
git commit -m "feat(home): rewrite KarmaEarnersCard as leaderboard row list"
```

---

## Task 8: Reskin `<LearningCirclesCard>`

**Files:**
- Modify: `src/features/home/components/learning-circles-card.tsx`

Remove the three decorative SVG ring elements and the `hover-translate`/glow on the card container. Simplify `CircleItem` to clean white card with icon, member badge, name, and IG name — matching the screenshot's clean grid style.

- [ ] **Replace the file contents**

```tsx
// src/features/home/components/learning-circles-card.tsx
"use client";

import { ArrowRight, Plus, Users, Users2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCircles } from "@/features/learning-circle";
import type { LearningCircle } from "@/features/learning-circle/schemas/circle.schema";

const ACCENT_VARS = [
  { bg: "#EEF2FF", color: "#4F46E5" },
  { bg: "#F5F3FF", color: "#7C3AED" },
  { bg: "#ECFDF5", color: "#059669" },
  { bg: "#FFF7ED", color: "#EA580C" },
] as const;

type LearningCirclesCardProps = {
  userInterestGroups?: { id: string; name: string }[];
};

export function LearningCirclesCard({
  userInterestGroups,
}: LearningCirclesCardProps) {
  const { data: circles, isLoading } = useCircles();

  const igNames = new Set(
    (userInterestGroups ?? []).map((ig) => ig.name.toLowerCase()),
  );
  const filtered =
    igNames.size > 0
      ? (circles ?? []).filter((c) => igNames.has(c.ig.toLowerCase()))
      : (circles ?? []);
  const visible = filtered.slice(0, 4);
  const hasCircles = visible.length > 0;

  return (
    <Card className="h-full rounded-2xl border bg-card shadow-sm">
      {/* Header */}
      <CardHeader className="flex-row items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-violet-50">
            <Users2 className="size-4 text-violet-600" />
          </div>
          <CardTitle className="text-base font-bold text-foreground">
            Learning Circles
          </CardTitle>
        </div>
        {hasCircles && (
          <Link
            href="/dashboard/learning-circle"
            className="group flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View all
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </CardHeader>

      <CardContent className="px-5 pb-5 pt-0">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : hasCircles ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              {visible.map((circle, i) => (
                <CircleCard
                  key={circle.id}
                  circle={circle}
                  accent={ACCENT_VARS[i % ACCENT_VARS.length]}
                />
              ))}
            </div>
            {filtered.length > 4 && (
              <Link
                href="/dashboard/learning-circle"
                className="mt-3 block text-center text-sm text-muted-foreground hover:text-foreground"
              >
                +{filtered.length - 4} more circles
              </Link>
            )}
          </>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-violet-50">
              <Users className="size-5 text-violet-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                No circles yet
              </p>
              <p className="text-xs text-muted-foreground">
                Join or create a learning circle to collaborate with peers.
              </p>
            </div>
            <Button asChild size="sm" className="gap-2">
              <Link href="/dashboard/learning-circle">
                <Plus className="size-3.5" />
                Create Circle
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CircleCard({
  circle,
  accent,
}: {
  circle: LearningCircle;
  accent: { bg: string; color: string };
}) {
  return (
    <Link
      href={`/dashboard/learning-circle/${circle.id}`}
      className="flex flex-col gap-3 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
    >
      {/* Icon row + member count */}
      <div className="flex items-start justify-between">
        <div
          className="flex size-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: accent.bg }}
        >
          <Users className="size-4" style={{ color: accent.color }} />
        </div>
        <div
          className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
          style={{ backgroundColor: accent.bg, color: accent.color }}
        >
          <Users2 className="size-3" />
          <span>{circle.total_members}</span>
        </div>
      </div>

      {/* Name + IG */}
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-foreground">
          {circle.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {circle.ig}
        </p>
      </div>
    </Link>
  );
}
```

- [ ] **Commit**

```bash
git add src/features/home/components/learning-circles-card.tsx
git commit -m "feat(home): simplify LearningCirclesCard to clean grid"
```

---

## Task 9: Reskin `<EventCalendarCard>`

**Files:**
- Modify: `src/features/home/components/event-calendar-card.tsx`

Two changes only:
1. Replace the violet-gradient background on the `CalendarSkeleton` with a plain `bg-card` card.
2. Wrap the main render in a white `<Card>` instead of the gradient container — the calendar logic is unchanged.

- [ ] **Replace `CalendarSkeleton` function (lines 40–86 in the file)**

Find the existing `CalendarSkeleton` function and replace the wrapper div's className:

```tsx
function CalendarSkeleton() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-5 shadow-sm">
      {/* ← removed violet gradient, kept structure */}
      <div className="relative z-10 mb-4 flex items-center justify-between">
        <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
        <div className="flex gap-1.5">
          <div className="size-7 animate-pulse rounded-full bg-muted" />
          <div className="size-7 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
      <div className="relative z-10 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={`wh-${day}`}
            className="mx-auto h-3.5 w-5 animate-pulse rounded bg-muted"
          />
        ))}
        {Array.from({ length: 35 }, (_, i) => `d-${i}`).map((key) => (
          <div
            key={key}
            className="mx-auto size-8 animate-pulse rounded-full bg-muted"
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Wrap the main return in a white card**

Find the outermost container div in the `EventCalendarCard` return (the one currently with `bg-linear-to-br from-violet-300 via-purple-200...`) and replace its className:

```tsx
// Before (approximate):
<div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-linear-to-br from-violet-300 via-purple-200 to-purple-100 p-5 shadow-sm">

// After:
<div className="relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-5 shadow-sm">
```

Also update any hardcoded violet/purple text colors within the calendar header and day cells to use semantic tokens (`text-foreground`, `text-muted-foreground`, `text-primary`) instead of hardcoded violet hex values.

- [ ] **Commit**

```bash
git add src/features/home/components/event-calendar-card.tsx
git commit -m "feat(home): reskin EventCalendarCard to white card"
```

---

## Task 10: Compose `<MuLearnerHome>`

**Files:**
- Rewrite: `src/features/home/components/mulearner-home.tsx`

Page layout matching the screenshot exactly:
1. `<QuickActionRow>` — full width
2. Two-column grid (`[1fr_296px]`):
   - **Left column:** Hero → [Circles | IG] → TopPerformers
   - **Right column:** Calendar (spans all three left rows as a tall card)

- [ ] **Rewrite mulearner-home.tsx**

```tsx
// src/features/home/components/mulearner-home.tsx
"use client";

import { useUserInfo, useUserProfile } from "@/features/auth/hooks/use-session";
import { useCalendarEvents, useInterestGroupsList } from "../hooks";
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

  const displayName = userInfo?.full_name?.split(" ")[0] ?? "Learner";

  // Show all IGs — the API already scopes to the user's domain on the server side.
  // If it doesn't, the existing domain-filter logic from home-page.tsx can be
  // moved here and passed as `groups` prop.
  const groups = interestGroups ?? [];

  return (
    <div className="space-y-5">
      {/* Row 1: Quick action strip */}
      <QuickActionRow />

      {/* Row 2+: Main content + calendar side-by-side */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_296px]">
        {/* ── Left column ──────────────────────────────────── */}
        <div className="space-y-5">
          {/* Hero card with embedded stats */}
          <HeroCard name={displayName} />

          {/* Circles + Interest Groups */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-[3fr_2fr]">
            <LearningCirclesCard
              userInterestGroups={userProfile?.interest_groups}
            />
            <InterestGroupsCard
              groups={groups}
              isLoading={loadingGroups}
            />
          </div>

          {/* Top Performers */}
          <KarmaEarnersCard />
        </div>

        {/* ── Right column: Calendar ────────────────────────── */}
        <div className="hidden lg:block">
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

- [ ] **Commit**

```bash
git add src/features/home/components/mulearner-home.tsx
git commit -m "feat(home): compose MuLearnerHome with full learner layout"
```

---

## Task 11: Re-enable RBAC role switcher in `<HomePage>`

**Files:**
- Modify: `src/features/home/components/home-page.tsx`

Remove the commented-out switcher. Use `usePermissions()` to detect role and render the correct home shell. For roles that haven't been built yet (Mentor, Company, Enabler) render a `<ComingSoon>` stub so the page doesn't crash.

- [ ] **Rewrite home-page.tsx**

```tsx
// src/features/home/components/home-page.tsx
"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { ROLES, CAMPUS_MANAGEMENT_ROLES } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { MuLearnerHome } from "./mulearner-home";
import { VerificationStatusBanner } from "./verification-status-banner";
import { useUserInfo } from "@/features/auth/hooks/use-session";

function RoleComingSoon({ role }: { role: string }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center rounded-2xl border bg-card shadow-sm">
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-foreground">{role} Dashboard</p>
        <p className="text-sm text-muted-foreground">Coming soon</p>
      </div>
    </div>
  );
}

function HomeLoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-5 gap-3">
        {[0,1,2,3,4].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
      </div>
      <Skeleton className="h-48 rounded-2xl" />
      <div className="grid grid-cols-2 gap-5">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}

export function HomePage() {
  const { roles, isLoading } = usePermissions();
  const { data: userInfo } = useUserInfo();

  if (isLoading) return <HomeLoadingSkeleton />;

  const renderHome = () => {
    if (roles.includes(ROLES.MENTOR)) return <RoleComingSoon role="Mentor" />;
    if (roles.includes(ROLES.COMPANY)) return <RoleComingSoon role="Company" />;
    if (roles.some((r) => (CAMPUS_MANAGEMENT_ROLES as readonly string[]).includes(r))) {
      return <RoleComingSoon role="Campus" />;
    }
    // Default for Student, Enabler, Learner, and all other roles
    return <MuLearnerHome />;
  };

  return (
    <div className="space-y-5 p-1">
      <VerificationStatusBanner roles={userInfo?.roles ?? []} />
      {renderHome()}
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add src/features/home/components/home-page.tsx
git commit -m "feat(home): re-enable RBAC role switcher with MuLearnerHome as default"
```

---

## Task 12: Export cleanup

**Files:**
- Check: `src/features/home/components/index.ts`
- Check: `src/features/home/hooks/index.ts`

Ensure all new/modified components are exported correctly.

- [ ] **Verify components/index.ts exports all components**

```ts
// src/features/home/components/index.ts
export { CompanyHome } from "./company-home";
export { EnablerHome } from "./enabler-home";
export { EventCalendarCard } from "./event-calendar-card";
export { EventsSliderCard } from "./events-slider-card";
export { HeroCard } from "./hero-card";
export { HomePage } from "./home-page";
export { HomeStatsPanel } from "./home-stats-panel";
export { InterestGroupsCard } from "./interest-groups-card";
export { KarmaEarnersCard } from "./karma-earners-card";
export { LearningCirclesCard } from "./learning-circles-card";
export { MentorHome } from "./mentor-home";
export { MuLearnerHome } from "./mulearner-home";
export { QuickActionRow } from "./quick-action-row";
export { StudentHome } from "./student-home";
export { VerificationStatusBanner } from "./verification-status-banner";
```

- [ ] **Verify hooks/index.ts exports useTopPerformers**

```ts
// src/features/home/hooks/index.ts — add useTopPerformers to existing exports
export {
  useCalendarEvents,
  useEvents,
  useInterestGroupsList,
  useKarmaFeed,
  useTopPerformers,
} from "./use-home";
```

- [ ] **Commit**

```bash
git add src/features/home/components/index.ts src/features/home/hooks/index.ts
git commit -m "chore(home): update barrel exports for new home components"
```

---

## Task 13: Verify TypeScript and build

- [ ] **Run type check**

```bash
cd "d:/Dev/work/Mulearn/dashboard migration/mulearn-dashboard"
npx tsc --noEmit
```

Expected: no errors. If errors appear, they will be in the files modified above — fix them before proceeding.

Common issues to watch for:
- `HeroCard` no longer accepts `src` / `alt` props — verify nothing else imports `HeroCard` with those props. Run: `grep -r "HeroCard" src/ --include="*.tsx"` and fix any callers.
- `KarmaEarnersCard` no longer accepts `data` / `isLoading` props — fix callers.
- `InterestGroupsCard` no longer accepts `category` prop — fix callers (just `home-page.tsx` which is now rewritten).

- [ ] **Run dev server and manually verify the page**

```bash
npm run dev
```

Open `http://localhost:3000/dashboard`. Verify:
- [ ] Quick action row shows 5 cards
- [ ] Hero card shows greeting with primary-colour name
- [ ] Stats panel shows 4 rows with delta badges
- [ ] Learning circles 2×2 grid renders (or empty state)
- [ ] Interest groups numbered list renders with cluster chips
- [ ] Top performers shows leaderboard rows
- [ ] Calendar renders with white background on the right
- [ ] Page is responsive (calendar hidden on mobile, stacks on tablet)

- [ ] **Final commit**

```bash
git add -A
git commit -m "feat(home): complete learner home page with RBAC routing"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Quick action row (5 cards)
- ✅ Hero card with badge, greeting, weekly karma, next meeting, CTAs
- ✅ Stats panel: Total Karma + delta, Rank + delta, Active Circles + delta, Streak + flame
- ✅ Learning circles 2×2 grid
- ✅ Interest groups numbered list with cluster chips + coloured dots
- ✅ Top performers leaderboard rows
- ✅ Calendar white card reskin
- ✅ RBAC role switcher re-enabled
- ✅ Mock data isolated to one file
- ✅ Responsive layout (lg:grid-cols + hidden on mobile for calendar)

**Type consistency:**
- `HeroCard` props: `{ name: string }` — no `src`/`alt`
- `KarmaEarnersCard` props: none (fetches own data via `useTopPerformers`)
- `InterestGroupsCard` props: `{ groups, isLoading }` — no `category`
- `HomeStatsPanel` props: none (reads from `MOCK_STATS`)
- `QuickActionRow` props: none (reads from `MOCK_QUICK_ACTION_COUNTS`)

**No placeholders:** All code blocks are complete. No TBDs.
