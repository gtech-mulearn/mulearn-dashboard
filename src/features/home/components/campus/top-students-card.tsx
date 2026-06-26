import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CampusLeaderboardItem } from "@/features/campus-manage/types";
import { cn } from "@/lib/utils";

type TopStudentsCardProps = {
  items?: CampusLeaderboardItem[];
  isLoading?: boolean;
  campusName?: string;
};

// TODO: per-rank medal colors (gold/silver/bronze) — leave as-is per design-system exception
const RANK_COLORS = ["#f59e0b", "#d1d5db", "#b45309"] as const;

const LEVEL_COLORS: Record<string, string> = {
  "1": "bg-brand-blue/15 text-brand-blue",
  "2": "bg-primary/15 text-primary",
  "3": "bg-brand-purple/15 text-brand-purple",
  "4": "bg-warning/15 text-warning",
};

function levelStyle(level: string) {
  const num = level.replace(/\D/g, "");
  return LEVEL_COLORS[num] ?? "bg-muted text-muted-foreground";
}

export function TopStudentsCard({
  items = [],
  isLoading,
  campusName,
}: TopStudentsCardProps) {
  const visible = items.slice(0, 8);
  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="px-5 py-4">
        <div className="flex flex-row items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-warning/10">
            <Star className="size-4 text-warning" />
          </div>
          <CardTitle className="text-base font-bold text-foreground">
            Top Students{campusName ? ` — ${campusName}` : ""}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 flex-1 rounded" />
                <Skeleton className="h-5 w-12 rounded-full" />
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 text-left w-8">#</th>
                <th className="pb-2 text-left">Name</th>
                <th className="pb-2 text-center">Level</th>
                <th className="pb-2 text-right">Karma</th>
                <th className="pb-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No data available.
                  </td>
                </tr>
              ) : (
                visible.map((student, idx) => {
                  const rankColor = idx < 3 ? RANK_COLORS[idx] : undefined;
                  const status = student.alumni ? "alumni" : "active";
                  const statusStyle = student.alumni
                    ? "bg-muted text-muted-foreground"
                    : "bg-success/15 text-success";
                  return (
                    <tr
                      key={student.id}
                      className="border-b border-border last:border-b-0"
                    >
                      <td
                        className={`py-3 text-sm font-bold${rankColor ? "" : " text-muted-foreground"}`}
                        style={rankColor ? { color: rankColor } : undefined}
                      >
                        {idx + 1}
                      </td>
                      <td className="py-3 font-medium text-foreground">
                        {student.name}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={cn(
                            "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                            levelStyle(student.level),
                          )}
                        >
                          Lv {student.level}
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold text-warning">
                        {student.karma.toLocaleString()}
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                            statusStyle,
                          )}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
