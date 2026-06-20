/**
 * Public User Journey Page (Client Component)
 *
 * View another user's public journey
 */

"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { JourneyHeader, LevelCard } from "@/features/mujourney";
import { useUserJourney } from "@/features/mujourney/hooks";

interface PublicUserJourneyPageClientProps {
  muid: string;
}

export function PublicUserJourneyPageClient({
  muid,
}: PublicUserJourneyPageClientProps) {
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
          <p className="text-destructive">Failed to load journey</p>
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

  const { full_name, levels } = data.response;

  return (
    <div className="space-y-8">
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
