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
import { CompanyPublicView } from "@/features/company-jobs/components";
import {
  Badges,
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
  useUserProfile,
} from "@/features/profile";
import { ProjectsTab } from "@/features/projects";
import { ROLES } from "@/lib/auth/roles";

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
  const { data: viewer } = useUserProfile();

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

  if (isLoadingProfile) {
    return <Loader />;
  }

  if (isError || !profile) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <ShieldX className="h-16 w-16 text-muted-foreground/40" />
        <p className="mt-4 text-lg font-medium">This profile is private</p>
        <p className="mt-1 text-muted-foreground">
          The user has chosen to keep their profile hidden.
        </p>
      </div>
    );
  }

  // Company role — render company profile view instead of student profile
  if (profile.roles.includes(ROLES.COMPANY)) {
    return <CompanyPublicView userProfile={profile} />;
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
              <div className="rounded-xl bg-muted p-8 text-center text-muted-foreground">
                <p className="font-medium">Achievements Coming Soon</p>
                <p className="mt-1 text-sm">
                  This feature is under development.
                </p>
              </div>
            )}
            {activeTab === "badges" && (
              <Badges muid={muid} isOwnProfile={false} />
            )}
            {activeTab === "projects" && (
              <ProjectsTab
                muid={muid}
                ownerMuid={muid}
                currentUserId={viewer?.id ?? null}
                isOwnProfile={false}
              />
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
