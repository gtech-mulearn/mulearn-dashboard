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
        <div className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-background">
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
    </div>
  );
}
