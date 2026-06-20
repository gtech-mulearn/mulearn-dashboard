import { Flame } from "lucide-react";

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

export type HomeStatsPanelProps = {
  karma?: number;
  karmaDelta?: number;
  rank?: number | null;
  rankDelta?: number;
  activeCircles?: number;
  circlesDelta?: number;
  streakDays?: number;
};

export function HomeStatsPanel({
  karma = 0,
  karmaDelta = 0,
  rank = null,
  rankDelta = 0,
  activeCircles = 0,
  circlesDelta = 0,
  streakDays = 0,
}: HomeStatsPanelProps) {
  const rows = [
    {
      label: "Total Karma",
      value: (
        <span>
          <span className="text-xl font-bold text-foreground">
            {karma.toLocaleString()}
          </span>
          <span className="ml-1 text-xs text-muted-foreground">Karma</span>
        </span>
      ),
      badge: karmaDelta !== 0 ? <DeltaBadge value={karmaDelta} /> : null,
    },
    {
      label: "Rank",
      value: (
        <span className="text-xl font-bold text-foreground">
          {rank != null ? `#${rank}` : "—"}
        </span>
      ),
      badge:
        rankDelta !== 0 ? (
          <DeltaBadge value={rankDelta} isPositiveGood={false} />
        ) : null,
    },
    {
      label: "Active Circles",
      value: (
        <span className="text-xl font-bold text-foreground">
          {activeCircles}
        </span>
      ),
      badge: circlesDelta !== 0 ? <DeltaBadge value={circlesDelta} /> : null,
    },
    {
      label: "Streak",
      value: (
        <span className="flex items-center gap-1">
          <Flame className="size-4 text-warning" />
          <span className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-foreground">
              {streakDays}
            </span>
            <span className="text-xs text-muted-foreground">days</span>
          </span>
        </span>
      ),
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
