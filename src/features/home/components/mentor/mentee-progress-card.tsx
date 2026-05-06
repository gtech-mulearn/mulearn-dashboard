import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_MENTEE_PROGRESS } from "../../constants/mock-mentor";

export function MenteeProgressCard() {
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
        <div className="space-y-4">
          {MOCK_MENTEE_PROGRESS.map((mentee) => {
            const pct = Math.round(
              (mentee.karmaEarned / mentee.karmaTarget) * 100,
            );
            return (
              <div key={mentee.id} className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <div
                    className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground"
                    style={{ backgroundColor: mentee.avatarColor }}
                  >
                    {mentee.initials}
                  </div>
                  <span className="flex-1 text-sm font-medium text-foreground">
                    {mentee.name}
                  </span>
                  <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    {mentee.level}
                  </span>
                  <span className="w-8 text-right text-xs font-semibold text-muted-foreground">
                    {pct}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: mentee.avatarColor,
                    }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {mentee.karmaEarned.toLocaleString()} /{" "}
                  {mentee.karmaTarget.toLocaleString()} karma
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
