# Campus Lead / Enabler Home Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Campus Lead / Enabler home dashboard (`<EnablerHome>`) as a pixel-perfect replica of the provided screenshot, wiring real APIs where available and using isolated mock data for gaps (funnel, circle health, activity feed), plus fix dark-mode CSS readability issues.

**Architecture:** Feature-first under `src/features/home/` — new components live in `components/campus/`, mock constants in `constants/mock-campus.ts`, no new hooks file (re-use `use-campus-manage.ts` from `features/campus-manage`). The `EnablerHome` component is composed in `components/enabler-home.tsx` and rendered by the existing RBAC switcher in `home-page.tsx`. Light-mode styling follows the student dashboard design system; the dark-mode fix is in `globals.css`.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind 4, TanStack Query v5, Zod, Lucide React, shadcn `Card` / `Skeleton` / `Badge` from `@/components/ui/`

---

## Layout Reference (Screenshot)

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Active Members]  [Campus Karma]  [Active Circles]  [Campus Rank]  │  ← Row 1: 4 stat cards
├──────────────────┬──────────────────────────┬────────────────────────┤
│  Member Funnel   │   Event Calendar         │   Circle Health        │  ← Row 2: 3-col grid
│  (bar chart)     │   (shared component)     │   (list + chips)       │
├──────────────────┴──────────────────────────┴────────────────────────┤
│  Top Students Table (rank/name/level/karma/status)  │  Activity Feed │  ← Row 3: 2-col grid
└─────────────────────────────────────────────────────────────────────┘
```

Pending Verifications tile from the screenshot is **replaced** by the Event Calendar (user instruction).

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/app/globals.css` | **Modify** | Fix dark-mode CSS vars: card elevation, primary-foreground contrast |
| `src/features/home/constants/mock-campus.ts` | **Create** | Mock data for funnel, circle health, activity feed (deleted when APIs land) |
| `src/features/home/components/campus/campus-stat-cards.tsx` | **Create** | 4-up stat card row (Active Members, Campus Karma, Active Circles, Campus Rank) |
| `src/features/home/components/campus/member-funnel-card.tsx` | **Create** | Horizontal funnel bar chart (Registered → Circle Lead) |
| `src/features/home/components/campus/circle-health-card.tsx` | **Create** | Circle list with `active / slow / inactive` status chips + sessions/month |
| `src/features/home/components/campus/top-students-card.tsx` | **Create** | 5-col table: rank, name, level badge, karma, status chip |
| `src/features/home/components/campus/recent-activity-card.tsx` | **Create** | Timestamped typed-event feed |
| `src/features/home/components/enabler-home.tsx` | **Rewrite** | Compose all campus panels into final layout |
| `src/features/home/components/home-page.tsx` | **Modify** | Replace `<RoleComingSoon role="Campus">` with `<EnablerHome />` |
| `src/features/home/components/index.ts` | **Modify** | Export `EnablerHome` |

---

## Task 1: Fix Dark Mode CSS Readability

**Files:**
- Modify: `src/app/globals.css:91-129`

The current dark theme has two critical bugs:
1. `--card` equals `--background` (both `oklch(0.145 0 0)`) → cards have no elevation/separation.
2. `--primary` is `#fefefe` (near-white) but `--primary-foreground` is also near-white → white text on white button background.

- [ ] **Step 1: Open `src/app/globals.css` and update the `.dark` block**

Replace lines 91–129 with:

```css
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.185 0 0);           /* lifted from background for card elevation */
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.185 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: #fefefe;
  --primary-foreground: oklch(0.145 0 0); /* dark text on near-white primary */
  --secondary: #ffffff99;
  --secondary-foreground: oklch(0.985 0 0);
  --tertiary: #ffffffb2;
  --brand-purple: #8f44ed;
  --brand-blue: #2e85fe;
  --success: #4caf50;
  --warning: #ff8d0c;
  --muted: oklch(0.23 0 0);            /* slightly lighter for better chip contrast */
  --muted-foreground: oklch(0.72 0 0); /* bumped from 0.708 for readability */
  --accent: oklch(0.23 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: #f44336;
  --destructive-foreground: oklch(0.985 0 0);
  --border: oklch(0.26 0 0);
  --input: oklch(0.23 0 0);
  --ring: #0961f5;
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: #0961f5;
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(0.269 0 0);
  --sidebar-ring: #0961f5;
}
```

