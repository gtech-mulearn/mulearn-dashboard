# Mentor Home Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Mentor home dashboard (`<MentorHome>`) — all data is mock since the entire mentor backend is missing (§3.2 of FEATURE_AUDIT.md confirms zero session/mentee endpoints). The UI follows the same design system as the student and campus dashboards (consistent card style, same Tailwind tokens, light/dark mode support).

**Architecture:** Feature-first under `src/features/home/` — components in `components/mentor/`, all mock in `constants/mock-mentor.ts`. `MentorHome` replaces `<RoleComingSoon role="Mentor" />` in `home-page.tsx`. Every mock constant is in one deletable file — when backend Issues for mentor sessions/mentees land, swap mock data for real TanStack Query hooks.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind 4, TanStack Query v5, shadcn `Card` / `Skeleton` / `Progress` / `Switch` / `Badge`, Lucide React

---

## Layout (Designed from §3.2 Feature Audit — no reference screenshot provided)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ✓ Verified Mentor   Good morning, {name}   Next session: tomorrow 4PM  │  ← Hero card
├──────────────┬─────────────────┬────────────────┬────────────────────────┤
│ Active       │ Hours           │ Avg Rating     │ Completion Rate        │  ← 4 stat cards
│ Mentees: 12  │ Mentored: 48h   │ ★ 4.8          │ 92%                    │
├──────────────────────────────┬─────────────────────────────────────────  ┤
│  Upcoming Sessions           │  Session Requests                          │  ← Row 2: 2-col
│  (list with status chips)    │  (pending requests, accept/reject)         │
├──────────────────────────────┴─────────────────────────────────────────  ┤
│  Mentee Progress             │  Availability + Expertise                  │  ← Row 3: 2-col
│  (per-mentee progress bars)  │  (toggle + tag cloud)                      │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/features/home/constants/mock-mentor.ts` | **Create** | All mock data — sessions, mentees, requests, expertise tags |
| `src/features/home/components/mentor/mentor-hero-card.tsx` | **Create** | Verified badge + greeting + next session line |
| `src/features/home/components/mentor/mentor-stat-cards.tsx` | **Create** | 4 stat cards: Active Mentees, Hours Mentored, Avg Rating, Completion Rate |
| `src/features/home/components/mentor/upcoming-sessions-card.tsx` | **Create** | Session list rows with status chips (confirmed/pending/cancelled) |
| `src/features/home/components/mentor/session-requests-card.tsx` | **Create** | Pending request rows with accept/reject buttons |
| `src/features/home/components/mentor/mentee-progress-card.tsx` | **Create** | Per-mentee name + level + karma progress bar |
| `src/features/home/components/mentor/availability-card.tsx` | **Create** | Availability toggle (local state, mock) + expertise tag cloud |
| `src/features/home/components/mentor-home.tsx` | **Rewrite** | Compose all mentor panels |
| `src/features/home/components/home-page.tsx` | **Modify** | Replace `<RoleComingSoon role="Mentor" />` with `<MentorHome />` |
| `src/features/home/components/index.ts` | **Modify** | Export `MentorHome` |

---

## Task 1: Mock Constants for Mentor Data

**Files:**
- Create: `src/features/home/constants/mock-mentor.ts`

The entire mentor backend is missing (§3.2). All data is mock until `dashboard/mentor/*` endpoints land.

- [ ] **Step 1: Create `src/features/home/constants/mock-mentor.ts`**

```ts
// Mock mentor home data — delete when dashboard/mentor/* backend Issues land.

export const MOCK_MENTOR_STAT_DELTAS = {
  activeMentees:    { value: 12, delta: "+2 this month" },
  hoursMentored:    { value: "48h", delta: "+6h this week" },
  avgRating:        { value: "4.8", delta: "★ out of 5.0" },
  completionRate:   { value: "92%", delta: "+4% vs last month" },
} as const;

export type SessionStatus = "confirmed" | "pending" | "cancelled";

export type UpcomingSession = {
  id: string;
  menteeName: string;
  menteeInitials: string;
  avatarColor: string;
  topic: string;
  dateLabel: string;
  timeLabel: string;
  status: SessionStatus;
};

export const MOCK_UPCOMING_SESSIONS: UpcomingSession[] = [
  { id: "1", menteeName: "Arjun Joshi",   menteeInitials: "AJ", avatarColor: "#6366f1", topic: "Career roadmap",         dateLabel: "Tomorrow",    timeLabel: "4:00 PM",  status: "confirmed" },
  { id: "2", menteeName: "Meera K.",      menteeInitials: "MK", avatarColor: "#10b981", topic: "Resume review",          dateLabel: "May 8",       timeLabel: "6:30 PM",  status: "confirmed" },
  { id: "3", menteeName: "Rohan P.",      menteeInitials: "RP", avatarColor: "#f59e0b", topic: "Interview prep",         dateLabel: "May 10",      timeLabel: "5:00 PM",  status: "pending"   },
  { id: "4", menteeName: "Divya Menon",   menteeInitials: "DM", avatarColor: "#a855f7", topic: "Open source contribution",dateLabel: "May 12",     timeLabel: "7:00 PM",  status: "confirmed" },
];

export type SessionRequest = {
  id: string;
  menteeName: string;
  menteeInitials: string;
  avatarColor: string;
  muid: string;
  topic: string;
  timeAgo: string;
};

export const MOCK_SESSION_REQUESTS: SessionRequest[] = [
  { id: "r1", menteeName: "Nisha M.",    menteeInitials: "NM", avatarColor: "#ec4899", muid: "nisha@24",  topic: "Frontend career path",   timeAgo: "2h ago"  },
  { id: "r2", menteeName: "Abin Jose",   menteeInitials: "AJ", avatarColor: "#3b82f6", muid: "abin@23",  topic: "Python & ML basics",      timeAgo: "5h ago"  },
  { id: "r3", menteeName: "Swathi R.",   menteeInitials: "SR", avatarColor: "#06b6d4", muid: "swathi@24",topic: "Open source contribution", timeAgo: "1d ago"  },
];

export type MenteeProgress = {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  level: string;
  karmaEarned: number;
  karmaTarget: number;
};

export const MOCK_MENTEE_PROGRESS: MenteeProgress[] = [
  { id: "m1", name: "Arjun Joshi",  initials: "AJ", avatarColor: "#6366f1", level: "L2", karmaEarned: 3200, karmaTarget: 5000 },
  { id: "m2", name: "Meera K.",     initials: "MK", avatarColor: "#10b981", level: "L3", karmaEarned: 6800, karmaTarget: 8000 },
  { id: "m3", name: "Rohan P.",     initials: "RP", avatarColor: "#f59e0b", level: "L2", karmaEarned: 2900, karmaTarget: 5000 },
  { id: "m4", name: "Divya Menon",  initials: "DM", avatarColor: "#a855f7", level: "L1", karmaEarned: 1200, karmaTarget: 2000 },
  { id: "m5", name: "Nisha M.",     initials: "NM", avatarColor: "#ec4899", level: "L1", karmaEarned:  800, karmaTarget: 2000 },
];

export const MOCK_EXPERTISE_TAGS = [
  "React", "TypeScript", "Node.js", "System Design",
  "Career Planning", "Open Source", "Python", "Interview Prep",
] as const;

export const MOCK_MENTOR_NEXT_SESSION = { name: "Arjun Joshi", dateLabel: "tomorrow at 4:00 PM" } as const;
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: exit 0

---

## Task 2: Mentor Hero Card

**Files:**
- Create: `src/features/home/components/mentor/mentor-hero-card.tsx`

Shows: ✓ Verified Mentor green badge (top left), greeting with mentor's name, next session reminder line. Uses `useUserInfo()` for the name.

- [ ] **Step 1: Create the component**

```tsx
import { CheckCircle2, Calendar } from "lucide-react";
import { useUserInfo } from "@/features/auth/hooks/use-session";
import { MOCK_MENTOR_NEXT_SESSION } from "../../constants/mock-mentor";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function MentorHeroCard() {
  const { data: userInfo } = useUserInfo();
  const firstName = userInfo?.full_name?.split(" ")[0] ?? "Mentor";

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          {/* Verified badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-3.5" />
            Verified Mentor
          </div>
          {/* Greeting */}
          <h2 className="text-2xl font-bold text-foreground">
            {getGreeting()},{" "}
            <span className="text-primary">{firstName}.</span>
          </h2>
          {/* Next session */}
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="size-4 text-muted-foreground" />
            Next session with{" "}
            <span className="font-medium text-foreground">{MOCK_MENTOR_NEXT_SESSION.name}</span>
            {" — "}
            {MOCK_MENTOR_NEXT_SESSION.dateLabel}
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: exit 0

