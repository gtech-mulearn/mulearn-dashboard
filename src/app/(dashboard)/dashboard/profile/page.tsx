/**
 * Profile Page
 *
 * 📍 src/app/(dashboard)/dashboard/profile/page.tsx
 *
 * User's own profile page with modals for editing.
 */

"use client";

import { useState } from "react";
import Loader from "@/app/loading";
import {
  AccountSettingsModal,
  Achievements,
  BasicDetails,
  EditInterestGroupsModal,
  EditProfileModal,
  KarmaHistory,
  MuVoyage,
  ProfileHeader,
  ProfileSidebar,
  ProfileStats,
  ProfileTabs,
  type ProfileTab,
  ShareProfileModal,
  updateInterestGroups,
  useUserLevels,
  useUserLog,
  useUserProfile,
} from "@/features/profile";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("basic-details");

  // Modal states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showShareProfile, setShowShareProfile] = useState(false);
  const [showEditInterestGroups, setShowEditInterestGroups] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);

  const {
    data: profile,
    isLoading: isLoadingProfile,
    isError,
    refetch: refetchProfile,
  } = useUserProfile();
  const { data: userLog, isLoading: isLoadingLog } = useUserLog();
  const { data: userLevels, isLoading: isLoadingLevels } = useUserLevels();

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

  // Save profile handler
  const handleSaveProfile = async (data: {
    full_name?: string;
    profile_pic?: string;
  }) => {
    // TODO: Implement API call to update profile
    await new Promise((resolve) => setTimeout(resolve, 1000));
    refetchProfile();
  };

  // Save interest groups handler
  const handleSaveInterestGroups = async (groupIds: string[]) => {
    await updateInterestGroups(groupIds);
    refetchProfile();
  };

  // Loading state
  if (isLoadingProfile) {
    return <Loader />;
  }

  // Error state
  if (isError || !profile) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
        <p className="text-lg font-medium text-primary-foreground">
          Failed to load profile
        </p>
        <p className="mt-1 text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  const monthDifference = getMonthDifference(profile.joined);
  const currentLevel = getCurrentLevel(profile.level);

  return (
    <div className="w-full max-w-full space-y-6 overflow-x-hidden">
      <div className="w-full max-w-full overflow-hidden">
        <ProfileHeader
          profile={profile}
          isOwnProfile={true}
          onEdit={() => setShowEditProfile(true)}
          onShare={() => setShowShareProfile(true)}
        />
      </div>

      <div className="w-full max-w-full">
        <ProfileStats profile={profile} monthDifference={monthDifference} />
      </div>

      <div className="grid w-full max-w-full gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="w-full max-w-full overflow-x-hidden lg:order-2 lg:col-span-1">
          <ProfileSidebar
            profile={profile}
            isOwnProfile={true}
            onAccountSettings={() => setShowAccountSettings(true)}
          />
        </div>

        <div className="w-full max-w-full space-y-4 overflow-x-hidden lg:order-1 lg:col-span-2">
          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="w-full max-w-full overflow-x-hidden">
            {activeTab === "basic-details" && (
              <BasicDetails
                profile={profile}
                userLog={userLog}
                isLoading={isLoadingLog}
                isOwnProfile={true}
                onSaveInterestGroups={handleSaveInterestGroups}
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
                isOwnProfile={true}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        open={showEditProfile}
        onOpenChange={setShowEditProfile}
        profile={profile}
        onSave={handleSaveProfile}
      />
      <ShareProfileModal
        open={showShareProfile}
        onOpenChange={setShowShareProfile}
        muid={profile.muid}
        isPublic={profile.is_public}
      />
      <EditInterestGroupsModal
        open={showEditInterestGroups}
        onOpenChange={setShowEditInterestGroups}
        currentGroups={profile.interest_groups}
        onSave={handleSaveInterestGroups}
      />
      <AccountSettingsModal
        open={showAccountSettings}
        onOpenChange={setShowAccountSettings}
      />
    </div>
  );
}
