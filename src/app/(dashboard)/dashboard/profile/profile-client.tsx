/**
 * Profile Page (Client Component)
 *
 * User's own profile page with modals for editing.
 */

"use client";

import { Clock } from "lucide-react";
import { useState } from "react";
import Loader from "@/app/loading";
import { CompanyProfilePage } from "@/features/company-jobs/components";
import { useMentorOverview } from "@/features/mentor/hooks";
import {
  useMentorApplication,
  useMentorProfile,
} from "@/features/mentor/onboarding/hooks/use-onboarding";
import { MentorProfilePage } from "@/features/mentor/profile";
import {
  AccountSettingsModal,
  Achievements,
  Badges,
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
  useDeleteCoverPic,
  useEditableProfile,
  useEditCollege,
  useUpdateProfile,
  useUpdateProfileImage,
  useUploadCoverPic,
  useUserLevels,
  useUserLog,
  useUserProfile,
} from "@/features/profile";
import { ProjectsTab } from "@/features/projects";
import {
  type ChangeOrganizationFormValues,
  ChangeOrganizationRequestSchema,
} from "@/features/settings";
import { ROLES } from "@/lib/auth/roles";
import { useUIStore } from "@/stores/ui-store";

export function ProfilePageClient() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("basic-details");
  const [lastSavedDepartmentId, setLastSavedDepartmentId] = useState("");
  // Persisted toggle: "learner" = show standard learner view even if user is a mentor.
  // Stored in ui-store so it survives tab navigation and remounts.
  const { profileViewMode, setProfileViewMode } = useUIStore();
  const showLearnerView = profileViewMode === "learner";

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

  // Mentor status — only fetched to decide which view to render.
  // Uses the same hook the mentor onboarding flow already relies on.
  const isMentorRole = profile?.roles?.includes(ROLES.MENTOR) ?? false;
  const { data: mentorStatus } = useMentorApplication(isMentorRole);

  // Fetch overview to match Home page logic (if scopes > 0, they are verified)
  const { data: mentorOverview } = useMentorOverview(isMentorRole);
  const isVerifiedMentor =
    mentorStatus?.status === "APPROVED" ||
    (mentorOverview?.scopes?.length ?? 0) > 0;

  const { data: mentorProfile } = useMentorProfile(isVerifiedMentor);

  const isMentor =
    !showLearnerView &&
    profile?.roles.includes(ROLES.MENTOR) &&
    isVerifiedMentor;

  const updateProfileMutation = useUpdateProfile({ suppressErrorToast: true });
  const { data: editableProfile } = useEditableProfile();
  const changeOrganizationMutation = useEditCollege();
  const updateProfileImageMutation = useUpdateProfileImage();
  const uploadCoverPicMutation = useUploadCoverPic();
  const deleteCoverPicMutation = useDeleteCoverPic();
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
        dirtyFields.email ||
        dirtyFields.mobile ||
        dirtyFields.gender ||
        dirtyFields.dob ||
        dirtyFields.district_id ||
        dirtyFields.communities,
    );

    if (hasProfileUpdates) {
      const baseFullName =
        editableProfile?.full_name?.trim() || profile.full_name?.trim() || "";
      const finalFullName = data.full_name?.trim() || baseFullName;

      const baseEmail = editableProfile?.email?.trim() || profile.email || "";
      const baseMobile =
        editableProfile?.mobile?.trim() || profile.mobile || "";
      const baseGender =
        editableProfile?.gender?.trim() || profile.gender || "";
      const baseDob = editableProfile?.dob?.trim() || profile.dob || "";
      const baseDistrictId =
        editableProfile?.district?.id || profile.org_district_id || null;
      const baseCommunities = editableProfile?.communities ?? [];

      const profilePayload: UpdateProfileRequest = {
        full_name: finalFullName,
        email: data.email?.trim() || baseEmail,
        mobile: data.mobile?.trim() || baseMobile,
        gender: data.gender?.trim() || baseGender,
        dob: data.dob?.trim() || baseDob,
        district_id: dirtyFields.district_id
          ? data.district_id || null
          : baseDistrictId,
        communities: dirtyFields.communities
          ? (data.communities ?? [])
          : baseCommunities,
      };

      await updateProfileMutation.mutateAsync(profilePayload);
    }

    const shouldUpdateCollege = Boolean(
      dirtyFields.org_id || dirtyFields.department_id,
    );

    if (shouldUpdateCollege && data.org_id?.trim()) {
      const organizationPayload: ChangeOrganizationFormValues = {
        organization: data.org_id.trim(),
        department: data.department_id?.trim() || "",
      };
      const validatedOrganization =
        ChangeOrganizationRequestSchema.safeParse(organizationPayload);
      if (!validatedOrganization.success) {
        throw new Error("Invalid college details");
      }
      await changeOrganizationMutation.mutateAsync(validatedOrganization.data);
      setLastSavedDepartmentId(validatedOrganization.data.department);
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

  // Company users see the company profile, not the student layout
  if (profile.roles.includes(ROLES.COMPANY)) {
    return <CompanyProfilePage />;
  }

  // Mentor users see the mentor profile by default, with a toggle to switch back
  if (isMentor && mentorProfile) {
    return (
      <MentorProfilePage
        onSwitchToLearner={() => setProfileViewMode("learner")}
      />
    );
  }

  const monthDifference = getMonthDifference(profile.joined);
  const currentLevel = getCurrentLevel(profile.level);

  const isPendingMentor =
    !isVerifiedMentor && mentorStatus?.status === "PENDING";

  return (
    <div className="w-full max-w-full space-y-6 overflow-x-hidden">
      {isPendingMentor && !showLearnerView && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-amber-500/90 shadow-sm backdrop-blur-sm">
          <Clock className="h-5 w-5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Pending Verification</p>
            <p className="text-xs opacity-80">
              Your mentor application is currently under review by the team.
            </p>
          </div>
        </div>
      )}

      <div className="w-full max-w-full overflow-hidden">
        <ProfileHeader
          profile={profile}
          isOwnProfile={true}
          onEdit={() => setShowEditProfile(true)}
          onShare={() => setShowShareProfile(true)}
          onUploadCover={(file) => uploadCoverPicMutation.mutateAsync(file)}
          onDeleteCover={() => deleteCoverPicMutation.mutateAsync()}
          isCoverPending={
            uploadCoverPicMutation.isPending || deleteCoverPicMutation.isPending
          }
          onSwitchToMentor={
            profile?.roles.includes(ROLES.MENTOR) && isVerifiedMentor
              ? () => setProfileViewMode("mentor")
              : undefined
          }
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
            {activeTab === "badges" && (
              <Badges muid={profile.muid} isOwnProfile={true} />
            )}
            {activeTab === "projects" && (
              <ProjectsTab
                muid={profile.muid}
                ownerMuid={profile.muid}
                currentUserId={profile.id}
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
        fallbackDepartmentId={lastSavedDepartmentId}
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
