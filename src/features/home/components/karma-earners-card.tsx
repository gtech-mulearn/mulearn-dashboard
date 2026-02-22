import { Award, Building2, Sparkles, Trophy, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { KarmaFeedResponse } from "../schemas";

type KarmaEarnersCardProps = {
  data?: KarmaFeedResponse["response"];
  isLoading?: boolean;
};

const formatKarma = (value: number) =>
  value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toLocaleString();

/** Derive initials from a full name */
const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

type PerformerCardProps = {
  rank: number;
  label: string;
  name: string;
  sub: string;
  karma: number;
  icon: React.ElementType;
  /** CSS variable name e.g. "--chart-4" */
  accentVar: string;
};

function PerformerCard({
  rank,
  label,
  name,
  sub,
  karma,
  icon: Icon,
  accentVar,
}: PerformerCardProps) {
  const accent = `var(${accentVar})`;

  return (
    <div
      className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
      style={{
        borderLeft: `4px solid ${accent}`,
      }}
    >
      {/* Faint accent wash on hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 6%, transparent), transparent 70%)`,
        }}
      />

      {/* Top row: avatar + rank + label */}
      <div className="relative z-10 flex items-center gap-3">
        {/* Avatar circle with initials */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black text-white shadow-sm transition-transform duration-300 group-hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${accent}, color-mix(in srgb, ${accent} 70%, #000))`,
          }}
        >
          {name === "—" ? (
            <Icon className="h-5 w-5 text-white/90" />
          ) : (
            initials(name)
          )}
        </div>

        {/* Label + rank */}
        <div className="min-w-0 flex-1">
          <p
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: accent }}
          >
            {label}
          </p>
          <p className="truncate text-[13px] font-extrabold leading-snug text-gray-900">
            {name}
          </p>
          {sub && (
            <p className="truncate font-mono text-[10px] text-gray-400">
              {sub}
            </p>
          )}
        </div>

        {/* Rank badge top-right */}
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black text-white shadow"
          style={{ background: accent }}
        >
          #{rank}
        </div>
      </div>

      {/* Karma score row */}
      <div className="relative z-10 flex items-center justify-between">
        <div
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-black shadow-sm"
          style={{
            background: `color-mix(in srgb, ${accent} 12%, #fff)`,
            color: accent,
          }}
        >
          <Award className="h-3.5 w-3.5 shrink-0" />
          <span>{formatKarma(karma)}</span>
          <span className="text-[10px] font-semibold opacity-70">karma</span>
        </div>

        <Icon
          className="h-4 w-4 transition-colors duration-200"
          style={{ color: `color-mix(in srgb, ${accent} 50%, #aaa)` }}
        />
      </div>

      {/* Bottom accent line (always visible, brightens on hover) */}
      <span
        className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-full rounded-full transition-opacity duration-300 opacity-30 group-hover:opacity-100"
        style={{ background: accent }}
      />
    </div>
  );
}

export function KarmaEarnersCard({ data, isLoading }: KarmaEarnersCardProps) {
  const student = data?.top_user;
  const college = data?.top_college;

  return (
    <Card className="card-bg-performers relative h-full gap-0 overflow-hidden rounded-2xl border-none pt-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Decorative SVG geometry */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 h-full w-1/2 opacity-[0.08]"
        fill="none"
        viewBox="0 0 200 420"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="160"
          cy="55"
          r="55"
          stroke="var(--chart-5)"
          strokeWidth="2.5"
        />
        <circle
          cx="145"
          cy="225"
          r="80"
          stroke="var(--chart-4)"
          strokeWidth="1.5"
        />
        <path
          d="M120 345L145 360V390L120 405L95 390V360L120 345Z"
          stroke="var(--chart-5)"
          strokeWidth="1.5"
        />
      </svg>

      {/* Header */}
      <CardHeader className="relative z-10 flex-row items-center gap-2.5 px-5 py-4">
        <div
          className="flex size-9 items-center justify-center rounded-xl shadow-sm"
          style={{
            background:
              "color-mix(in srgb, var(--chart-5) 22%, var(--background))",
          }}
        >
          <Trophy className="h-5 w-5" style={{ color: "var(--chart-5)" }} />
        </div>
        <CardTitle className="text-base font-bold tracking-tight text-foreground">
          Top Performers
        </CardTitle>
        <Sparkles
          className="ml-auto h-4 w-4 animate-pulse"
          style={{ color: "var(--chart-4)" }}
        />
      </CardHeader>

      {/* Body */}
      <CardContent className="relative z-10 space-y-3 p-5 pt-0">
        {isLoading ? (
          <>
            <div className="shimmer h-24 w-full rounded-2xl bg-white/70" />
            <div className="shimmer h-24 w-full rounded-2xl bg-white/70" />
          </>
        ) : (
          <>
            <PerformerCard
              rank={1}
              label="Student Champion"
              name={student?.full_name ?? "—"}
              sub={student?.muid ?? ""}
              karma={student?.karma ?? 0}
              icon={User}
              accentVar="--chart-5"
            />
            <PerformerCard
              rank={2}
              label="Organization Leader"
              name={college?.name ?? "—"}
              sub="Top organization"
              karma={college?.karma ?? 0}
              icon={Building2}
              accentVar="--chart-2"
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
