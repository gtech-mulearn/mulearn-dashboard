import { Briefcase, CheckCircle2, Lock, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
      label: "JOBS POSTED",
      icon: Briefcase,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      value: quickStats?.jobs_posted.toString() ?? "—",
      subLabel: "active listings",
    },
    {
      key: "applications",
      label: "APPLICATIONS",
      icon: CheckCircle2,
      iconColor: "text-success",
      iconBg: "bg-success/10",
      value: quickStats?.applications.toString() ?? "—",
      subLabel: "total received",
    },
    {
      key: "hired",
      label: "HIRED",
      icon: Users,
      iconColor: "text-brand-purple",
      iconBg: "bg-brand-purple/10",
      value: quickStats?.hired.toString() ?? "—",
      subLabel: "via muLearn",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className={`relative rounded-2xl border bg-card p-5 shadow-sm ${!isVerified ? "opacity-70 pointer-events-none" : ""}`}
          >
            <div className="flex items-start justify-between">
              <div
                className={`mb-3 flex size-10 items-center justify-center rounded-xl ${card.iconBg}`}
              >
                <Icon className={`size-5 ${card.iconColor}`} />
              </div>
              {!isVerified && (
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Locked
                </span>
              )}
            </div>

            {isLoading ? (
              <>
                <Skeleton className="mb-1.5 h-8 w-16 rounded-md" />
                <Skeleton className="h-3.5 w-24 rounded-md" />
              </>
            ) : (
              <>
                <p className="text-3xl font-bold tracking-tight text-foreground">
                  {!isVerified ? "—" : card.value}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {!isVerified && <Lock className="size-3" />}
                  {card.label}
                </p>
                <p className="mt-2.5 text-xs text-muted-foreground">
                  {!isVerified
                    ? "Available after company verification."
                    : card.subLabel}
                </p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
