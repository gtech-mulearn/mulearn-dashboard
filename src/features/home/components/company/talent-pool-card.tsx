import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MOCK_LEVEL_DISTRIBUTION,
  MOCK_LEVEL_DISTRIBUTION_TOTAL,
  MOCK_TOP_IG_MAX_KARMA,
  MOCK_TOP_INTEREST_GROUPS,
  MOCK_TOTAL_LEARNERS,
} from "../../constants/mock-company";

function formatKarma(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function TalentPoolCard() {
  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex-row items-center gap-2.5 px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-success/10">
          <Users className="size-4 text-success" />
        </div>
        <CardTitle className="text-base font-bold text-foreground">
          Talent Pool
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        <p className="mb-3 text-xs text-muted-foreground">
          {MOCK_TOTAL_LEARNERS} verified learners
        </p>

        {/* Level distribution segmented bar */}
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Level Distribution
        </p>
        {/* TODO: per-level distribution colors are a meaningful categorical palette — leave as-is */}
        <div className="mb-2 flex h-7 overflow-hidden rounded-lg">
          {MOCK_LEVEL_DISTRIBUTION.map((item) => {
            const pct = (item.count / MOCK_LEVEL_DISTRIBUTION_TOTAL) * 100;
            return (
              <div
                key={item.level}
                className="flex items-center justify-center text-[10px] font-bold text-primary-foreground"
                style={{ width: `${pct}%`, backgroundColor: item.color }}
                title={`${item.level}: ${item.count.toLocaleString()}`}
              >
                {pct > 8 ? item.level : ""}
              </div>
            );
          })}
        </div>
        <div className="mb-5 flex flex-wrap gap-2">
          {MOCK_LEVEL_DISTRIBUTION.map((item) => (
            <span
              key={item.level}
              className="flex items-center gap-1 text-[10px] text-muted-foreground"
            >
              <span
                className="inline-block size-2 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              {item.level} : {item.count.toLocaleString()}
            </span>
          ))}
        </div>

        {/* Top interest groups */}
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Top Interest Groups
        </p>
        <div className="space-y-3">
          {MOCK_TOP_INTEREST_GROUPS.map((ig) => {
            const pct = (ig.karma / MOCK_TOP_IG_MAX_KARMA) * 100;
            return (
              <div key={ig.id} className="flex items-center gap-3">
                <span className="w-32 shrink-0 truncate text-xs font-medium text-foreground">
                  {ig.name}
                </span>
                <div className="flex-1 overflow-hidden rounded-full bg-muted h-2">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: ig.color }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-xs font-semibold text-muted-foreground">
                  {formatKarma(ig.karma)}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
