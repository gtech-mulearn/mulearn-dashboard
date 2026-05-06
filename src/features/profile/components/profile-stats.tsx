/**
 * Profile Stats Component
 *
 * 📍 src/features/profile/components/profile-stats.tsx
 *
 * Premium stats display with clean white cards.
 * Shows karma, rank, and level only.
 */

import { Award, Flame, TrendingUp, Zap } from "lucide-react";
import type { UserProfile } from "../schemas";

interface ProfileStatsProps {
  profile: UserProfile;
  monthDifference: number;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

export function ProfileStats({ profile, monthDifference }: ProfileStatsProps) {
  const karma = profile.karma ?? 0;
  const rank = profile.rank ?? 0;
  const percentile = profile.percentile ? profile.percentile.toFixed(1) : "0";
  const level = profile.level ? profile.level.slice(3, 4) : "1";

  const avgKarma =
    monthDifference > 0 ? Math.round(karma / monthDifference) : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {/* Total Karma */}
      <div className="rounded-2xl bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Karma
            </p>
            <p className="mt-1 text-3xl font-bold text-foreground">
              {formatNumber(karma)}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-success">
              <TrendingUp className="h-3 w-3" />+{formatNumber(avgKarma)}/month
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning/10">
            <Flame className="h-5 w-5 text-warning" />
          </div>
        </div>
      </div>

      {/* Rank */}
      <div className="rounded-2xl bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Global Rank
            </p>
            <p className="mt-1 text-3xl font-bold text-foreground">
              #{rank || "-"}
            </p>
            <p className="mt-1 text-xs text-brand-blue">Top {percentile}%</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-blue/10">
            <Award className="h-5 w-5 text-brand-blue" />
          </div>
        </div>
      </div>

      {/* Level */}
      <div className="rounded-2xl bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Current Level
            </p>
            <p className="mt-1 text-3xl font-bold text-foreground">
              Level {level}
            </p>
            <p className="mt-1 text-xs text-brand-purple">
              {profile.level || "Beginner"}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-purple/10">
            <Zap className="h-5 w-5 text-brand-purple" />
          </div>
        </div>
      </div>
    </div>
  );
}
