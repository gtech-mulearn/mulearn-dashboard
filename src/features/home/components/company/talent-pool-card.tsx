import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { InterestGroupListItem } from "../../schemas/home.schema";

type Props = {
  interestGroups: InterestGroupListItem[];
  igsLoading: boolean;
};

const LEVEL_COLORS = ["#374151", "#6366f1", "#a855f7", "#f59e0b", "#10b981"];

export function TalentPoolCard({ interestGroups, igsLoading }: Props) {
  const topIgs = interestGroups.slice(0, 4);

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
          MuLearn verified learners network
        </p>

        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Top Interest Groups
        </p>
        {igsLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-5 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {topIgs.map((ig, idx) => (
              <div key={ig.id} className="flex items-center gap-3">
                <span className="w-32 shrink-0 truncate text-xs font-medium text-foreground">
                  {ig.name}
                </span>
                <div className="flex-1 overflow-hidden rounded-full bg-muted h-2">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${100 - idx * 18}%`,
                      backgroundColor: LEVEL_COLORS[idx % LEVEL_COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
