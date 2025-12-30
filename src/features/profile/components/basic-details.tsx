/**
 * Basic Details Tab Component
 *
 * 📍 src/features/profile/components/basic-details.tsx
 *
 * Shows interest groups, activity heatmap and karma distribution chart.
 */

"use client";

import type { UserLogData, UserProfile } from "../schemas";
import { ActivityHeatmap } from "./activity-heatmap";
import { IGSelector } from "./ig-selector";
import { KarmaDistribution } from "./karma-distribution";

interface BasicDetailsProps {
  profile: UserProfile;
  userLog?: UserLogData;
  isLoading?: boolean;
  isOwnProfile?: boolean;
  onSaveInterestGroups?: (groupIds: string[]) => Promise<void>;
}

export function BasicDetails({
  profile,
  userLog,
  isLoading,
  isOwnProfile = true,
  onSaveInterestGroups,
}: BasicDetailsProps) {
  // Get current level as number
  const getCurrentLevel = (level: string | null | undefined): number => {
    if (!level) return 1;
    const match = level.match(/\d+/);
    return match ? Number.parseInt(match[0], 10) : 1;
  };

  const userLevel = getCurrentLevel(profile.level);

  const handleSaveInterestGroups = async (groupIds: string[]) => {
    if (onSaveInterestGroups) {
      await onSaveInterestGroups(groupIds);
    }
  };

  return (
    <div className="space-y-6">
      {/* Interest Groups Selector */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <IGSelector
          userInterestGroups={profile.interest_groups}
          userLevel={userLevel}
          isOwnProfile={isOwnProfile}
          onSave={handleSaveInterestGroups}
        />
      </div>

      {/* Activity Heatmap */}
      <ActivityHeatmap userLog={userLog} isLoading={isLoading} />

      {/* Karma Distribution */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <KarmaDistribution profile={profile} />
      </div>
    </div>
  );
}