- [ ] **Step 2: Verify TypeScript still passes**

Run: `npx tsc --noEmit`
Expected: no output (exit 0)

---

## Task 2: Mock Constants for Campus Data Gaps

**Files:**
- Create: `src/features/home/constants/mock-campus.ts`

Three backend endpoints don't exist yet: campus funnel, circle health, activity feed. All mock constants live in one file so they can be deleted as a unit when backend Issues land.

- [ ] **Step 1: Create `src/features/home/constants/mock-campus.ts`**

```ts
// Mock campus data — delete this file when backend Issues #funnel, #circle-health, #activity-feed land.

export type FunnelStage = {
  label: string;
  value: number;
  color: string; // hex
};

export const MOCK_CAMPUS_FUNNEL: FunnelStage[] = [
  { label: "Registered",   value: 312, color: "#6366f1" },
  { label: "Onboarded",    value: 248, color: "#8b5cf6" },
  { label: "Active",       value: 142, color: "#3b82f6" },
  { label: "Level 2+",     value: 86,  color: "#10b981" },
  { label: "Circle Lead",  value: 12,  color: "#06b6d4" },
];

export const MOCK_CAMPUS_FUNNEL_MAX = 312; // Registered count is the 100% baseline

export type CircleHealthStatus = "active" | "slow" | "inactive";

export type CircleHealthItem = {
  id: string;
  name: string;
  memberCount: number;
  sessionsPerMonth: number;
  status: CircleHealthStatus;
};

export const MOCK_CIRCLE_HEALTH: CircleHealthItem[] = [
  { id: "1", name: "Web Dev SJCET",    memberCount: 31, sessionsPerMonth: 8, status: "active"   },
  { id: "2", name: "AI/ML Circle",     memberCount: 18, sessionsPerMonth: 5, status: "active"   },
  { id: "3", name: "Cloud Builders",   memberCount: 24, sessionsPerMonth: 3, status: "slow"     },
  { id: "4", name: "Design Circle",    memberCount: 12, sessionsPerMonth: 1, status: "inactive" },
  { id: "5", name: "Game Dev SJCET",   memberCount: 22, sessionsPerMonth: 6, status: "active"   },
];

export type ActivityType = "level_up" | "circle_created" | "member_joined" | "karma_voucher";

export type ActivityItem = {
  id: string;
  type: ActivityType;
  text: string;
  timeAgo: string;
};

export const MOCK_RECENT_ACTIVITY: ActivityItem[] = [
  { id: "1", type: "level_up",       text: "Arjun Joshi completed Level 2",      timeAgo: "2h ago" },
  { id: "2", type: "circle_created", text: "New circle: Robotics SJCET created", timeAgo: "4h ago" },
  { id: "3", type: "member_joined",  text: "Divya Menon joined Web Dev Circle",  timeAgo: "5h ago" },
  { id: "4", type: "karma_voucher",  text: "4 karma vouchers submitted for review", timeAgo: "1d ago" },
  { id: "5", type: "level_up",       text: "Meera K. completed Level 3",         timeAgo: "1d ago" },
  { id: "6", type: "member_joined",  text: "Rohan P. joined AI/ML Circle",       timeAgo: "2d ago" },
];

export const MOCK_CAMPUS_STAT_DELTAS = {
  activeMembers: { pct: 18, label: "+18% this month" },
  campusKarma:   { abs: 12000, label: "+12k this week" },
  activeCircles: { abs: 2, label: "+2 new circles" },
  campusRank:    { from: 5, label: "↑ from #5 last month" },
} as const;
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: exit 0, no errors

---

## Task 3: Campus Stat Cards (4-up Row)

**Files:**
- Create: `src/features/home/components/campus/campus-stat-cards.tsx`

Matches screenshot Row 1: 4 dark cards in a grid. Each card: icon (colored), large number, label in caps, green delta badge. Light mode: same layout with white/card background.

- [ ] **Step 1: Create the component**

```tsx
import { Activity, BarChart2, CircleDot, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { CampusOverview } from "@/features/campus-manage/types";
import { MOCK_CAMPUS_STAT_DELTAS } from "../../constants/mock-campus";

type CampusStatCardsProps = {
  overview?: CampusOverview;
  isLoading?: boolean;
};

const CARDS = [
  {
    key: "activeMembers" as const,
    label: "ACTIVE MEMBERS",
    icon: Users,
    iconColor: "#f59e0b",
    iconBg: "bg-amber-500/10",
    getValue: (o: CampusOverview) => o.activeMembers.toLocaleString(),
    delta: MOCK_CAMPUS_STAT_DELTAS.activeMembers.label,
  },
  {
    key: "campusKarma" as const,
    label: "CAMPUS KARMA",
    icon: BarChart2,
    iconColor: "#6366f1",
    iconBg: "bg-indigo-500/10",
    getValue: (o: CampusOverview) => o.totalKarma.toLocaleString(),
    delta: MOCK_CAMPUS_STAT_DELTAS.campusKarma.label,
  },
  {
    key: "activeCircles" as const,
    label: "ACTIVE CIRCLES",
    icon: CircleDot,
    iconColor: "#10b981",
    iconBg: "bg-emerald-500/10",
    getValue: (o: CampusOverview) => o.igChaptersCount.toString(),
    delta: MOCK_CAMPUS_STAT_DELTAS.activeCircles.label,
  },
  {
    key: "campusRank" as const,
    label: "CAMPUS RANK",
    icon: Activity,
    iconColor: "#a855f7",
    iconBg: "bg-purple-500/10",
    getValue: (o: CampusOverview) => `#${o.rank}`,
    delta: MOCK_CAMPUS_STAT_DELTAS.campusRank.label,
  },
] as const;

export function CampusStatCards({ overview, isLoading }: CampusStatCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.key} className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className={`mb-3 flex size-10 items-center justify-center rounded-xl ${card.iconBg}`}>
              <Icon className="size-5" style={{ color: card.iconColor }} />
            </div>
            {isLoading || !overview ? (
              <>
                <Skeleton className="mb-1.5 h-8 w-24 rounded-md" />
                <Skeleton className="mb-3 h-3.5 w-32 rounded-md" />
                <Skeleton className="h-5 w-28 rounded-full" />
              </>
            ) : (
              <>
                <p className="text-3xl font-bold tracking-tight text-foreground">
                  {card.getValue(overview)}
                </p>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {card.label}
                </p>
                <p className="mt-2.5 inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {card.delta}
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

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: exit 0

---

## Task 4: Member Funnel Card

**Files:**
- Create: `src/features/home/components/campus/member-funnel-card.tsx`

Horizontal bar chart matching screenshot: stage label left, bar middle (fills proportional to max), count right.

- [ ] **Step 1: Create the component**

```tsx
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CampusOverview } from "@/features/campus-manage/types";
import { MOCK_CAMPUS_FUNNEL, MOCK_CAMPUS_FUNNEL_MAX } from "../../constants/mock-campus";
import type { FunnelStage } from "../../constants/mock-campus";

type MemberFunnelCardProps = {
  overview?: CampusOverview;
  isLoading?: boolean;
};

function FunnelRow({ stage, maxValue }: { stage: FunnelStage; maxValue: number }) {
  const pct = Math.round((stage.value / maxValue) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-xs font-medium text-muted-foreground">{stage.label}</span>
      <div className="flex-1 overflow-hidden rounded-full bg-muted h-2.5">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: stage.color }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-xs font-semibold text-foreground">{stage.value}</span>
    </div>
  );
}

export function MemberFunnelCard({ overview, isLoading }: MemberFunnelCardProps) {
  const campusLabel = overview ? `${overview.collegeName} · ${new Date().toLocaleString("default", { month: "long", year: "numeric" })}` : "";
  return (
    <Card className="h-full rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex-row items-center gap-2.5 px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10">
          <BarChart3 className="size-4 text-amber-500" />
        </div>
        <CardTitle className="text-base font-bold text-foreground">Member Funnel</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        {campusLabel && (
          <p className="mb-4 text-[11px] text-muted-foreground">{campusLabel}</p>
        )}
        {isLoading ? (
          <div className="space-y-4">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-2.5 flex-1 rounded-full" />
                <Skeleton className="h-3 w-8 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {MOCK_CAMPUS_FUNNEL.map(stage => (
              <FunnelRow key={stage.label} stage={stage} maxValue={MOCK_CAMPUS_FUNNEL_MAX} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: exit 0

---

## Task 5: Circle Health Card

**Files:**
- Create: `src/features/home/components/campus/circle-health-card.tsx`

List of circles (from `useIgChapters()` for names + member counts, with mock health status). Each row: circle name, member count subtext, sessions/month subtext, status chip on right.

Status chip thresholds (product decision — using screenshot values):
- `active` = green, ≥ 4 sessions/month
- `slow` = amber, 2–3 sessions/month
- `inactive` = red, ≤ 1 sessions/month

- [ ] **Step 1: Create the component**

```tsx
import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { IgChapter } from "@/features/campus-manage/types";
import { MOCK_CIRCLE_HEALTH } from "../../constants/mock-campus";
import type { CircleHealthItem, CircleHealthStatus } from "../../constants/mock-campus";
import { cn } from "@/lib/utils";

type CircleHealthCardProps = {
  igChapters?: IgChapter[];
  isLoading?: boolean;
};

const STATUS_STYLES: Record<CircleHealthStatus, string> = {
  active:   "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  slow:     "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  inactive: "bg-red-500/15 text-red-600 dark:text-red-400",
};

function mergeWithIgChapters(mock: CircleHealthItem[], chapters?: IgChapter[]): CircleHealthItem[] {
  if (!chapters || chapters.length === 0) return mock;
  // Overlay real chapter names/memberCount onto mock health data by index
  return mock.map((item, i) => {
    const chapter = chapters[i];
    if (!chapter) return item;
    return { ...item, name: chapter.name, memberCount: chapter.membersCount };
  });
}

export function CircleHealthCard({ igChapters, isLoading }: CircleHealthCardProps) {
  const items = mergeWithIgChapters(MOCK_CIRCLE_HEALTH, igChapters);

  return (
    <Card className="h-full rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex-row items-center gap-2.5 px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10">
          <Activity className="size-4 text-emerald-500" />
        </div>
        <CardTitle className="text-base font-bold text-foreground">Circle Health</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map(i => (
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
            {items.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b border-border py-3 last:border-b-0"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {item.memberCount} members · {item.sessionsPerMonth} sessions/month
                  </p>
                </div>
                <span className={cn(
                  "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                  STATUS_STYLES[item.status],
                )}>
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

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: exit 0

---

## Task 6: Top Students Card

**Files:**
- Create: `src/features/home/components/campus/top-students-card.tsx`

Table with 5 columns: `# | Name | Level | Karma | Status`. Uses `useCampusLeaderboard()` data. Status derived from `alumni` field (alumni → "alumni", else "active"). Top 8 rows shown.

- [ ] **Step 1: Create the component**

```tsx
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CampusLeaderboardItem, CampusOverview } from "@/features/campus-manage/types";
import { cn } from "@/lib/utils";

type TopStudentsCardProps = {
  items?: CampusLeaderboardItem[];
  isLoading?: boolean;
  campusName?: string;
};

const RANK_COLORS = ["#f59e0b", "#d1d5db", "#b45309"] as const;

const LEVEL_COLORS: Record<string, string> = {
  "1": "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  "2": "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  "3": "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  "4": "bg-amber-500/15 text-amber-600 dark:text-amber-400",
};

function levelStyle(level: string) {
  const num = level.replace(/\D/g, "");
  return LEVEL_COLORS[num] ?? "bg-muted text-muted-foreground";
}

export function TopStudentsCard({ items = [], isLoading, campusName }: TopStudentsCardProps) {
  const visible = items.slice(0, 8);
  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex-row items-center gap-2.5 px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10">
          <Star className="size-4 text-amber-500" />
        </div>
        <CardTitle className="text-base font-bold text-foreground">
          Top Students{campusName ? ` — ${campusName}` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 flex-1 rounded" />
                <Skeleton className="h-5 w-12 rounded-full" />
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 text-left w-8">#</th>
                <th className="pb-2 text-left">Name</th>
                <th className="pb-2 text-center">Level</th>
                <th className="pb-2 text-right">Karma</th>
                <th className="pb-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">No data available.</td>
                </tr>
              ) : visible.map((student, idx) => {
                const rankColor = idx < 3 ? RANK_COLORS[idx] : "#6b7280";
                const status = student.alumni ? "alumni" : "active";
                const statusStyle = student.alumni
                  ? "bg-muted text-muted-foreground"
                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";
                return (
                  <tr key={student.id} className="border-b border-border last:border-b-0">
                    <td className="py-3 text-sm font-bold" style={{ color: rankColor }}>
                      {idx + 1}
                    </td>
                    <td className="py-3 font-medium text-foreground">{student.name}</td>
                    <td className="py-3 text-center">
                      <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", levelStyle(student.level))}>
                        Lv {student.level}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-amber-500">
                      {student.karma.toLocaleString()}
                    </td>
                    <td className="py-3 text-right">
                      <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", statusStyle)}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: exit 0

---

## Task 7: Recent Campus Activity Card

**Files:**
- Create: `src/features/home/components/campus/recent-activity-card.tsx`

Timestamped feed of typed events. Uses mock data. Each row: colored icon for type, event text, time-ago right-aligned.

- [ ] **Step 1: Create the component**

```tsx
import { CheckCircle2, CirclePlus, UserPlus, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_RECENT_ACTIVITY } from "../../constants/mock-campus";
import type { ActivityType } from "../../constants/mock-campus";

const TYPE_META: Record<ActivityType, { icon: typeof CheckCircle2; color: string }> = {
  level_up:       { icon: CheckCircle2, color: "#10b981" },
  circle_created: { icon: CirclePlus,   color: "#6366f1" },
  member_joined:  { icon: UserPlus,     color: "#3b82f6" },
  karma_voucher:  { icon: Zap,          color: "#f59e0b" },
};

export function RecentActivityCard() {
  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex-row items-center gap-2.5 px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/10">
          <Zap className="size-4 text-indigo-500" />
        </div>
        <CardTitle className="text-base font-bold text-foreground">Recent Campus Activity</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        <div className="space-y-0">
          {MOCK_RECENT_ACTIVITY.map(item => {
            const meta = TYPE_META[item.type];
            const Icon = meta.icon;
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 border-b border-border py-3 last:border-b-0"
              >
                <Icon className="mt-0.5 size-4 shrink-0" style={{ color: meta.color }} />
                <p className="flex-1 text-sm text-foreground">{item.text}</p>
                <span className="shrink-0 text-[11px] text-muted-foreground">{item.timeAgo}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: exit 0

---

## Task 8: Compose EnablerHome

**Files:**
- Rewrite: `src/features/home/components/enabler-home.tsx`

Wire all campus panels into the 3-row layout. Import hooks from `@/features/campus-manage/hooks`. Calendar is shared from `../event-calendar-card`.

```
Row 1: <CampusStatCards>                              (full width)
Row 2: [MemberFunnel | EventCalendar | CircleHealth]  (3-col grid, equal width)
Row 3: [TopStudents | RecentActivity]                 (2-col grid, 3fr/2fr)
```

- [ ] **Step 1: Rewrite `src/features/home/components/enabler-home.tsx`**

```tsx
"use client";

import {
  useCampusLeaderboard,
  useCampusOverview,
  useIgChapters,
} from "@/features/campus-manage/hooks";
import { useCalendarEvents } from "../hooks";
import { EventCalendarCard } from "./event-calendar-card";
import { CampusStatCards } from "./campus/campus-stat-cards";
import { MemberFunnelCard } from "./campus/member-funnel-card";
import { CircleHealthCard } from "./campus/circle-health-card";
import { TopStudentsCard } from "./campus/top-students-card";
import { RecentActivityCard } from "./campus/recent-activity-card";

export function EnablerHome() {
  const { data: overview, isLoading: loadingOverview } = useCampusOverview();
  const { data: leaderboardData, isLoading: loadingLeaderboard } = useCampusLeaderboard({
    page: 1,
    orgId: overview?.orgId,
  });
  const { data: igChapters, isLoading: loadingChapters } = useIgChapters();
  const { data: calendarEvents, isLoading: loadingCalendar } = useCalendarEvents();

  return (
    <div className="space-y-5">
      {/* Row 1: Stat cards */}
      <CampusStatCards overview={overview} isLoading={loadingOverview} />

      {/* Row 2: Funnel | Calendar | Circle Health */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <MemberFunnelCard overview={overview} isLoading={loadingOverview} />
        <EventCalendarCard events={calendarEvents} isLoading={loadingCalendar} />
        <CircleHealthCard igChapters={igChapters} isLoading={loadingChapters} />
      </div>

      {/* Row 3: Top Students | Recent Activity */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr]">
        <TopStudentsCard
          items={leaderboardData?.items}
          isLoading={loadingLeaderboard}
          campusName={overview?.collegeName}
        />
        <RecentActivityCard />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: exit 0

---

## Task 9: Wire EnablerHome into RBAC Switcher

**Files:**
- Modify: `src/features/home/components/home-page.tsx`
- Modify: `src/features/home/components/index.ts`

Replace `<RoleComingSoon role="Campus">` with `<EnablerHome />` in both the single-role and dual-role code paths.

- [ ] **Step 1: Update `home-page.tsx`**

Add the import at the top of the file:
```tsx
import { EnablerHome } from "./enabler-home";
```

In the `renderHome` function, replace both occurrences of `<RoleComingSoon role="Campus" />`:
```tsx
// Dual-role campus branch:
return dualView === "campus" ? <EnablerHome /> : <MuLearnerHome />;

// Single campus-role branch:
if (isCampusRole) return <EnablerHome />;
```

Full updated `renderHome`:
```tsx
const renderHome = () => {
  if (roles.includes(ROLES.MENTOR)) return <RoleComingSoon role="Mentor" />;
  if (roles.includes(ROLES.COMPANY)) return <RoleComingSoon role="Company" />;
  if (isDualRole) {
    return dualView === "campus" ? <EnablerHome /> : <MuLearnerHome />;
  }
  if (isCampusRole) return <EnablerHome />;
  return <MuLearnerHome />;
};
```

- [ ] **Step 2: Export from barrel `src/features/home/components/index.ts`**

Add at the end of the file:
```ts
export { EnablerHome } from "./enabler-home";
```

- [ ] **Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: exit 0

---

## Task 10: TypeScript Clean Check + Visual Smoke Test

**Files:**
- No changes — verification only

- [ ] **Step 1: Full TypeScript check**

Run: `npx tsc --noEmit`
Expected: exit 0, no errors

- [ ] **Step 2: Start dev server**

Run: `npm run dev`
Open: `http://localhost:3000/dashboard`

- [ ] **Step 3: Smoke test checklist**

Switch to Campus Lead view (via dual-role toggle if applicable, or log in as campus lead):
- [ ] Row 1: 4 stat cards render with numbers, labels, and green delta badges
- [ ] Row 2 left: Member Funnel shows 5 horizontal bars with labels and counts
- [ ] Row 2 middle: Calendar renders with white/card background (no violet gradient)
- [ ] Row 2 right: Circle Health shows 5 rows with `active`/`slow`/`inactive` chips
- [ ] Row 3 left: Top Students table has 5 columns with level pills and amber karma values
- [ ] Row 3 right: Recent Activity feed shows 6 rows with icons and time-ago
- [ ] Dark mode: toggle dark — cards have visible elevation (slightly lighter than background), text is legible throughout
- [ ] Light mode: layout matches student dashboard card style (white cards, consistent border radius)
- [ ] Responsive: on mobile, rows stack vertically; stats become 2×2 grid

---

## Self-Review

**Spec coverage:**
- ✅ 4 stat cards (Task 3) — Active Members, Campus Karma, Active Circles, Campus Rank
- ✅ Member Funnel (Task 4) — horizontal bars, 5 stages
- ✅ Event Calendar (Task 8) — reused shared component, replaces Pending Verifications
- ✅ Circle Health (Task 5) — 5 rows with status chips, sessions/month
- ✅ Top Students table (Task 6) — rank, name, level, karma, status
- ✅ Recent Activity (Task 7) — timestamped typed events
- ✅ Dark mode fix (Task 1) — card elevation + primary-foreground contrast
- ✅ RBAC wiring (Task 9) — EnablerHome renders for campus roles

**Missing from screenshot that was explicitly excluded:** Pending Verifications panel (user replaced with calendar — confirmed).

**Placeholder scan:** None. All components have concrete code.

**Type consistency:**
- `CampusOverview` imported from `@/features/campus-manage/types` — consistent across Tasks 3, 4, 8.
- `IgChapter` imported from `@/features/campus-manage/types` — used in Task 5 and Task 8.
- `CampusLeaderboardItem` from same types — used in Task 6 and Task 8.
- `ActivityType` / `CircleHealthStatus` / `FunnelStage` all defined in `mock-campus.ts` (Task 2) and imported by Tasks 5 and 7.
