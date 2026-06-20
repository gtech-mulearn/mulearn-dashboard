import { ArrowRight, Trophy } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTopPerformers } from "../hooks/use-home";

// TODO: per-user avatar colors are a meaningful categorical palette — leave as-is
const AVATAR_COLORS = [
  { bg: "#EEF2FF", text: "#4F46E5" },
  { bg: "#F5F3FF", text: "#7C3AED" },
  { bg: "#F0FDF4", text: "#16A34A" },
  { bg: "#FFF7ED", text: "#EA580C" },
  { bg: "#FDF4FF", text: "#A21CAF" },
];

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function formatKarma(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function RankIndicator({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span className="flex size-5 items-center justify-center text-sm text-warning">
        ♦
      </span>
    );
  if (rank === 2)
    return (
      <span className="flex size-5 items-center justify-center text-sm text-muted-foreground">
        ◆
      </span>
    );
  return (
    <span className="flex size-5 items-center justify-center rounded-full bg-success/10 text-[11px] font-bold text-success">
      {rank}
    </span>
  );
}

export function KarmaEarnersCard() {
  const { data: performers, isLoading } = useTopPerformers();
  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl bg-warning/10">
            <Trophy className="size-4 text-warning" />
          </div>
          <CardTitle className="text-base font-bold text-foreground">
            Top Performers
          </CardTitle>
        </div>
        <Link
          href="/dashboard/leaderboard"
          className="group flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Full board
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </CardHeader>
      <CardContent className="px-4 pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : !performers || performers.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No performers data available.
          </p>
        ) : (
          <div className="space-y-0">
            {performers.map((p, index) => {
              const rank = index + 1;
              const colors = AVATAR_COLORS[index % AVATAR_COLORS.length];
              return (
                <div
                  key={`${p.full_name}-${p.institution ?? "unknown"}-${p.total_karma}`}
                  className="flex items-center gap-3 border-b border-border py-2 last:border-b-0"
                >
                  <div className="flex w-5 shrink-0 items-center justify-center">
                    <RankIndicator rank={rank} />
                  </div>
                  <Avatar className="size-9 shrink-0">
                    <AvatarImage
                      src={p.profile_pic}
                      alt={p.full_name}
                      className="object-cover"
                    />
                    <AvatarFallback
                      className="text-sm font-bold"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      {initials(p.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {p.full_name}
                    </p>
                    {p.institution ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {p.institution}
                      </p>
                    ) : null}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-foreground">
                      {formatKarma(p.total_karma)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">karma</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
