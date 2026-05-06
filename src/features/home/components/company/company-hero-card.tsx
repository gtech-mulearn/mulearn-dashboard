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
    <div className="flex flex-col gap-6 rounded-2xl bg-zinc-900 p-6 dark:bg-zinc-900 md:flex-row md:items-center md:justify-between">
      {/* Left: pitch + CTAs */}
      <div className="space-y-4">
        <div className="inline-flex items-center rounded-full bg-indigo-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-indigo-400">
          Company Dashboard
        </div>
        <h1 className="text-3xl font-black leading-tight text-white">
          Find your next <span className="text-indigo-400">hire.</span>
        </h1>
        <p className="max-w-sm text-sm text-zinc-400">
          Access{" "}
          <span className="font-semibold text-white">
            {MOCK_TOTAL_LEARNERS} verified learners
          </span>{" "}
          across Kerala. Post jobs with karma and level filters — reach talent
          that's actually ready.
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
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-baseline justify-between gap-8"
          >
            <span className="text-sm text-zinc-400">{stat.label}</span>
            <span className="text-xl font-bold text-white">
              {stat.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
