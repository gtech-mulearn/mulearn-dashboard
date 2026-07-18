import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { LeaderboardCardProps } from "@/features/leaderboard";

export function LeaderboardCard({ entry }: LeaderboardCardProps) {
  const rowContent = (
    <div className="flex items-center py-4 md:py-5 px-4 md:px-8 bg-card border-b border-border last:border-b-0 hover:bg-muted/40 transition-colors">
      {/* Rank */}
      <div className="w-10 md:w-14 flex-shrink-0">
        <span className="text-sm font-semibold text-muted-foreground">
          {entry.rank}
        </span>
      </div>

      {/* Contributor */}
      <div className="flex-1 flex items-center gap-3 min-w-0">
        <Avatar className="w-9 h-9 flex-shrink-0 ring-1 ring-border">
          <AvatarImage
            src={entry.profile_pic}
            alt={entry.name}
            className="object-cover"
          />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
            {entry.name?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium text-sm md:text-base text-foreground transition-colors group-hover:text-primary">
          {entry.name}
        </span>
      </div>

      {/* Karma */}
      <div className="w-28 md:w-40 text-right flex-shrink-0">
        <span className="font-semibold text-sm md:text-base text-foreground tabular-nums">
          {entry.karma.toLocaleString()}
        </span>
      </div>
    </div>
  );

  return entry.link ? (
    <Link href={entry.link} className="block group">
      {rowContent}
    </Link>
  ) : (
    rowContent
  );
}
