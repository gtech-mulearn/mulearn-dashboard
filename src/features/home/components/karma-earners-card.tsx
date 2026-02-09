import { Award, Building2, Trophy, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { KarmaFeedResponse } from "../schemas";

type KarmaEarnersCardProps = {
  data?: KarmaFeedResponse["response"];
  isLoading?: boolean;
};

const formatKarma = (value: number) => value.toLocaleString();

export function KarmaEarnersCard({ data, isLoading }: KarmaEarnersCardProps) {
  const student = data?.top_user;
  const college = data?.top_college;

  return (
    <Card className="h-full overflow-hidden rounded-2xl border-none bg-card shadow-sm">
      <CardHeader className="border-b border-border/40  px-6 py-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-bold">Top Performers</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {/* Student Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 shadow-sm transition-all hover:bg-muted/30 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Student Champion
                </p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {student?.full_name ?? "Loading..."}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {student?.muid ?? "muid"}
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary">
                <Award className="h-3.5 w-3.5" />
                {formatKarma(student?.karma ?? 0)}
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-inner">
              <User className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        {/* College Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 shadow-sm transition-all hover:bg-muted/30 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Organization Leader
                </p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {college?.name ?? "Loading..."}
                </p>
                <p className="text-xs text-muted-foreground">
                  Top organization
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary">
                <Award className="h-3.5 w-3.5" />
                {formatKarma(college?.karma ?? 0)}
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-inner">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-2">
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/50 [animation-delay:-0.3s]" />
            <div className="mx-1 h-1.5 w-1.5 animate-bounce rounded-full bg-primary/50 [animation-delay:-0.15s]" />
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/50" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
