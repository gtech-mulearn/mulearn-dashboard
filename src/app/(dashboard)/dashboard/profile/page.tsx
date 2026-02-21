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
  type EditProfileFormValues,
  EditProfileModal,
  KarmaHistory,
  MuVoyage,
  ProfileHeader,
  ProfileSidebar,
  ProfileStats,
  type ProfileTab,
  ProfileTabs,
  ShareProfileModal,
  type UpdateProfileRequest,
  updateInterestGroups,
  useChangeCollege,
  useEditableProfile,
  useUpdateProfile,
  useUpdateProfileImage,
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
  const updateProfileMutation = useUpdateProfile();
  const { data: editableProfile } = useEditableProfile();
  const changeCollegeMutation = useChangeCollege();
  const updateProfileImageMutation = useUpdateProfileImage();
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
  const handleSaveProfile = async (
    data: EditProfileFormValues,
    dirtyFields: Partial<Record<keyof EditProfileFormValues, boolean>>,
  ) => {
    if (!profile) return;

    const hasProfileUpdates = Boolean(
      dirtyFields.full_name ||
        dirtyFields.first_name ||
        dirtyFields.last_name ||
        dirtyFields.email ||
        dirtyFields.mobile ||
        dirtyFields.gender ||
        dirtyFields.dob ||
        dirtyFields.community,
    );

    if (hasProfileUpdates) {
      const existingFullName =
        profile.full_name || editableProfile?.full_name || "";
      const submittedFullName = data.full_name?.trim() || existingFullName;
      const [submittedFirstName, ...submittedLastNameParts] = submittedFullName
        .split(" ")
        .filter(Boolean);
      const firstName = submittedFirstName || "";
      const lastName = submittedLastNameParts.join(" ").trim();
      const fallbackCommunity = editableProfile?.communities?.[0];

      const profilePayload: UpdateProfileRequest = {
        first_name: firstName,
        last_name: lastName,
        full_name: submittedFullName,
        email:
          data.email?.trim() || editableProfile?.email || profile.email || "",
        mobile:
          data.mobile?.trim() ||
          editableProfile?.mobile ||
          profile.mobile ||
          "",
        gender:
          data.gender?.trim() ||
          editableProfile?.gender ||
          profile.gender ||
          "",
        dob: data.dob?.trim() || editableProfile?.dob || profile.dob || "",
        communities: data.community?.trim()
          ? [data.community.trim()]
          : fallbackCommunity
            ? [fallbackCommunity]
            : [],
      };

      await updateProfileMutation.mutateAsync(profilePayload);
    }

    const shouldUpdateCollege = Boolean(
      dirtyFields.org_id ||
        dirtyFields.department_id ||
        dirtyFields.country_id ||
        dirtyFields.state_id ||
        dirtyFields.district_id,
    );

    if (shouldUpdateCollege && data.org_id?.trim()) {
      await changeCollegeMutation.mutateAsync({
        org_id: data.org_id.trim(),
        department_id: data.department_id?.trim() || undefined,
      });
    }

    if (dirtyFields.profile_pic && data.profile_pic) {
      await updateProfileImageMutation.mutateAsync({
        profilePic: data.profile_pic,
        userId: profile.id,
      });
    }

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
