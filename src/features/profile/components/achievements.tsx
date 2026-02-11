/**
 * Achievements Tab Component
 *
 * 📍 src/features/profile/components/achievements.tsx
 *
 * Displays user's earned achievements as cards.
 * Cards show achievement info and allow VC issuance.
 */

"use client";

import { Loader2, Trophy } from "lucide-react";
import { useCallback } from "react";
import { useUserAchievements } from "../hooks";
import { AchievementCard } from "./achievement-card";

interface AchievementsProps {
  muid: string;
  userName: string;
  userEmail?: string;
  isOwnProfile: boolean;
}

export function Achievements({
  muid,
  userName,
  userEmail,
  isOwnProfile,
}: AchievementsProps) {
  const { data: achievements, isLoading, refetch } = useUserAchievements(muid);

  // Memoized callback to prevent unnecessary re-renders
  const handleAchievementUpdate = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0961F5]" />
        </div>
      </div>
    );
  }

  if (!achievements || achievements.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <Trophy className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          No Achievements Yet
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {isOwnProfile
            ? "Complete tasks to earn achievements and Verifiable Credentials."
            : "This user hasn't earned any achievements yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Achievements ({achievements.length})
        </h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((userAchievement) => (
          <AchievementCard
            key={userAchievement.id}
            achievement={userAchievement}
            muid={muid}
            userName={userName}
            userEmail={userEmail}
            isOwnProfile={isOwnProfile}
            onAchievementUpdate={handleAchievementUpdate}
          />
        ))}
      </div>
    </div>
  );
}
