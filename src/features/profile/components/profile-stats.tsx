/**
 * Profile Stats Component
 *
 * 📍 src/features/profile/components/profile-stats.tsx
 *
 * Premium stats display with clean white cards.
 * Shows karma, rank, and level only.
 */

import { Award, Flame, Zap } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
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
      <StatCard
        title="Total Karma"
        value={formatNumber(karma)}
        accent="chart-4"
        icon={<Flame className="size-5" />}
        trend={{ value: `+${formatNumber(avgKarma)}/month`, direction: "up" }}
      />
      <StatCard
        title="Global Rank"
        value={`#${rank || "-"}`}
        accent="chart-1"
        icon={<Award className="size-5" />}
        description={`Top ${percentile}%`}
      />
      <StatCard
        title="Current Level"
        value={`Level ${level}`}
        accent="chart-2"
        icon={<Zap className="size-5" />}
        description={profile.level || "Beginner"}
      />
    </div>
  );
}
