/**
 * Achievements Tab Component
 *
 * 📍 src/features/profile/components/achievements.tsx
 *
 * Displays user's earned achievements as cards.
 * Cards show achievement info and allow VC issuance.
 */

"use client";

import { Trophy } from "lucide-react";
import { useCallback } from "react";
import { Spinner } from "@/components/ui/spinner";
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
  const {
    data: achievements,
    isLoading,
    isError,
    refetch,
  } = useUserAchievements(muid);

  // Memoized callback to prevent unnecessary re-renders
  const handleAchievementUpdate = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-card p-8 shadow-sm">
        <div className="flex min-h-[200px] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl bg-destructive/5 p-8 text-center shadow-sm border border-destructive/20">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <Trophy className="h-10 w-10 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-destructive">
          Failed to load achievements
        </h3>
        <p className="mt-1 text-sm text-foreground/60 mb-4">
          We couldn't fetch your achievements.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-sm font-medium text-primary hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!achievements || achievements.length === 0) {
    return (
      <div className="rounded-2xl bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Trophy className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          No Achievements Yet
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {isOwnProfile
            ? "Complete tasks to earn achievements and Verifiable Credentials."
            : "This user hasn't earned any achievements yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
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
