/**
 * Mentor Profile Page
 *
 * 📍 src/features/mentor/profile/components/mentor-profile-page.tsx
 *
 * Root component for the Mentor Profile. Rendered when the logged-in user
 * is an APPROVED mentor. Provides a toggle to fall back to the learner view.
 *
 * Data strategy:
 *   - useMentorProfile()          → mentor-specific fields (bio, expertise, tier, etc.)
 *   - useUserProfile()            → learner fields (avatar, name, muid, cover, etc.)
 *   - useMentorSessions()         → session list for Sessions tab and stats
 *   - useMentorTasks(pending)     → pending task count for stats row
 */

"use client";

import { useState } from "react";
import Loader from "@/app/loading";
import { useMentorSessions } from "@/features/home/hooks";
import { useMentorProfile } from "@/features/mentor/onboarding/hooks/use-onboarding";
import { useMentorTasks } from "@/features/mentor/tasks/hooks/use-mentor-tasks";
import { useUserProfile } from "@/features/profile";
import { ShareProfileModal } from "@/features/profile/components/share-profile-modal";
import { MentorEditProfileModal } from "./mentor-edit-profile-modal";
import { deriveMentorType, MentorProfileHeader } from "./mentor-profile-header";
import { MentorProfileSidebar } from "./mentor-profile-sidebar";
import {
  type MentorProfileTab,
  MentorProfileTabs,
} from "./mentor-profile-tabs";
import { MentorStatsRow } from "./mentor-stats-row";
import { AboutTab } from "./tabs/about-tab";
import { ActivityTab } from "./tabs/activity-tab";
import { AvailabilityTab } from "./tabs/availability-tab";
import { MenteesTab } from "./tabs/mentees-tab";
import { ScopesTab } from "./tabs/scopes-tab";
import { SessionsTab } from "./tabs/sessions-tab";

interface MentorProfilePageProps {
  /** Called when the user clicks "Switch to Learner View" */
  onSwitchToLearner: () => void;
}

export function MentorProfilePage({
  onSwitchToLearner,
}: MentorProfilePageProps) {
  const [activeTab, setActiveTab] = useState<MentorProfileTab>("about");
  const [showEdit, setShowEdit] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // Data hooks
  const {
    data: userProfile,
    isLoading: loadingUser,
    refetch: refetchUser,
  } = useUserProfile();

  const {
    data: mentorProfile,
    isLoading: loadingMentor,
    refetch: refetchMentor,
  } = useMentorProfile();

  const { data: scheduledSessions, isLoading: loadingSessions } =
    useMentorSessions("SCHEDULED");

  const { data: pendingTasksData } = useMentorTasks({
    approval_status: "pending",
    perPage: 100,
  });
  const pendingTasks = pendingTasksData?.data;

  const isLoading = loadingUser || loadingMentor;

  if (isLoading) return <Loader />;

  if (!userProfile || !mentorProfile) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 px-4 text-center">
        <p className="text-lg font-medium">Failed to load mentor profile</p>
        <p className="text-sm text-muted-foreground">
          Please try refreshing the page.
        </p>
      </div>
    );
  }

  const mentorType = deriveMentorType(mentorProfile);

  const handleSaved = () => {
    refetchUser();
    refetchMentor();
  };

  return (
    <div className="w-full max-w-full space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="w-full max-w-full overflow-hidden">
        <MentorProfileHeader
          userProfile={userProfile}
          mentorProfile={mentorProfile}
          onEdit={() => setShowEdit(true)}
          onShare={() => setShowShare(true)}
          onSwitchToLearner={onSwitchToLearner}
        />
      </div>

      {/* Stats Row */}
      <MentorStatsRow
        mentorProfile={mentorProfile}
        scheduledSessions={scheduledSessions}
        pendingTasks={pendingTasks}
        isLoading={loadingSessions}
      />

      {/* Main content + Sidebar */}
      <div className="grid w-full max-w-full gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Sidebar — right on large screens */}
        <div className="w-full max-w-full overflow-x-hidden lg:order-2 lg:col-span-1">
          <MentorProfileSidebar
            mentorProfile={mentorProfile}
            upcomingSessions={scheduledSessions}
            isLoading={loadingSessions}
          />
        </div>

        {/* Tabs + Content — left on large screens */}
        <div className="w-full max-w-full space-y-4 overflow-x-hidden lg:order-1 lg:col-span-2">
          <MentorProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="w-full max-w-full overflow-x-hidden">
            {activeTab === "about" && (
              <AboutTab mentorProfile={mentorProfile} />
            )}
            {activeTab === "scopes" && (
              <ScopesTab
                mentorProfile={mentorProfile}
                mentorType={mentorType}
              />
            )}
            {activeTab === "sessions" && (
              <SessionsTab
                sessions={scheduledSessions}
                isLoading={loadingSessions}
              />
            )}
            {activeTab === "availability" && <AvailabilityTab />}
            {activeTab === "mentees" && <MenteesTab />}
            {activeTab === "activity" && <ActivityTab />}
          </div>
        </div>
      </div>

      {/* Modals */}
      <MentorEditProfileModal
        open={showEdit}
        onOpenChange={setShowEdit}
        userProfile={userProfile}
        mentorProfile={mentorProfile}
        onSaved={handleSaved}
      />
      <ShareProfileModal
        open={showShare}
        onOpenChange={setShowShare}
        muid={userProfile.muid}
        isPublic={userProfile.is_public}
      />
    </div>
  );
}
