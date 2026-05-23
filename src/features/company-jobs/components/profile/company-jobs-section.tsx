"use client";

/**
 * Company Jobs Section
 *
 * 📍 src/features/company-jobs/components/profile/company-jobs-section.tsx
 *
 * Renders open job listings on the company profile page.
 * - Own profile: real data from useJobs(), Edit/Manage CTAs
 * - Public view: accepts pre-fetched jobs or MOCK_PUBLIC_JOBS, Apply CTA
 */

import {
  BriefcaseBusiness,
  MapPin,
  Plus,
  Sparkles,
  Star,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PublicJobBySlug } from "../../schemas";
import type { Job } from "../../types";

// ─── Job type chip colours ────────────────────────────────────

const JOB_TYPE_STYLES: Record<string, string> = {
  "Full-Time": "bg-primary/15 text-primary",
  Internship: "bg-brand-purple/15 text-brand-purple",
  "Part-Time": "bg-brand-blue/15 text-brand-blue",
  Contract: "bg-warning/15 text-warning",
  Freelance: "bg-success/15 text-success",
};

// ─── Own-profile job card (real data) ─────────────────────────

function OwnJobCard({ job }: { job: Job }) {
  const chipStyle =
    JOB_TYPE_STYLES[job.job_type] ?? JOB_TYPE_STYLES["Full-Time"];

  return (
    <div className="group rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">
            {job.title}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="size-3" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Wallet className="size-3" />
              {job.salary_range}
            </span>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${chipStyle}`}
        >
          {job.job_type}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
          <Sparkles className="size-3" />
          Karma ≥ {job.min_karma}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
          <Star className="size-3" />
          Level ≥ {job.min_level}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {job.status}
        </span>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-7 rounded-full px-3 text-xs"
        >
          <Link href={`/dashboard/company/jobs/${job.id}`}>Manage →</Link>
        </Button>
      </div>
    </div>
  );
}

// ─── Public job card (mock or public API data) ─────────────────

function PublicJobCard({ job }: { job: PublicJobBySlug }) {
  const chipStyle =
    JOB_TYPE_STYLES[job.job_type ?? "Full-Time"] ??
    JOB_TYPE_STYLES["Full-Time"];
  const postedDaysAgo = Math.floor(
    (Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24),
  );
  const postedLabel =
    postedDaysAgo === 0
      ? "Today"
      : postedDaysAgo === 1
        ? "Yesterday"
        : `${postedDaysAgo}d ago`;

  return (
    <div className="group rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">
            {job.title}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="size-3" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Wallet className="size-3" />
              {job.salary_range}
            </span>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${chipStyle}`}
        >
          {job.job_type}
        </span>
      </div>

      {job.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="text-[11px] text-muted-foreground">{postedLabel}</span>
        <Button
          size="sm"
          className="h-7 rounded-full bg-primary px-3 text-xs text-primary-foreground hover:bg-primary/90"
        >
          Apply
        </Button>
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────

interface CompanyJobsSectionProps {
  /** Own profile: pass real jobs and isOwnProfile=true */
  isOwnProfile: boolean;
  ownJobs?: Job[];
  /** Public view: pass mock/public jobs and isOwnProfile=false */
  publicJobs?: PublicJobBySlug[];
}

export function CompanyJobsSection({
  isOwnProfile,
  ownJobs = [],
  publicJobs = [],
}: CompanyJobsSectionProps) {
  const activeOwnJobs = ownJobs.filter((j) => j.status === "Active");
  const hasJobs = isOwnProfile
    ? activeOwnJobs.length > 0
    : publicJobs.length > 0;

  return (
    <section id="company-jobs-section">
      <Card className="rounded-2xl border bg-card shadow-sm">
        <CardHeader className="flex-row items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
              <BriefcaseBusiness className="size-4 text-primary" />
            </div>
            <CardTitle className="text-base font-bold text-foreground">
              Open Roles
            </CardTitle>
          </div>
          {isOwnProfile && (
            <Link
              href="/dashboard/company/jobs/create"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="size-3.5" />
              Post New
            </Link>
          )}
        </CardHeader>

        <CardContent className="px-5 pb-5 pt-0">
          {!hasJobs ? (
            <div className="py-12 text-center">
              <BriefcaseBusiness className="mx-auto size-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">
                {isOwnProfile
                  ? "No active listings. Post your first job!"
                  : "No open roles right now. Check back soon."}
              </p>
              {isOwnProfile && (
                <Button
                  asChild
                  size="sm"
                  className="mt-4 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Link href="/dashboard/company/jobs/create">Post a Job</Link>
                </Button>
              )}
            </div>
          ) : isOwnProfile ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {activeOwnJobs.map((job) => (
                <OwnJobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {publicJobs.map((job) => (
                <PublicJobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
