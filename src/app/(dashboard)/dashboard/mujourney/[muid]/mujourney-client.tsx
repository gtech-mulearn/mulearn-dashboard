/**
 * Public User Journey Page (Client Component)
 *
 * View another user's public journey.
 * Uses only the public journey endpoint; no task list merge.
 */

"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { JourneyHeader, LevelCard } from "@/features/mujourney";
import { usePublicUserJourney } from "@/features/mujourney/hooks";
import type { TaskListPublic } from "@/features/mujourney/schemas";

interface PublicUserJourneyPageClientProps {
  muid: string;
}

export function PublicUserJourneyPageClient({
  muid,
}: PublicUserJourneyPageClientProps) {
  const { data: journeyData, isLoading, error } = usePublicUserJourney(muid);

  // New format: response is an array of JourneyLevelSchema directly
  const levels = journeyData?.response ?? [];

  // Map legacy journey tasks to TaskListPublic shape for LevelCard compatibility
  const mappedLevels = useMemo(() => {
    // biome-ignore lint/suspicious/noExplicitAny: Legacy mapping
    return levels.map((level: any) => {
      const levelName = level.name || "General";
      // biome-ignore lint/suspicious/noExplicitAny: Legacy mapping
      const tasks: TaskListPublic[] = (level.tasks || []).map((task: any) => ({
        id: task.id || task.task_id || "",
        hashtag: task.hashtag || "",
        title: task.task_name || "Untitled Task",
        description: task.task_description || null,
        karma: task.karma || 0,
        channel: task.submission_channel?.name || null,
        discord_id: task.submission_channel?.discord_id || null,
        type: task.type || "regular",
        variable_karma: task.variable_karma || false,
        level: levelName,
        ig: task.interest_group?.name || null,
        event: task.event || null,
        event_id: task.event_id || null,
        completed: task.completed || false,
      }));

      return {
        name: levelName,
        tasks,
      };
    });
  }, [levels]);

  // Filter out empty levels
  const nonEmptyLevels = useMemo(
    () => mappedLevels.filter((level) => level.tasks.length > 0),
    [mappedLevels],
  );

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

  if (error || !journeyData?.response) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-destructive">Failed to load journey</p>
          <p className="text-sm text-muted-foreground">
            {error?.message || "User journey not found"}
          </p>
          <Button asChild>
            <Link href="/dashboard/mujourney">Back to MuJourney</Link>
          </Button>
        </div>
      </div>
    );
  }

  const displayName = decodeURIComponent(muid) || muid;

  return (
    <div className="space-y-8">
      <Button variant="ghost" asChild>
        <Link href="/dashboard/mujourney" className="gap-2">
          <ArrowLeft className="size-4" />
          Back to MuJourney
        </Link>
      </Button>

      <JourneyHeader title={`${displayName}'s Journey`} subtitle={``} />

      <div className="space-y-8">
        {nonEmptyLevels.length > 0 ? (
          nonEmptyLevels.map((level, index) => (
            <LevelCard
              key={level.name || `level-${index}`}
              name={level.name}
              tasks={level.tasks}
              isLocked={false}
            />
          ))
        ) : (
          <p className="text-muted-foreground">No tasks available yet.</p>
        )}
      </div>
    </div>
  );
}
