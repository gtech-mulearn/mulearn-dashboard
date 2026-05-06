import { TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { LeaderboardCardProps } from "@/features/leaderboard";

export function LeaderboardCard({ entry }: LeaderboardCardProps) {
  return (
    <Card className="group hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="shrink-0 relative">
            <div className="w-10 h-10 md:w-16 md:h-16 flex items-center justify-center relative overflow-hidden">
              <span className="text-xl md:text-2xl font-semibold relative z-10">
                {entry.rank}
              </span>
            </div>
          </div>
          <div className="shrink-0 w-10 h-10 md:w-14 md:h-14 rounded-full bg-primary flex items-center justify-center relative overflow-hidden">
            <Avatar>
              <AvatarImage
                src={entry.profile_pic}
                alt={entry.name}
                className="object-cover"
              />
              <AvatarFallback
                className={`text-secondary bg-primary text-2xl md:text-4xl`}
              >
                {entry.name?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-1 md:gap-2">
              <h3 className="font-semibold text-xs sm:text-base md:text-lg text-foreground uppercase tracking-tight break-words line-clamp-2 sm:line-clamp-none">
                {entry.name}
              </h3>
              <div className="shrink-0">
                <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-chart-2" />
              </div>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="bg-primary text-secondary rounded-2xl px-2.5 sm:px-4 py-0.5 sm:py-2 relative">
              <div className="font-black text-xs sm:text-lg md:text-xl tabular-nums">
                {entry.karma.toLocaleString()}
              </div>
            </div>
            <p className="text-xs font-black mt-0.5 sm:mt-1 text-muted-foreground tracking-widest uppercase">
              KARMA
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