---

## Task 3: Mentor Stat Cards

**Files:**
- Create: `src/features/home/components/mentor/mentor-stat-cards.tsx`

4-up grid: Active Mentees (users/indigo), Hours Mentored (clock/emerald), Avg Rating (star/amber), Completion Rate (check/purple). All mock data.

- [ ] **Step 1: Create the component**

```tsx
import { CheckCircle2, Clock, Star, Users } from "lucide-react";
import { MOCK_MENTOR_STAT_DELTAS } from "../../constants/mock-mentor";

const CARDS = [
  {
    key: "activeMentees" as const,
    label: "ACTIVE MENTEES",
    icon: Users,
    iconColor: "#6366f1",
    iconBg: "bg-indigo-500/10",
  },
  {
    key: "hoursMentored" as const,
    label: "HOURS MENTORED",
    icon: Clock,
    iconColor: "#10b981",
    iconBg: "bg-emerald-500/10",
  },
  {
    key: "avgRating" as const,
    label: "AVG RATING",
    icon: Star,
    iconColor: "#f59e0b",
    iconBg: "bg-amber-500/10",
  },
  {
    key: "completionRate" as const,
    label: "COMPLETION RATE",
    icon: CheckCircle2,
    iconColor: "#a855f7",
    iconBg: "bg-purple-500/10",
  },
] as const;

export function MentorStatCards() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {CARDS.map(card => {
        const Icon = card.icon;
        const data = MOCK_MENTOR_STAT_DELTAS[card.key];
        return (
          <div key={card.key} className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className={`mb-3 flex size-10 items-center justify-center rounded-xl ${card.iconBg}`}>
              <Icon className="size-5" style={{ color: card.iconColor }} />
            </div>
            <p className="text-3xl font-bold tracking-tight text-foreground">{data.value}</p>
            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-2.5 inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {data.delta}
            </p>
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

## Task 4: Upcoming Sessions Card

**Files:**
- Create: `src/features/home/components/mentor/upcoming-sessions-card.tsx`

List of upcoming sessions with: initials avatar, mentee name + topic, date/time, status chip (confirmed/pending/cancelled).

- [ ] **Step 1: Create the component**

```tsx
import { CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_UPCOMING_SESSIONS } from "../../constants/mock-mentor";
import type { SessionStatus } from "../../constants/mock-mentor";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<SessionStatus, string> = {
  confirmed:  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  pending:    "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  cancelled:  "bg-red-500/15 text-red-600 dark:text-red-400",
};

