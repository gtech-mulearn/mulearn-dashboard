/**
 * Achievements Tab Component
 *
 * 📍 src/features/profile/components/achievements.tsx
 *
 * When viewing own profile: shows Earned / Eligible / In Progress tabs.
 * When viewing another user's profile: shows only their earned achievements.
 */

"use client";

import { Trophy } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { IssueVCDialogListener } from "@/features/achievements/components/issue-vc-dialog-listener";
import {
  useAchievementProgress,
  useAchievements,
  useEligibleAchievements,
} from "@/features/achievements/hooks";
import { useUserAchievements } from "../hooks";
import { AchievementCard } from "./achievement-card";
import { EligibleAchievementCard } from "./eligible-achievement-card";
import { InProgressAchievementCard } from "./in-progress-achievement-card";

interface AchievementsProps {
  muid: string;
  userName: string;
  userEmail?: string;
  isOwnProfile: boolean;
}

type Tab = "earned" | "eligible" | "in-progress";

const TABS: { id: Tab; label: string }[] = [
  { id: "earned", label: "Earned" },
  { id: "eligible", label: "Eligible" },
  { id: "in-progress", label: "In Progress" },
];

export function Achievements({
  muid,
  userName,
  userEmail,
  isOwnProfile,
}: AchievementsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("earned");

  // ── Earned achievements (all profiles) ───────────────────────
  const {
    data: earnedAchievements,
    isLoading: earnedLoading,
    isError: earnedError,
    refetch: refetchEarned,
  } = useUserAchievements(muid);

  // ── Only fetched for own profile ──────────────────────────────
  const { data: eligibleAchievements, isLoading: eligibleLoading } =
    useEligibleAchievements();

  const { data: progressAchievements, isLoading: progressLoading } =
    useAchievementProgress();

  // Master list of all achievements for enriching icon/description
  const { data: allAchievements } = useAchievements();

  // Build a lookup map: achievement id → rich metadata
  const metaMap = useMemo(() => {
    if (!allAchievements) return new Map();
    return new Map(allAchievements.map((a) => [a.id, a]));
  }, [allAchievements]);

  const handleEarnedUpdate = useCallback(() => {
    refetchEarned();
  }, [refetchEarned]);

  // Build a set of already-earned achievement IDs for fast lookup.
  // The /progress/ endpoint returns ALL achievements (claimed + eligible + in-progress),
  // so we must exclude:
  //   1. Items where eligible=true  → already shown in the Eligible tab
  //   2. Items where the achievement was already earned (eligible=false, reason="Already claimed")
  const earnedIds = useMemo(
    () => new Set((earnedAchievements ?? []).map((ua) => ua.achievement.id)),
    [earnedAchievements],
  );

  const eligibleIds = useMemo(
    () => new Set((eligibleAchievements ?? []).map((ea) => ea.achievement_id)),
    [eligibleAchievements],
  );

  // Truly in-progress: not earned, not currently eligible, and has partial progress
  const inProgressAchievements = useMemo(
    () =>
      (progressAchievements ?? []).filter(
        (item) =>
          !item.eligible &&
          !earnedIds.has(item.achievement_id) &&
          !eligibleIds.has(item.achievement_id),
      ),
    [progressAchievements, earnedIds, eligibleIds],
  );

  // ── Error state ───────────────────────────────────────────────
  if (earnedError) {
    return (
      <div className="rounded-2xl bg-destructive/5 p-8 text-center shadow-sm border border-destructive/20">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <Trophy className="h-10 w-10 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-destructive">
          Failed to load achievements
        </h3>
        <p className="mt-1 text-sm text-foreground/60 mb-4">
          We couldn&apos;t fetch your achievements.
        </p>
        <button
          type="button"
          onClick={() => refetchEarned()}
          className="text-sm font-medium text-primary hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ── Loading state ─────────────────────────────────────────────
  const isLoading =
    earnedLoading || (isOwnProfile && (eligibleLoading || progressLoading));

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-card p-8 shadow-sm">
        <div className="flex min-h-[200px] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    );
  }

  // ── Other user's profile: simple earned grid ──────────────────
  if (!isOwnProfile) {
    if (!earnedAchievements || earnedAchievements.length === 0) {
      return (
        <div className="rounded-2xl bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Trophy className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            No Achievements Yet
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            This user hasn&apos;t earned any achievements yet.
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-2xl bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Achievements ({earnedAchievements.length})
          </h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {earnedAchievements.map((ua) => (
            <AchievementCard
              key={ua.id}
              achievement={ua}
              muid={muid}
              userName={userName}
              userEmail={userEmail}
              isOwnProfile={false}
              onAchievementUpdate={handleEarnedUpdate}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Own profile: tabbed interface ─────────────────────────────
  const earnedCount = earnedAchievements?.length ?? 0;
  const eligibleCount = eligibleAchievements?.length ?? 0;
  const inProgressCount = inProgressAchievements.length;

  const tabCounts: Record<Tab, number> = {
    earned: earnedCount,
    eligible: eligibleCount,
    "in-progress": inProgressCount,
  };

  return (
    <>
      {/* VC dialog listener for claim flow */}
      <IssueVCDialogListener />

      <div className="rounded-2xl bg-card p-6 shadow-sm space-y-6">
        {/* Tab bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-lg font-semibold text-foreground">
            Achievements
          </h3>

          <div className="flex items-center gap-1 rounded-xl bg-muted p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
                {tabCounts[tab.id] > 0 && (
                  <span
                    className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold ${
                      activeTab === tab.id
                        ? "bg-brand-blue text-white"
                        : "bg-muted-foreground/20 text-muted-foreground"
                    }`}
                  >
                    {tabCounts[tab.id]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Earned Tab ─────────────────────────────────────── */}
        {activeTab === "earned" && (
          <>
            {earnedCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Trophy className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  No achievements earned yet
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Complete tasks to earn your first achievement!
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {earnedAchievements?.map((ua) => (
                  <AchievementCard
                    key={ua.id}
                    achievement={ua}
                    muid={muid}
                    userName={userName}
                    userEmail={userEmail}
                    isOwnProfile={true}
                    onAchievementUpdate={handleEarnedUpdate}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Eligible Tab ───────────────────────────────────── */}
        {activeTab === "eligible" && (
          <>
            {eligibleCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Trophy className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  No achievements to claim right now
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Keep working on your tasks and check back later!
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {eligibleAchievements?.map((item) => (
                  <EligibleAchievementCard
                    key={item.achievement_id}
                    item={item}
                    meta={metaMap.get(item.achievement_id)}
                    onClaimed={handleEarnedUpdate}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── In Progress Tab ────────────────────────────────── */}
        {activeTab === "in-progress" && (
          <>
            {inProgressCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Trophy className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  No achievements in progress
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Start working on tasks to see your progress here!
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {inProgressAchievements.map((item) => (
                  <InProgressAchievementCard
                    key={item.achievement_id}
                    item={item}
                    meta={metaMap.get(item.achievement_id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
