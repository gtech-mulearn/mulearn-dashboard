import { Activity, BarChart2, CircleDot, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { CampusOverview } from "@/features/campus-manage/types";
import { MOCK_CAMPUS_STAT_DELTAS } from "../../constants/mock-campus";

type CampusStatCardsProps = {
  overview?: CampusOverview;
  isLoading?: boolean;
};

const CARDS = [
  {
    key: "activeMembers" as const,
    label: "ACTIVE MEMBERS",
    icon: Users,
    iconColor: "text-warning",
    iconBg: "bg-warning/10",
    getValue: (o: CampusOverview) => o.activeMembers.toLocaleString(),
    delta: MOCK_CAMPUS_STAT_DELTAS.activeMembers.label,
  },
  {
    key: "campusKarma" as const,
    label: "CAMPUS KARMA",
    icon: BarChart2,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    getValue: (o: CampusOverview) => o.totalKarma.toLocaleString(),
    delta: MOCK_CAMPUS_STAT_DELTAS.campusKarma.label,
  },
  {
    key: "activeCircles" as const,
    label: "ACTIVE CIRCLES",
    icon: CircleDot,
    iconColor: "text-success",
    iconBg: "bg-success/10",
    getValue: (o: CampusOverview) => o.igChaptersCount.toString(),
    delta: MOCK_CAMPUS_STAT_DELTAS.activeCircles.label,
  },
  {
    key: "campusRank" as const,
    label: "CAMPUS RANK",
    icon: Activity,
    iconColor: "text-brand-purple",
    iconBg: "bg-brand-purple/10",
    getValue: (o: CampusOverview) => `#${o.rank}`,
    delta: MOCK_CAMPUS_STAT_DELTAS.campusRank.label,
  },
] as const;

export function CampusStatCards({ overview, isLoading }: CampusStatCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {CARDS.map((card) => {
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
            {isLoading || !overview ? (
              <>
                <Skeleton className="mb-1.5 h-8 w-24 rounded-md" />
                <Skeleton className="mb-3 h-3.5 w-32 rounded-md" />
                <Skeleton className="h-5 w-28 rounded-full" />
              </>
            ) : (
              <>
                <p className="text-3xl font-bold tracking-tight text-foreground">
                  {card.getValue(overview)}
                </p>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {card.label}
                </p>
                <p className="mt-2.5 inline-flex items-center rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">
                  {card.delta}
                </p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