export function UpcomingSessionsCard() {
  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex-row items-center gap-2.5 px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/10">
          <CalendarClock className="size-4 text-indigo-500" />
        </div>
        <CardTitle className="text-base font-bold text-foreground">Upcoming Sessions</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        <div className="space-y-0">
          {MOCK_UPCOMING_SESSIONS.map(session => (
            <div
              key={session.id}
              className="flex items-center gap-3 border-b border-border py-3 last:border-b-0"
            >
              {/* Avatar */}
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: session.avatarColor }}
              >
                {session.menteeInitials}
              </div>
              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{session.menteeName}</p>
                <p className="truncate text-[11px] text-muted-foreground">{session.topic}</p>
              </div>
              {/* Date + status */}
              <div className="shrink-0 text-right">
                <p className="text-xs font-medium text-foreground">{session.dateLabel}</p>
                <p className="text-[11px] text-muted-foreground">{session.timeLabel}</p>
              </div>
              <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold", STATUS_STYLES[session.status])}>
                {session.status}
              </span>
            </div>
          ))}
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

## Task 5: Session Requests Card

**Files:**
- Create: `src/features/home/components/mentor/session-requests-card.tsx`

Pending session requests. Each row: avatar, name + muid, topic, time-ago, Accept / Decline buttons (local state only — no real mutation endpoint exists yet).

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { Check, Inbox, X } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_SESSION_REQUESTS } from "../../constants/mock-mentor";

