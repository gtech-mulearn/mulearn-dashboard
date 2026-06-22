import { Activity, BarChart2, CircleDot, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import type { CampusStatCard } from "../../schemas/home.schema";

type CampusStatCardsProps = {
  statCards?: CampusStatCard[];
  isLoading?: boolean;
};

const CARD_META = {
  active_members: {
    label: "Active Members",
    icon: Users,
    accent: "chart-1" as const,
  },
  total_karma: {
    label: "Campus Karma",
    icon: BarChart2,
    accent: "chart-2" as const,
  },
  active_circles: {
    label: "Active Circles",
    icon: CircleDot,
    accent: "chart-3" as const,
  },
  rank: {
    label: "Campus Rank",
    icon: Activity,
    accent: "chart-4" as const,
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

        if (isLoading || !statCards) {
          return (
            <div key={key} className="rounded-2xl border bg-card p-5 shadow-sm">
              <Skeleton className="mb-1.5 h-8 w-24 rounded-md" />
              <Skeleton className="h-3.5 w-32 rounded-md" />
            </div>
          );
        }

        return (
          <StatCard
            key={key}
            title={meta.label}
            value={formatValue(key, card?.value ?? null)}
            icon={<Icon className="size-5" />}
            accent={meta.accent}
          />
        );
      })}
    </div>
  );
}
