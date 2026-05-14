import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MentorMentee } from "../../schemas/home.schema";

type Props = {
  mentees: MentorMentee[];
  isLoading: boolean;
};

function avatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 60%, 50%)`;
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const LEVEL_KARMA_TARGETS: Record<string, number> = {
  L1: 2000,
  L2: 5000,
  L3: 8000,
  L4: 12000,
  L5: 20000,
};

export function MenteeProgressCard({ mentees, isLoading }: Props) {
  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex-row items-center gap-2.5 px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-success/10">
          <TrendingUp className="size-4 text-success" />
        </div>
        <CardTitle className="text-base font-bold text-foreground">
          Mentee Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        {isLoading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : mentees.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No mentees yet.
          </p>
        ) : (
          <div className="space-y-4">
            {mentees.slice(0, 5).map((mentee) => {
              const level = mentee.ig_level ?? mentee.level ?? "L1";
              const target = LEVEL_KARMA_TARGETS[level] ?? 2000;
              const earned = mentee.ig_karma;
              const pct = Math.min(Math.round((earned / target) * 100), 100);
              const color = avatarColor(mentee.user_id);
              return (
                <div key={mentee.user_id} className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground"
                      style={{ backgroundColor: color }}
                    >
                      {initials(mentee.full_name)}
                    </div>
                    <span className="flex-1 text-sm font-medium text-foreground">
                      {mentee.full_name}
                    </span>
                    <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      {level}
                    </span>
                    <span className="w-8 text-right text-xs font-semibold text-muted-foreground">
                      {pct}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {earned.toLocaleString()} / {target.toLocaleString()} karma
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
