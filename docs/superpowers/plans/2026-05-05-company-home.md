# Company Home Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Company home dashboard (`<CompanyHome>`) as a pixel-perfect replica of the screenshot, wiring real APIs for job listings and company verification status, using mock data for stats gaps (job views, applications, hired, talent pool).

**Architecture:** Feature-first under `src/features/home/` — new components in `components/company/`, mock constants in `constants/mock-company.ts`. `CompanyHome` replaces `<RoleComingSoon role="Company" />` in `home-page.tsx`. The verified banner reuses `useCompanyOnboardingStatus()` already in `features/auth/hooks`. Job listings use `useJobs()` from `features/company-jobs/hooks/use-jobs.ts`.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind 4, TanStack Query v5, shadcn `Card` / `Skeleton` / `Button`, Lucide React

---

## Layout Reference (Screenshot)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ● TechLaunch Ltd. is verified  You can post jobs …        Manage profile │  ← Verified banner (dark strip)
├───────────────────────────────────────────────────┬──────────────────────┤
│  COMPANY DASHBOARD (pill)                         │  Jobs Posted     5   │
│  Find your next hire.                             │  Total Views  2,840  │  ← Hero card
│  Access 14,200+ verified learners …               │  Applications   137  │
│  [+ Post a Job]  [Browse Talent]                  │  Hired            4  │
├────────────┬─────────────┬──────────────┬─────────┴──────────────────────┤
│ Job Views  │ Applications│ Talent Pool  │ Avg Karma                      │  ← 4 stat cards
│ 2,840      │ 137         │ 14,200+      │ 4.2k                           │
├─────────────────────────────────────────┬──────────────────────────────  ┤
│  Active Job Listings       [+ Post New] │  Talent Pool                   │  ← Bottom 2-col
│  (job rows: title/type/loc/salary/      │  Level distribution bar        │
│   status badge / applicant count)       │  Top interest groups list      │
└─────────────────────────────────────────┴────────────────────────────────┘
```

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/features/home/constants/mock-company.ts` | **Create** | All mock data — job stats, talent pool, top IGs |
| `src/features/home/components/company/company-verified-banner.tsx` | **Create** | Dark strip at top: company name + verified chip + "Manage profile" link |
| `src/features/home/components/company/company-hero-card.tsx` | **Create** | Dark hero: pitch + 2 CTAs (left) + 4 quick-stats (right) |
| `src/features/home/components/company/company-stat-cards.tsx` | **Create** | 4-up grid: Job Views, Applications, Talent Pool, Avg Karma |
| `src/features/home/components/company/active-job-listings-card.tsx` | **Create** | Job rows from real `useJobs()` + "Post New" CTA |
| `src/features/home/components/company/talent-pool-card.tsx` | **Create** | Level distribution segmented bar + Top IGs with karma bars |
| `src/features/home/components/company-home.tsx` | **Rewrite** | Compose all panels into final layout |
| `src/features/home/components/home-page.tsx` | **Modify** | Replace `<RoleComingSoon role="Company" />` with `<CompanyHome />` |
| `src/features/home/components/index.ts` | **Modify** | Export `CompanyHome` |

---

## Task 1: Mock Constants for Company Data Gaps

**Files:**
- Create: `src/features/home/constants/mock-company.ts`

Job views, applications count, hired count, talent pool stats, and level distribution have no backend endpoints yet. All mock in one file for easy deletion.

- [ ] **Step 1: Create `src/features/home/constants/mock-company.ts`**

