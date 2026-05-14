import { Briefcase, Globe, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  jobsPosted: number;
  isLoading: boolean;
};

export function CompanyStatCards({ jobsPosted, isLoading }: Props) {
  const cards = [
    {
      key: "jobsPosted",
      label: "JOBS POSTED",
      icon: Briefcase,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      value: jobsPosted.toString(),
      subLabel: "active listings",
      isDynamic: true,
    },
    {
      key: "talentPool",
      label: "TALENT POOL",
      icon: Globe,
      iconColor: "text-success",
      iconBg: "bg-success/10",
      value: "MuLearn",
      subLabel: "verified learners",
      isDynamic: false,
    },
    {
      key: "network",
      label: "NETWORK",
      icon: Users,
      iconColor: "text-brand-purple",
      iconBg: "bg-brand-purple/10",
      value: "Kerala",
      subLabel: "region coverage",
      isDynamic: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="rounded-2xl border bg-card p-5 shadow-sm"
          >
            <div
              className={`mb-3 flex size-10 items-center justify-center rounded-xl ${card.iconBg}`}
            >
              <Icon className={`size-5 ${card.iconColor}`} />
            </div>
            {isLoading && card.isDynamic ? (
              <>
                <Skeleton className="mb-1.5 h-8 w-16 rounded-md" />
                <Skeleton className="h-3.5 w-24 rounded-md" />
              </>
            ) : (
              <>
                <p className="text-3xl font-bold tracking-tight text-foreground">
                  {card.value}
                </p>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {card.label}
                </p>
                <p className="mt-2.5 text-xs text-muted-foreground">
                  {card.subLabel}
                </p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
