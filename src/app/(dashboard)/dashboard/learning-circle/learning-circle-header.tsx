"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  CreateCircleModal,
  useMyPendingInvites,
  useUserCircles,
} from "@/features/learning-circle";
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

  const { data: invites } = useMyPendingInvites();
  const { data: userCirclesData } = useUserCircles();

  const interestGroups =
    igData?.interestGroup?.map((ig) => ({ id: ig.id, name: ig.name })) ?? [];

  const userOrganization =
    profile?.college_id && profile?.college_code
      ? [{ id: profile.college_id, title: profile.college_code }]
      : [];

  const joinedCircleIds = useMemo(() => {
    return new Set(userCirclesData?.map((c) => c.id) ?? []);
  }, [userCirclesData]);

  const activeInvitesCount = useMemo(() => {
    if (!invites) return 0;
    return invites.filter((inv) => {
      if (!inv.circle_id) return true;
      return !joinedCircleIds.has(inv.circle_id);
    }).length;
  }, [invites, joinedCircleIds]);

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
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        className="rounded-xl px-5 text-sm font-semibold border-border bg-card hover:bg-muted"
        asChild
      >
        <Link href="/dashboard/learning-circle/invites">
          Invites ({activeInvitesCount})
        </Link>
      </Button>
      <CreateCircleModal
        interestGroups={interestGroups}
        organizations={userOrganization}
      />
    </div>
  );
}
