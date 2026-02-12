/**
 * Profile Page
 *
 * 📍 src/app/(dashboard)/dashboard/profile/page.tsx
 *
 * User's own profile page with modals for editing.
 */

"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
  AccountSettingsModal,
  BasicDetails,
  EditInterestGroupsModal,
  EditProfileModal,
  KarmaHistory,
  MuVoyage,
  ProfileHeader,
  ProfileSidebar,
  ProfileStats,
  type ProfileTab,
  ProfileTabs,
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
  const handleSaveProfile = async (_data: {
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
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0961F5]" />
      </div>
    );
  }

  // Error state
  if (isError || !profile) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <p className="text-lg font-medium text-gray-900">
          Failed to load profile
        </p>
        <p className="mt-1 text-gray-500">Please try again later.</p>
      </div>
    );
  }

  const monthDifference = getMonthDifference(profile.joined);
  const currentLevel = getCurrentLevel(profile.level);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        isOwnProfile={true}
        onEdit={() => setShowEditProfile(true)}
        onShare={() => setShowShareProfile(true)}
      />

      {/* Stats */}
      <ProfileStats profile={profile} monthDifference={monthDifference} />

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Tabs and Content */}
        <div className="order-2 space-y-4 lg:order-1 lg:col-span-2">
          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="min-h-[300px]">
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
              <div className="rounded-2xl bg-white p-6 text-center shadow-sm sm:p-8">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <span className="text-2xl">🏆</span>
                </div>
                <p className="font-semibold text-gray-900">Coming Soon</p>
                <p className="mt-1 text-sm text-gray-500">
                  Achievements will be available in a future update.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Sidebar - Shows first on mobile */}
        <div className="order-1 lg:order-2 lg:col-span-1">
          <ProfileSidebar
            profile={profile}
            isOwnProfile={true}
            onAccountSettings={() => setShowAccountSettings(true)}
          />
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
