/**
 * Learning Circle List Page
 *
 * 📍 src/app/(dashboard)/dashboard/learning-circle/page.tsx
 *
 * Main page showing all learning circles.
 */

"use client";

import { Loader2 } from "lucide-react";
import { CircleList, CreateCircleModal } from "@/features/learning-circle";
import { useInterestGroupsList, useUserProfile } from "@/features/profile";

export default function LearningCirclePage() {
  // Fetch interest groups and user profile for the create form
  const { data: igData, isLoading: igLoading } = useInterestGroupsList();
  const { data: profile, isLoading: profileLoading } = useUserProfile();

  // Transform interest groups for the modal component
  const interestGroups =
    igData?.interestGroup?.map((ig) => ({
      id: ig.id,
      name: ig.name,
    })) || [];

  // Use the user's college from their profile as the default organization
  // The org field is pre-filled and read-only
  const userOrganization =
    profile?.college_id && profile?.college_code
      ? [{ id: profile.college_id, title: profile.college_code }]
      : [];

  const isFormDataLoading = igLoading || profileLoading;
  const hasUserOrg = userOrganization.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learning Circles</h1>
          <p className="mt-1 text-sm text-gray-500">
            Join or create learning circles to collaborate with others
          </p>
        </div>
        {isFormDataLoading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading form data...</span>
          </div>
        ) : !hasUserOrg ? (
          <div className="text-sm text-amber-600">
            Please link a college to your profile to create learning circles
          </div>
        ) : (
          <CreateCircleModal
            interestGroups={interestGroups}
            organizations={userOrganization}
          />
        )}
      </div>

      {/* Circle List */}
      <CircleList />
    </div>
  );
}