export function SessionRequestsCard() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const visible = MOCK_SESSION_REQUESTS.filter(r => !dismissed.has(r.id));

  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex-row items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-purple-500/10">
            <Inbox className="size-4 text-purple-500" />
          </div>
          <CardTitle className="text-base font-bold text-foreground">Session Requests</CardTitle>
        </div>
        {visible.length > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {visible.length}
          </span>
        )}
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        {visible.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No pending requests.</p>
        ) : (
          <div className="space-y-0">
            {visible.map(req => (
              <div
                key={req.id}
                className="flex items-center gap-3 border-b border-border py-3 last:border-b-0"
              >
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: req.avatarColor }}
                >
                  {req.menteeInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{req.menteeName}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{req.muid} · {req.topic}</p>
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">{req.timeAgo}</span>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDismissed(prev => new Set([...prev, req.id]))}
                    className="flex size-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 transition-colors hover:bg-emerald-500/25 dark:text-emerald-400"
                    aria-label="Accept"
                  >
                    <Check className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDismissed(prev => new Set([...prev, req.id]))}
                    className="flex size-7 items-center justify-center rounded-full bg-red-500/15 text-red-600 transition-colors hover:bg-red-500/25 dark:text-red-400"
                    aria-label="Decline"
                  >
                    <X className="size-3.5" />
                  </button>
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

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: exit 0

---

## Task 6: Mentee Progress Card

**Files:**
- Create: `src/features/home/components/mentor/mentee-progress-card.tsx`

Per-mentee row: avatar initials, name + level badge, karma progress bar (earned / target), percentage text.

- [ ] **Step 1: Create the component**

```tsx
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_MENTEE_PROGRESS } from "../../constants/mock-mentor";

export function MenteeProgressCard() {
  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex-row items-center gap-2.5 px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10">
          <TrendingUp className="size-4 text-emerald-500" />
        </div>
        <CardTitle className="text-base font-bold text-foreground">Mentee Progress</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        <div className="space-y-4">
          {MOCK_MENTEE_PROGRESS.map(mentee => {
            const pct = Math.round((mentee.karmaEarned / mentee.karmaTarget) * 100);
            return (
              <div key={mentee.id} className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <div
                    className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: mentee.avatarColor }}
                  >
                    {mentee.initials}
                  </div>
                  <span className="flex-1 text-sm font-medium text-foreground">{mentee.name}</span>
                  <span className="rounded-md bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                    {mentee.level}
                  </span>
                  <span className="w-8 text-right text-xs font-semibold text-muted-foreground">{pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: mentee.avatarColor }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {mentee.karmaEarned.toLocaleString()} / {mentee.karmaTarget.toLocaleString()} karma
                </p>
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

## Task 7: Availability Card

**Files:**
- Create: `src/features/home/components/mentor/availability-card.tsx`

Toggle for "Available for mentoring" (local state — no backend yet) + expertise tags displayed as chips. Tag click toggles selection (visual only, mock).

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_EXPERTISE_TAGS } from "../../constants/mock-mentor";
import { cn } from "@/lib/utils";

export function AvailabilityCard() {
  const [available, setAvailable] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set(["React", "TypeScript", "Career Planning"]));

  function toggleTag(tag: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex-row items-center gap-2.5 px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10">
          <Sparkles className="size-4 text-amber-500" />
        </div>
        <CardTitle className="text-base font-bold text-foreground">Availability & Expertise</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0 space-y-5">
        {/* Availability toggle */}
        <div className="flex items-center justify-between rounded-xl border bg-muted/40 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Available for mentoring</p>
            <p className="text-[11px] text-muted-foreground">
              {available ? "Accepting new mentees" : "Not accepting requests"}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={available}
            onClick={() => setAvailable(v => !v)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
              available ? "bg-emerald-500" : "bg-muted-foreground/30",
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block size-5 rounded-full bg-white shadow-lg transition-transform",
                available ? "translate-x-5" : "translate-x-0",
              )}
            />
          </button>
        </div>

        {/* Expertise tags */}
        <div>
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Expertise
          </p>
          <div className="flex flex-wrap gap-2">
            {MOCK_EXPERTISE_TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  selected.has(tag)
                    ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                {tag}
              </button>
            ))}
          </div>
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

## Task 8: Compose MentorHome

**Files:**
- Rewrite: `src/features/home/components/mentor-home.tsx`

- [ ] **Step 1: Rewrite `src/features/home/components/mentor-home.tsx`**

```tsx
"use client";

import { MentorHeroCard } from "./mentor/mentor-hero-card";
import { MentorStatCards } from "./mentor/mentor-stat-cards";
import { UpcomingSessionsCard } from "./mentor/upcoming-sessions-card";
import { SessionRequestsCard } from "./mentor/session-requests-card";
import { MenteeProgressCard } from "./mentor/mentee-progress-card";
import { AvailabilityCard } from "./mentor/availability-card";

export function MentorHome() {
  return (
    <div className="space-y-5">
      {/* Row 1: Hero */}
      <MentorHeroCard />

      {/* Row 2: 4 stat cards */}
      <MentorStatCards />

      {/* Row 3: Upcoming Sessions | Session Requests */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <UpcomingSessionsCard />
        <SessionRequestsCard />
      </div>

      {/* Row 4: Mentee Progress | Availability + Expertise */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr]">
        <MenteeProgressCard />
        <AvailabilityCard />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: exit 0

---

## Task 9: Wire MentorHome into RBAC + Export

**Files:**
- Modify: `src/features/home/components/home-page.tsx`
- Modify: `src/features/home/components/index.ts`

- [ ] **Step 1: Update `home-page.tsx`**

Add import:
```tsx
import { MentorHome } from "./mentor-home";
```

Update `renderHome` to replace `<RoleComingSoon role="Mentor" />`:
```tsx
const renderHome = () => {
  if (roles.includes(ROLES.MENTOR)) return <MentorHome />;
  if (roles.includes(ROLES.COMPANY)) return <CompanyHome />;
  if (isDualRole) {
    return dualView === "campus" ? <EnablerHome /> : <MuLearnerHome />;
  }
  if (isCampusRole) return <EnablerHome />;
  return <MuLearnerHome />;
};
```

- [ ] **Step 2: Export from `src/features/home/components/index.ts`**

Add:
```ts
export { MentorHome } from "./mentor-home";
```

- [ ] **Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: exit 0

---

## Task 10: TypeScript Clean Check

- [ ] **Step 1: Full clean check**

Run: `npx tsc --noEmit`
Expected: exit 0, no errors

- [ ] **Step 2: Smoke test checklist**

Open `http://localhost:3000/dashboard` as a Mentor user:
- [ ] Hero: "Verified Mentor" green badge, greeting with name, next session reminder
- [ ] 4 stat cards: Active Mentees (indigo), Hours Mentored (emerald), Avg Rating (amber), Completion Rate (purple)
- [ ] Upcoming Sessions: 4 rows with avatars, status chips (confirmed/pending)
- [ ] Session Requests: 3 rows with accept/reject buttons; accept/reject removes row
- [ ] Mentee Progress: 5 rows each with progress bar filling proportionally
- [ ] Availability card: toggle switches between "Accepting" / "Not accepting"; expertise tags toggle highlight
- [ ] Dark mode: all cards have visible elevation, text readable
- [ ] Light mode: consistent with student and campus dashboard styles
- [ ] Responsive: stacks on mobile, 2-col grid on lg

---

## Self-Review

**Spec coverage from FEATURE_AUDIT.md §3.2:**
- ✅ §3.2.2 Verified Mentor badge + greeting + next-session line — `MentorHeroCard` (Task 2)
- ✅ §3.2.3 Stat cards (Active Mentees, Hours Mentored, Avg Rating, Completion Rate) — `MentorStatCards` (Task 3)
- ✅ §3.2.4 Upcoming Sessions with status chips — `UpcomingSessionsCard` (Task 4)
- ✅ §3.2.5 Mentee Progress panel with progress bars — `MenteeProgressCard` (Task 6)
- ✅ §3.2.6 Availability toggle + expertise tags — `AvailabilityCard` (Task 7)
- ✅ §3.2.7 Session Requests with accept/reject — `SessionRequestsCard` (Task 5)
- ✅ RBAC wiring (Task 9)

**All data is mock** — entire `src/features/home/constants/mock-mentor.ts` file is deleted when `dashboard/mentor/*` endpoints land.

**Placeholder scan:** None — all components have complete code.

**Type consistency:**
- `SessionStatus`, `UpcomingSession`, `SessionRequest`, `MenteeProgress` all defined in `mock-mentor.ts` (Task 1) and imported by Tasks 4, 5, 6.
- `MOCK_EXPERTISE_TAGS` is `readonly string[]` — `toggleTag(tag: string)` is compatible.
