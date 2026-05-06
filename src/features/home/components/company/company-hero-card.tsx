import { Plus, Users } from "lucide-react";
import Link from "next/link";
import {
  MOCK_COMPANY_QUICK_STATS,
  MOCK_TOTAL_LEARNERS,
} from "../../constants/mock-company";

export function CompanyHeroCard() {
  const stats = [
    MOCK_COMPANY_QUICK_STATS.jobsPosted,
    MOCK_COMPANY_QUICK_STATS.totalViews,
    MOCK_COMPANY_QUICK_STATS.applications,
    MOCK_COMPANY_QUICK_STATS.hired,
  ];

  return (
    <div className="flex flex-col gap-6 rounded-2xl bg-foreground p-6 md:flex-row md:items-center md:justify-between">
      {/* Left: pitch + CTAs */}
      <div className="space-y-4">
        <div className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
          Company Dashboard
        </div>
        <h1 className="text-3xl font-black leading-tight text-background">
          Find your next <span className="text-primary">hire.</span>
        </h1>
        <p className="max-w-sm text-sm text-background/60">
          Access{" "}
          <span className="font-semibold text-background">
            {MOCK_TOTAL_LEARNERS} verified learners
          </span>{" "}
          across Kerala. Post jobs with karma and level filters — reach talent
          that's actually ready.
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

      {/* Right: quick stats */}
      <div className="shrink-0 space-y-3 md:min-w-52">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-baseline justify-between gap-8"
          >
            <span className="text-sm text-background/60">{stat.label}</span>
            <span className="text-xl font-bold text-background">
              {stat.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