```ts
// Mock company home data — delete when backend Issues #job-stats, #talent-pool land.

export const MOCK_COMPANY_QUICK_STATS = {
  jobsPosted:   { value: 5,     label: "Jobs Posted" },
  totalViews:   { value: 2840,  label: "Total Views" },
  applications: { value: 137,   label: "Applications" },
  hired:        { value: 4,     label: "Hired" },
} as const;

export const MOCK_COMPANY_STAT_CARDS = {
  jobViews:     { value: "2,840",   delta: "+340 this week",     deltaColor: "emerald" as const },
  applications: { value: "137",     delta: "+28 pending review", deltaColor: "emerald" as const },
  talentPool:   { value: "14,200+", delta: "Verified learners",  deltaColor: "blue" as const },
  avgKarma:     { value: "4.2k",    delta: "Pool median karma",  deltaColor: "blue" as const },
} as const;

export type LevelBarItem = { level: string; count: number; color: string };

export const MOCK_LEVEL_DISTRIBUTION: LevelBarItem[] = [
  { level: "L1", count: 4970, color: "#374151" },
  { level: "L2", count: 4260, color: "#6366f1" },
  { level: "L3", count: 2840, color: "#a855f7" },
  { level: "L4", count: 1420, color: "#f59e0b" },
  { level: "L5+", count: 710, color: "#10b981" },
];

export const MOCK_LEVEL_DISTRIBUTION_TOTAL = 14200;

export type TopIGItem = { id: string; name: string; karma: number; color: string };

export const MOCK_TOP_INTEREST_GROUPS: TopIGItem[] = [
  { id: "1", name: "Web Development",  karma: 3800, color: "#6366f1" },
  { id: "2", name: "UI/UX Design",     karma: 2100, color: "#a855f7" },
  { id: "3", name: "Cloud & DevOps",   karma: 1900, color: "#10b981" },
  { id: "4", name: "AI/ML",            karma: 1600, color: "#f59e0b" },
];

export const MOCK_TOP_IG_MAX_KARMA = 3800;

export const MOCK_VERIFIED_COMPANY_NAME = "TechLaunch Ltd.";
export const MOCK_TOTAL_LEARNERS = "14,200+";
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: exit 0

---

## Task 2: Company Verified Banner

**Files:**
- Create: `src/features/home/components/company/company-verified-banner.tsx`

Dark purple/indigo strip at the very top of the company home. Shows: ✓ verified badge + company name + subtitle text + "Manage profile" link on the right.

- [ ] **Step 1: Create the component**

```tsx
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { CompanyOnboardingStatus } from "@/features/auth/schemas";

type CompanyVerifiedBannerProps = {
  status?: CompanyOnboardingStatus;
  companyName?: string;
};

