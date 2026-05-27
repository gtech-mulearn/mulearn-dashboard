import { Activity, BarChart2, CircleDot, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { CampusStatCard } from "../../schemas/home.schema";

type CampusStatCardsProps = {
  statCards?: CampusStatCard[];
  isLoading?: boolean;
};

const CARD_META = {
  active_members: {
    label: "ACTIVE MEMBERS",
    icon: Users,
    iconColor: "text-warning",
    iconBg: "bg-warning/10",
  },
  total_karma: {
    label: "CAMPUS KARMA",
    icon: BarChart2,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
  active_circles: {
    label: "ACTIVE CIRCLES",
    icon: CircleDot,
    iconColor: "text-success",
    iconBg: "bg-success/10",
  },
  rank: {
    label: "CAMPUS RANK",
    icon: Activity,
    iconColor: "text-brand-purple",
    iconBg: "bg-brand-purple/10",
  },
} as const;

const KEY_ORDER = [
  "active_members",
  "total_karma",
  "active_circles",
  "rank",
] as const;

function formatValue(key: (typeof KEY_ORDER)[number], value: number | null) {
  if (value == null) return "–";
  if (key === "rank") return `#${value}`;
  return value.toLocaleString();
}

export function CampusStatCards({
  statCards,
  isLoading,
}: CampusStatCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {KEY_ORDER.map((key) => {
        const meta = CARD_META[key];
        const card = statCards?.find((c) => c.key === key);
        const Icon = meta.icon;
        return (
          <div key={key} className="rounded-2xl border bg-card p-5 shadow-sm">
            <div
              className={`mb-3 flex size-10 items-center justify-center rounded-xl ${meta.iconBg}`}
            >
              <Icon className={`size-5 ${meta.iconColor}`} />
            </div>
            {isLoading || !statCards ? (
              <>
                <Skeleton className="mb-1.5 h-8 w-24 rounded-md" />
                <Skeleton className="h-3.5 w-32 rounded-md" />
              </>
            ) : (
              <>
                <p className="text-3xl font-bold tracking-tight text-foreground">
                  {formatValue(key, card?.value ?? null)}
                </p>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {meta.label}
                </p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
