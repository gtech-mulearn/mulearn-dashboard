import { Flame } from "lucide-react";
import { MOCK_STATS } from "../constants/mock-stats";

function DeltaBadge({
  value,
  isPositiveGood = true,
}: {
  value: number;
  isPositiveGood?: boolean;
}) {
  const isGood = isPositiveGood ? value > 0 : value < 0;
  const label = value > 0 ? `+${value}` : `${value}`;
  return (
    <span
      className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${isGood ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}
    >
      {label}
    </span>
  );
}

export function HomeStatsPanel() {
  const { karma, rank, activeCircles, streak } = MOCK_STATS;
  const rows = [
    {
      label: "Total Karma",
      value: (
        <span>
          <span className="text-xl font-bold text-foreground">
            {karma.total.toLocaleString()}
          </span>
          <span className="ml-1 text-xs text-muted-foreground">pts</span>
        </span>
      ),
      badge: <DeltaBadge value={karma.deltaPct} />,
    },
    {
      label: "Rank",
      value: (
        <span className="text-xl font-bold text-foreground">
          #{rank.current}
        </span>
      ),
      badge: <DeltaBadge value={rank.delta} isPositiveGood={false} />,
    },
    {
      label: "Active Circles",
      value: (
        <span className="text-xl font-bold text-foreground">
          {activeCircles.count}
        </span>
      ),
      badge: <DeltaBadge value={activeCircles.delta} />,
    },
    {
      label: "Streak",
      value: (
        <span>
          <span className="text-xl font-bold text-foreground">
            {streak.days}
          </span>
          <span className="ml-1 text-xs text-muted-foreground">days</span>
        </span>
      ),
      badge: <Flame className="size-4 text-warning" />,
    },
  ];
  return (
    <div className="divide-y divide-border">
      {rows.map(({ label, value, badge }) => (
        <div
          key={label}
          className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
        >
          <span className="text-sm text-muted-foreground">{label}</span>
          <div className="flex items-center gap-2">
            {value}
            {badge}
          </div>
        </div>
      ))}
    </div>
  );
}
