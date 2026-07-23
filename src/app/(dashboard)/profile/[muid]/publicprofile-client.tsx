/**
 * Public Profile Page (Client Component)
 *
 * View another user's public profile.
 */

"use client";

import { ShieldX } from "lucide-react";
import { useState } from "react";
import Loader from "@/app/loading";
import { usePublicCompanyProfile } from "@/features/company-jobs";
import { CompanyPublicView } from "@/features/company-jobs/components";
import {
  Achievements,
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

interface PublicProfilePageClientProps {
  muid: string;
}

export function PublicProfilePageClient({
  muid: muidParam,
}: PublicProfilePageClientProps) {
  const decodedMuid = decodeURIComponent(muidParam);

  // Companies use slugs (e.g. techcorp-india), users use MUIDs (e.g. john@mulearn)
  // MUIDs always contain an '@'. Slugs never do.
  const isCompanySlug = !decodedMuid.includes("@");

  const companySlug = isCompanySlug ? decodedMuid.toLowerCase() : "";
  const muid = isCompanySlug ? "" : decodedMuid;

  const [activeTab, setActiveTab] = useState<ProfileTab>("basic-details");

  const companyQuery = usePublicCompanyProfile(companySlug);
  const studentQuery = usePublicProfile(muid);

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

  // 1. Render company view immediately if company data loaded successfully
  if (companyQuery.data) {
    return <CompanyPublicView slug={companySlug || decodedMuid} />;
  }

  // 2. Wait if company query is still loading
  if (companyQuery.isLoading && isCompanySlug) {
    return <Loader />;
  }

  // 3. Wait if student query is still loading
  if (studentQuery.isLoading && !isCompanySlug) {
    return <Loader />;
  }

  const profile = studentQuery.data;

  // 4. Show 404/not found if student query failed and there is no company profile
  if (studentQuery.isError || !profile) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <ShieldX className="h-16 w-16 text-muted-foreground/40" />
        <p className="mt-4 text-lg font-medium">Profile not found</p>
        <p className="mt-1 text-muted-foreground">
          The requested profile could not be found or is private.
        </p>
      </div>
    );
  }

  // 5. Fallback check for company role on student profile
  if (profile.roles.includes(ROLES.COMPANY)) {
    return <CompanyPublicView userProfile={profile} slug={muid} />;
  }

  const monthDifference = getMonthDifference(profile.joined);
  const currentLevel = getCurrentLevel(profile.level);
  const isOwnProfile =
    !!viewer?.muid && !!profile?.muid && viewer.muid === profile.muid;

  return (
    <div className="w-full max-w-full space-y-6 overflow-x-hidden">
      {/* Profile Header */}
      <div className="w-full max-w-full overflow-hidden">
        <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />
      </div>

      {/* Stats */}
      <div className="w-full max-w-full">
        <ProfileStats profile={profile} monthDifference={monthDifference} />
      </div>

      {/* Main Content */}
      <div className="grid w-full max-w-full gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Left: Tabs and Content */}
        <div className="w-full max-w-full space-y-4 overflow-x-hidden lg:col-span-2">
          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="w-full max-w-full min-h-[400px] overflow-x-hidden">
            {activeTab === "basic-details" && (
              <BasicDetails
                profile={profile}
                userLog={userLog}
                isLoading={isLoadingLog}
                isOwnProfile={isOwnProfile}
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
              <Achievements
                muid={profile.muid}
                userName={profile.full_name}
                isOwnProfile={isOwnProfile}
              />
            )}
            {activeTab === "badges" && (
              <Badges muid={muid} isOwnProfile={isOwnProfile} />
            )}
            {activeTab === "projects" && (
              <ProjectsTab
                muid={muid}
                ownerMuid={muid}
                currentUserId={viewer?.id ?? null}
                isOwnProfile={isOwnProfile}
              />
            )}
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="w-full max-w-full overflow-x-hidden lg:col-span-1">
          <ProfileSidebar profile={profile} isOwnProfile={isOwnProfile} />
        </div>
      </div>
    </div>
  );
}
