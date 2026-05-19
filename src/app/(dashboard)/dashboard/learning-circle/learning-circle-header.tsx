"use client";

import { AlertTriangle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { CreateCircleModal } from "@/features/learning-circle";
import { useInterestGroupsList, useUserProfile } from "@/features/profile";

export function LearningCircleHeader() {
  const {
    data: igData,
    isLoading: igLoading,
    isError: igError,
  } = useInterestGroupsList();
  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
  } = useUserProfile();

  const interestGroups =
    igData?.interestGroup?.map((ig) => ({ id: ig.id, name: ig.name })) ?? [];

  const userOrganization =
    profile?.college_id && profile?.college_code
      ? [{ id: profile.college_id, title: profile.college_code }]
      : [];

  const isFormDataLoading = igLoading || profileLoading;
  const hasError = igError || profileError;
  const hasUserOrg = userOrganization.length > 0;

  if (isFormDataLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Spinner className="h-4 w-4" />
        <span className="text-sm">Loading form data...</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm">Failed to load form data</span>
      </div>
    );
  }

  if (!hasUserOrg) {
    return (
      <div className="text-sm text-warning">
        Please link a college to your profile to create learning circles
      </div>
    );
  }

  return (
    <CreateCircleModal
      interestGroups={interestGroups}
      organizations={userOrganization}
    />
  );
}
