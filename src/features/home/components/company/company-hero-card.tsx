import { CheckCircle2, Plus, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  jobsPosted: number;
  isLoading: boolean;
  isVerified?: boolean;
};

export function CompanyHeroCard({ jobsPosted, isLoading, isVerified }: Props) {
  return (
    <div className="flex flex-col gap-6 rounded-2xl bg-brand-blue p-6 md:flex-row md:items-center md:justify-between">
      <div className="space-y-4 w-full">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white">
            Company Dashboard
          </div>
          {isVerified && (
            <div className="flex items-center gap-1.5 text-white">
              <CheckCircle2 className="size-4" />
              <span className="text-sm font-medium">Verified Company</span>
            </div>
          )}
        </div>
        <h1 className="text-3xl font-black leading-tight text-white">
          Find your next hire.
        </h1>
        <p className="max-w-sm text-sm text-white/70">
          Post jobs with karma and level filters — reach talent that&apos;s
          actually ready.
        </p>

        {isVerified && (
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              className="border-transparent bg-white text-brand-blue shadow-sm hover:bg-white/90 hover:text-brand-blue"
            >
              <Link href="/dashboard/company/jobs/create">
                <Plus className="size-4" />
                Post a Job
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/50 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/dashboard/talent-pool">
                <Users className="size-4" />
                Browse Talent
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
