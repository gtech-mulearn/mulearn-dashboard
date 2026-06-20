"use client";

import {
  BriefcaseBusiness,
  Building2,
  DollarSign,
  Lock,
  MapPin,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobs } from "@/features/company-jobs/hooks/use-jobs";
import type { Job } from "@/features/company-jobs/types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-success/15 text-success",
  Inactive: "bg-muted text-muted-foreground",
  Draft: "bg-warning/15 text-warning",
};

function JobRow({ job }: { job: Job }) {
  const statusStyle = STATUS_STYLES[job.status] ?? STATUS_STYLES.Draft;
  return (
    <div className="flex items-center justify-between border-b border-border py-3.5 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">
            {job.title}
          </p>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
              statusStyle,
            )}
          >
            {job.status.toLowerCase()}
          </span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <BriefcaseBusiness className="size-3" />
            {job.job_type}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="size-3" />
            {job.location}
          </span>
          {job.salary_range && (
            <span className="flex items-center gap-1">
              <DollarSign className="size-3" />
              {job.salary_range}
            </span>
          )}
        </div>
      </div>
      <div className="ml-4 shrink-0 text-right">
        <p className="text-lg font-bold text-foreground">0</p>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          applicants
        </p>
      </div>
    </div>
  );
}

export function ActiveJobListingsCard({
  isVerified = true,
}: {
  isVerified?: boolean;
}) {
  // JobsListParams does not support a status filter — filter client-side
  const { data, isLoading } = useJobs({ pageIndex: 1 });
  const jobs = (data?.jobs ?? []).filter((j) => j.status === "Active");

  return (
    <Card
      className={`rounded-2xl border bg-card shadow-sm relative ${!isVerified ? "opacity-70 pointer-events-none" : ""}`}
    >
      <CardHeader className="flex-row items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="size-4 text-primary" />
          </div>
          <CardTitle className="flex items-center gap-1.5 text-base font-bold text-foreground">
            {!isVerified && <Lock className="size-4" />}
            Active Job Listings
          </CardTitle>
        </div>
        {!isVerified ? (
          <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Locked
          </span>
        ) : (
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
        {!isVerified ? (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Available after company verification.
            </p>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {[0, 1, 2, 3].map((i) => (
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
            <p className="text-sm text-muted-foreground">
              No active jobs. Post your first job!
            </p>
          </div>
        ) : (
          <div>
            {jobs.slice(0, 6).map((job) => (
              <JobRow key={job.id} job={job} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
