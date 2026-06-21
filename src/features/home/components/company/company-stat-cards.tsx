import { Briefcase, CheckCircle2, Lock, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import type { CompanyQuickStats } from "../../schemas/home.schema";

type Props = {
  quickStats?: CompanyQuickStats;
  isLoading: boolean;
  isVerified?: boolean;
};

export function CompanyStatCards({ quickStats, isLoading, isVerified }: Props) {
  const cards = [
    {
      key: "jobsPosted",
      label: "Jobs Posted",
      icon: Briefcase,
      accent: "chart-1" as const,
      value: quickStats?.jobs_posted.toString() ?? "—",
      description: "active listings",
    },
    {
      key: "applications",
      label: "Applications",
      icon: CheckCircle2,
      accent: "chart-2" as const,
      value: quickStats?.applications.toString() ?? "—",
      description: "total received",
    },
    {
      key: "hired",
      label: "Hired",
      icon: Users,
      accent: "chart-3" as const,
      value: quickStats?.hired.toString() ?? "—",
      description: "via muLearn",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        if (isLoading) {
          return (
            <div
              key={card.key}
              className="rounded-2xl border bg-card p-5 shadow-sm"
            >
              <Skeleton className="mb-1.5 h-8 w-16 rounded-md" />
              <Skeleton className="h-3.5 w-24 rounded-md" />
            </div>
          );
        }

        return (
          <div
            key={card.key}
            className={`relative ${!isVerified ? "pointer-events-none opacity-70" : ""}`}
          >
            {!isVerified && (
              <span className="absolute right-3 top-3 z-10 inline-flex items-center rounded-md bg-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Lock className="mr-1 size-3" />
                Locked
              </span>
            )}
            <StatCard
              title={card.label}
              value={!isVerified ? "—" : card.value}
              icon={<Icon className="size-5" />}
              accent={card.accent}
              description={
                !isVerified
                  ? "Available after company verification."
                  : card.description
              }
            />
          </div>
        );
      })}
    </div>
  );
}
