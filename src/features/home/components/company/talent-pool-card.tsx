import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CompanyTalentPool } from "../../schemas/home.schema";

type Props = {
  talentPool?: CompanyTalentPool;
  isLoading: boolean;
};

const LEVEL_COLORS = ["#374151", "#6366f1", "#a855f7", "#f59e0b", "#10b981"];

export function TalentPoolCard({ talentPool, isLoading }: Props) {
  const topIgs = talentPool?.top_interest_groups.slice(0, 4) ?? [];
  const totalLearners = talentPool?.total_learners ?? 0;
  const maxCount = topIgs[0]?.learner_count ?? 1;

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
        <p className="mb-5 text-xs text-muted-foreground">
          {totalLearners > 0
            ? `${totalLearners.toLocaleString()} MuLearn verified learners`
            : "MuLearn verified learners network"}
        </p>

        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Top Interest Groups
        </p>
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-5 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {topIgs.map((ig, idx) => {
              const pct = Math.round((ig.learner_count / maxCount) * 100);
              return (
                <div key={ig.ig_id} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate text-xs font-medium text-foreground">
                    {ig.name}
                  </span>
                  <div className="flex-1 overflow-hidden rounded-full bg-muted h-2">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor:
                          LEVEL_COLORS[idx % LEVEL_COLORS.length],
                      }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-[11px] text-muted-foreground">
                    {ig.learner_count.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