export function CompanyVerifiedBanner({ status, companyName }: CompanyVerifiedBannerProps) {
  const isVerified = status?.verified === true || status?.is_verified === true || status?.status === "approved";
  if (!isVerified) return null;

  const name = companyName ?? "Your Company";

  return (
    <div className="flex items-center justify-between rounded-2xl bg-indigo-950 px-5 py-3 dark:bg-indigo-950/80">
      <div className="flex items-center gap-2.5">
        <CheckCircle2 className="size-4 text-indigo-400" />
        <span className="text-sm font-semibold text-indigo-100">
          {name} <span className="text-indigo-300">is verified</span>
        </span>
        <span className="text-sm text-indigo-400">
          You can post jobs and access the talent pool.
        </span>
      </div>
      <Link
        href="/dashboard/company/profile"
        className="text-sm font-medium text-indigo-200 transition-colors hover:text-white"
      >
        Manage profile
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: exit 0

---

## Task 3: Company Hero Card

**Files:**
- Create: `src/features/home/components/company/company-hero-card.tsx`

Dark card split into left (pitch + CTAs) and right (quick-stats list). Uses mock quick-stats. CTAs: "Post a Job" → `/dashboard/company/jobs/create`, "Browse Talent" → `/dashboard/talent-pool`.

- [ ] **Step 1: Create the component**

```tsx
import { Plus, Users } from "lucide-react";
import Link from "next/link";
import { MOCK_COMPANY_QUICK_STATS, MOCK_TOTAL_LEARNERS } from "../../constants/mock-company";

export function CompanyHeroCard() {
  const stats = [
    MOCK_COMPANY_QUICK_STATS.jobsPosted,
    MOCK_COMPANY_QUICK_STATS.totalViews,
    MOCK_COMPANY_QUICK_STATS.applications,
    MOCK_COMPANY_QUICK_STATS.hired,
  ];

  return (
    <div className="flex flex-col gap-6 rounded-2xl bg-zinc-900 p-6 dark:bg-zinc-900 md:flex-row md:items-center md:justify-between">
      {/* Left: pitch + CTAs */}
      <div className="space-y-4">
        <div className="inline-flex items-center rounded-full bg-indigo-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-indigo-400">
          Company Dashboard
        </div>
        <h1 className="text-3xl font-black leading-tight text-white">
          Find your next{" "}
          <span className="text-indigo-400">hire.</span>
        </h1>
        <p className="max-w-sm text-sm text-zinc-400">
          Access <span className="font-semibold text-white">{MOCK_TOTAL_LEARNERS} verified learners</span> across
          Kerala. Post jobs with karma and level filters — reach talent that's actually ready.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/company/jobs/create"
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
          >
            <Plus className="size-4" />
            Post a Job
          </Link>
          <Link
            href="/dashboard/talent-pool"
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-600 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:border-zinc-400 hover:text-white"
          >
            <Users className="size-4" />
            Browse Talent
          </Link>
        </div>
      </div>

      {/* Right: quick stats */}
      <div className="shrink-0 space-y-3 md:min-w-52">
        {stats.map(stat => (
          <div key={stat.label} className="flex items-baseline justify-between gap-8">
            <span className="text-sm text-zinc-400">{stat.label}</span>
            <span className="text-xl font-bold text-white">{stat.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: exit 0

---

## Task 4: Company Stat Cards

**Files:**
- Create: `src/features/home/components/company/company-stat-cards.tsx`

4-up grid matching the screenshot: Job Views (eye icon/indigo), Applications (users icon/purple), Talent Pool (globe icon/emerald), Avg Karma (award icon/amber). Delta badges use two color variants — emerald for growth metrics, blue for informational labels.

- [ ] **Step 1: Create the component**

```tsx
import { Award, Eye, Globe, Users } from "lucide-react";
import { MOCK_COMPANY_STAT_CARDS } from "../../constants/mock-company";

const CARDS = [
  {
    key: "jobViews" as const,
    label: "JOB VIEWS",
    icon: Eye,
    iconColor: "#6366f1",
    iconBg: "bg-indigo-500/10",
  },
  {
    key: "applications" as const,
    label: "APPLICATIONS",
    icon: Users,
    iconColor: "#a855f7",
    iconBg: "bg-purple-500/10",
  },
  {
    key: "talentPool" as const,
    label: "TALENT POOL",
    icon: Globe,
    iconColor: "#10b981",
    iconBg: "bg-emerald-500/10",
  },
  {
    key: "avgKarma" as const,
    label: "AVG KARMA",
    icon: Award,
    iconColor: "#f59e0b",
    iconBg: "bg-amber-500/10",
  },
] as const;

const DELTA_STYLES = {
  emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  blue:    "bg-blue-500/15 text-blue-600 dark:text-blue-400",
} as const;

export function CompanyStatCards() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {CARDS.map(card => {
        const Icon = card.icon;
        const data = MOCK_COMPANY_STAT_CARDS[card.key];
        return (
          <div key={card.key} className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className={`mb-3 flex size-10 items-center justify-center rounded-xl ${card.iconBg}`}>
              <Icon className="size-5" style={{ color: card.iconColor }} />
            </div>
            <p className="text-3xl font-bold tracking-tight text-foreground">{data.value}</p>
            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {card.label}
            </p>
            <p className={`mt-2.5 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${DELTA_STYLES[data.deltaColor]}`}>
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

## Task 5: Active Job Listings Card

**Files:**
- Create: `src/features/home/components/company/active-job-listings-card.tsx`

Uses real `useJobs()` from `@/features/company-jobs/hooks`. Renders job rows: title + status badge (left), job type + location + salary (meta row), applicant count (right, mock 0 until backend supports it). "+ Post New" button top right.

- [ ] **Step 1: Create the component**

```tsx
import { BriefcaseBusiness, Building2, DollarSign, MapPin, Plus } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobs } from "@/features/company-jobs/hooks/use-jobs";
import { cn } from "@/lib/utils";
import type { Job } from "@/features/company-jobs/types";

const STATUS_STYLES: Record<string, string> = {
  Active:   "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Inactive: "bg-muted text-muted-foreground",
  Draft:    "bg-amber-500/15 text-amber-600 dark:text-amber-400",
};

function JobRow({ job }: { job: Job }) {
  const statusStyle = STATUS_STYLES[job.status] ?? STATUS_STYLES.Draft;
  return (
    <div className="flex items-center justify-between border-b border-border py-3.5 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{job.title}</p>
          <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold", statusStyle)}>
            {job.status.toLowerCase()}
          </span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <BriefcaseBusiness className="size-3" />{job.job_type}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="size-3" />{job.location}
          </span>
          {job.salary_range && (
            <span className="flex items-center gap-1">
              <DollarSign className="size-3" />{job.salary_range}
            </span>
          )}
        </div>
      </div>
      <div className="ml-4 shrink-0 text-right">
        <p className="text-lg font-bold text-foreground">0</p>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">applicants</p>
      </div>
    </div>
  );
}

export function ActiveJobListingsCard() {
  const { data, isLoading } = useJobs({ page: 1, status: "Active" });
  const jobs = data?.jobs ?? [];

  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex-row items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/10">
            <Building2 className="size-4 text-indigo-500" />
          </div>
          <CardTitle className="text-base font-bold text-foreground">Active Job Listings</CardTitle>
        </div>
        <Link
          href="/dashboard/company/jobs/create"
          className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-600"
        >
          <Plus className="size-3.5" />
          Post New
        </Link>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        {isLoading ? (
          <div className="space-y-4">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between py-1">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-48 rounded" />
                  <Skeleton className="h-3 w-64 rounded" />
                </div>
                <Skeleton className="h-8 w-12 rounded" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground">No active jobs. Post your first job!</p>
          </div>
        ) : (
          <div>
            {jobs.slice(0, 6).map(job => <JobRow key={job.id} job={job} />)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Check what params `useJobs` accepts**

Read `src/features/company-jobs/types/jobs.types.ts` to confirm the `JobsListParams` type has a `status` field. If it does not, call `useJobs()` with no params and filter client-side:

```tsx
const jobs = (data?.jobs ?? []).filter(j => j.status === "Active");
```

- [ ] **Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: exit 0

---

## Task 6: Talent Pool Card

**Files:**
- Create: `src/features/home/components/company/talent-pool-card.tsx`

Right sidebar card showing: "14,200+ verified learners" label, segmented level distribution bar (L1–L5+ as colored horizontal blocks), Top Interest Groups list (name + karma bar + value).

- [ ] **Step 1: Create the component**

```tsx
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MOCK_LEVEL_DISTRIBUTION,
  MOCK_LEVEL_DISTRIBUTION_TOTAL,
  MOCK_TOP_INTEREST_GROUPS,
  MOCK_TOP_IG_MAX_KARMA,
  MOCK_TOTAL_LEARNERS,
} from "../../constants/mock-company";

function formatKarma(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function TalentPoolCard() {
  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex-row items-center gap-2.5 px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10">
          <Users className="size-4 text-emerald-500" />
        </div>
        <CardTitle className="text-base font-bold text-foreground">Talent Pool</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        <p className="mb-3 text-xs text-muted-foreground">
          {MOCK_TOTAL_LEARNERS} verified learners
        </p>

        {/* Level distribution segmented bar */}
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Level Distribution
        </p>
        <div className="mb-2 flex h-7 overflow-hidden rounded-lg">
          {MOCK_LEVEL_DISTRIBUTION.map(item => {
            const pct = (item.count / MOCK_LEVEL_DISTRIBUTION_TOTAL) * 100;
            return (
              <div
                key={item.level}
                className="flex items-center justify-center text-[10px] font-bold text-white"
                style={{ width: `${pct}%`, backgroundColor: item.color }}
                title={`${item.level}: ${item.count.toLocaleString()}`}
              >
                {pct > 8 ? item.level : ""}
              </div>
            );
          })}
        </div>
        <div className="mb-5 flex flex-wrap gap-2">
          {MOCK_LEVEL_DISTRIBUTION.map(item => (
            <span key={item.level} className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="inline-block size-2 rounded-sm" style={{ backgroundColor: item.color }} />
              {item.level} : {item.count.toLocaleString()}
            </span>
          ))}
        </div>

        {/* Top interest groups */}
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Top Interest Groups
        </p>
        <div className="space-y-3">
          {MOCK_TOP_INTEREST_GROUPS.map(ig => {
            const pct = (ig.karma / MOCK_TOP_IG_MAX_KARMA) * 100;
            return (
              <div key={ig.id} className="flex items-center gap-3">
                <span className="w-32 shrink-0 truncate text-xs font-medium text-foreground">{ig.name}</span>
                <div className="flex-1 overflow-hidden rounded-full bg-muted h-2">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: ig.color }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-xs font-semibold text-muted-foreground">
                  {formatKarma(ig.karma)}
                </span>
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

## Task 7: Compose CompanyHome

**Files:**
- Rewrite: `src/features/home/components/company-home.tsx`

Wire all panels into the final layout.

- [ ] **Step 1: Rewrite `src/features/home/components/company-home.tsx`**

```tsx
"use client";

import { useUserInfo } from "@/features/auth/hooks/use-session";
import { useCompanyOnboardingStatus } from "@/features/auth/hooks";
import { ROLES } from "@/lib/auth";
import { CompanyVerifiedBanner } from "./company/company-verified-banner";
import { CompanyHeroCard } from "./company/company-hero-card";
import { CompanyStatCards } from "./company/company-stat-cards";
import { ActiveJobListingsCard } from "./company/active-job-listings-card";
import { TalentPoolCard } from "./company/talent-pool-card";

export function CompanyHome() {
  const { data: userInfo } = useUserInfo();
  const isCompany = userInfo?.roles?.includes(ROLES.COMPANY) ?? false;
  const { data: companyStatus } = useCompanyOnboardingStatus(isCompany);

  return (
    <div className="space-y-5">
      {/* Verified banner — only shown when company is approved */}
      <CompanyVerifiedBanner status={companyStatus} />

      {/* Hero */}
      <CompanyHeroCard />

      {/* 4 stat cards */}
      <CompanyStatCards />

      {/* Bottom: Job listings | Talent pool */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_296px]">
        <ActiveJobListingsCard />
        <TalentPoolCard />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: exit 0

---

## Task 8: Wire CompanyHome into RBAC + Export

**Files:**
- Modify: `src/features/home/components/home-page.tsx`
- Modify: `src/features/home/components/index.ts`

- [ ] **Step 1: Add import and replace RoleComingSoon in `home-page.tsx`**

Add import:
```tsx
import { CompanyHome } from "./company-home";
```

Update `renderHome`:
```tsx
const renderHome = () => {
  if (roles.includes(ROLES.MENTOR)) return <RoleComingSoon role="Mentor" />;
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
export { CompanyHome } from "./company-home";
```

- [ ] **Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: exit 0

---

## Task 9: TypeScript Clean Check

- [ ] **Step 1: Full clean check**

Run: `npx tsc --noEmit`
Expected: exit 0, no errors

- [ ] **Step 2: Smoke test checklist**

Open `http://localhost:3000/dashboard` as a Company user:
- [ ] Verified banner renders (dark indigo strip) when company is approved
- [ ] Hero: dark card with "Find your next hire." headline, indigo "hire." text, 2 CTAs, quick-stats list
- [ ] 4 stat cards: Job Views (indigo), Applications (purple), Talent Pool (emerald), Avg Karma (amber)
- [ ] Job listings: rows render from real API or empty state; "+ Post New" button navigates to create
- [ ] Talent pool: segmented bar renders; Top IGs list with karma bars
- [ ] Responsive: stat cards 2×2 on mobile, 4-col on lg; bottom row stacks on mobile

---

## Self-Review

**Spec coverage from FEATURE_AUDIT.md §3.7:**
- ✅ §3.7.1 Verified company banner — `CompanyVerifiedBanner` (Task 2)
- ✅ §3.7.2 Hero with pitch + CTAs — `CompanyHeroCard` (Task 3)
- ✅ §3.7.3 Quick-stats (Jobs Posted, Views, Applications, Hired) — mock in hero right side (Task 3)
- ✅ §3.7.4 Four stat cards — `CompanyStatCards` (Task 4)
- ✅ §3.7.5 Active Job Listings — `ActiveJobListingsCard` (Task 5), real API
- ✅ §3.7.6 Talent Pool panel — `TalentPoolCard` (Task 6), mock
- ✅ RBAC wiring (Task 8)

**Mock data to delete when APIs land:**
- `MOCK_COMPANY_QUICK_STATS` — replace with `dashboard/company/stats/`
- `MOCK_COMPANY_STAT_CARDS` — replace with same
- `MOCK_LEVEL_DISTRIBUTION` — replace with `dashboard/company/talent-pool/`
- `MOCK_TOP_INTEREST_GROUPS` — replace with same

**Placeholder scan:** None — all components have complete code.
