/**
 * Public User Journey Page
 *
 * 📍 src/app/(dashboard)/mujourney/[muid]/page.tsx
 *
 * View another user's public journey
 */

"use client";

import { use } from "react";
import { useUserJourney } from "@/features/mujourney/hooks";
import { JourneyHeader, LevelCard } from "@/features/mujourney";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PublicUserJourneyPage({
  params,
}: {
  params: Promise<{ muid: string }>;
}) {
  const { muid } = use(params);
  const { data, isLoading, error } = useUserJourney(muid);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="text-muted-foreground">Loading journey...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.response) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-red-600 dark:text-red-400">
            Failed to load journey
          </p>
          <p className="text-sm text-muted-foreground">
            {error?.message || "User journey not found"}
          </p>
          <Button asChild>
            <Link href="/mujourney">Back to MuJourney</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { full_name, current_level, total_karma, levels } = data.response;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link href="/mujourney" className="gap-2">
          <ArrowLeft className="size-4" />
          Back to MuJourney
        </Link>
      </Button>

      {/* Header */}
      <JourneyHeader
        title={`${full_name}'s Journey`}
        subtitle={`MUID: ${muid}`}
        currentLevel={current_level}
        totalKarma={total_karma}
        showProgress={true}
      />

      {/* Levels */}
      <div className="space-y-8">
        {levels.map((level, index) => (
          <LevelCard
            key={level.name || `level-${index}`}
            level={level}
            isLocked={false}
          />
        ))}
      </div>
    </div>
  );
}
