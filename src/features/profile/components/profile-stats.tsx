/**
 * Profile Stats Component
 *
 * 📍 src/features/profile/components/profile-stats.tsx
 *
 * Premium stats display with clean white cards.
 * Shows karma, rank, level, and grit.
 */

import { Award, Flame, Zap } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import type { UserProfile } from "../schemas";
import { getLevelMessage, parseLevelNumber } from "../utils/level.utils";
import { GritMeterCard } from "./grit-meter-card";

interface ProfileStatsProps {
  profile: UserProfile;
  monthDifference: number;
}

export function ProfileStats({ profile, monthDifference }: ProfileStatsProps) {
  const karma = profile.karma ?? 0;
  const rank = profile.rank ?? 0;
  const level = parseLevelNumber(profile.level);
  const grit = profile.grit ?? 0;

  const avgKarma =
    monthDifference > 0 ? Math.round(karma / monthDifference) : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Karma"
        value={karma.toLocaleString()}
        accent="chart-4"
        icon={<Flame className="size-5" />}
        description={`avg ${avgKarma.toLocaleString()}/month since joining`}
      />
      {/* Percentile is intentionally not shown: the API's get_percentile mixes
          Wallet and User counts and can return negative values ("Top -0.1%"). */}
      <StatCard
        title="Global Rank"
        value={`#${rank || "-"}`}
        accent="chart-1"
        icon={<Award className="size-5" />}
      />
      <StatCard
        title="Current Level"
        value={`Level ${level}`}
        accent="chart-2"
        icon={<Zap className="size-5" />}
        description={getLevelMessage(profile.level)}
      />
      <GritMeterCard grit={grit} />
    </div>
  );
}
