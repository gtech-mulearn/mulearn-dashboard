/**
 * Public Profile Page
 *
 * 📍 src/app/(dashboard)/dashboard/profile/[muid]/page.tsx
 *
 * View another user's public profile.
 */

"use client";

import { ShieldX } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import Loader from "@/app/loading";
import {
  BasicDetails,
  KarmaHistory,
  MuVoyage,
  ProfileHeader,
  ProfileSidebar,
  ProfileStats,
  type ProfileTab,
  ProfileTabs,
  usePublicProfile,
  usePublicUserLevels,
  usePublicUserLog,
} from "@/features/profile";

export default function PublicProfilePage() {
  const params = useParams();
  const muid = params.muid as string;

  const [activeTab, setActiveTab] = useState<ProfileTab>("basic-details");

  const {
    data: profile,
    isLoading: isLoadingProfile,
    isError,
  } = usePublicProfile(muid);
  const { data: userLog, isLoading: isLoadingLog } = usePublicUserLog(muid);
  const { data: userLevels, isLoading: isLoadingLevels } =
    usePublicUserLevels(muid);

  // Calculate month difference for avg karma
  const getMonthDifference = (joined: string | undefined): number => {
    if (!joined) return 1;
    const startDate = new Date(joined.slice(0, 10));
    const endDate = new Date();
    return Math.max(
      1,
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        (endDate.getMonth() - startDate.getMonth()),
    );
  };

  // Get current level as number
  const getCurrentLevel = (level: string | null | undefined): number => {
    if (!level) return 1;
    const match = level.match(/\d+/);
    return match ? Number.parseInt(match[0], 10) : 1;
  };

  // Loading state
  if (isLoadingProfile) {
    return <Loader />;
  }

  // Error or private profile
  if (isError || !profile) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <ShieldX className="h-16 w-16 text-gray-300" />
        <p className="mt-4 text-lg font-medium text-gray-900">
          This profile is private
        </p>
        <p className="mt-1 text-gray-500">
          The user has chosen to keep their profile hidden.
        </p>
      </div>
    );
  }

  const monthDifference = getMonthDifference(profile.joined);
  const currentLevel = getCurrentLevel(profile.level);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <ProfileHeader profile={profile} isOwnProfile={false} />

      {/* Stats */}
      <ProfileStats profile={profile} monthDifference={monthDifference} />

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Tabs and Content */}
        <div className="space-y-4 lg:col-span-2">
          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="min-h-[400px]">
            {activeTab === "basic-details" && (
              <BasicDetails
                profile={profile}
                userLog={userLog}
                isLoading={isLoadingLog}
              />
            )}
            {activeTab === "karma-history" && (
              <KarmaHistory userLog={userLog} isLoading={isLoadingLog} />
            )}
            {activeTab === "mu-voyage" && (
              <MuVoyage
                userLevels={userLevels}
                currentLevel={currentLevel}
                isLoading={isLoadingLevels}
              />
            )}
            {activeTab === "achievements" && (
              <div className="rounded-xl bg-gray-50 p-8 text-center text-gray-500">
                <p className="font-medium">Achievements Coming Soon</p>
                <p className="mt-1 text-sm">
                  This feature is under development.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Sidebar (without settings for public profiles) */}
        <div className="lg:col-span-1">
          <ProfileSidebar profile={profile} isOwnProfile={false} />
        </div>
      </div>
    </div>
  );
}
