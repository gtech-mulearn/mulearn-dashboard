/**
 * Start Learning Tab Component
 *
 * 📍 src/features/mujourney/components/StartLearningTab.tsx
 *
 * Shows foundational tasks across 7 levels
 */

"use client";

import type { GetUserLevelsResponse, Task, UserLevelData } from "../schemas";
import { LevelCard } from "./LevelCard";

interface StartLearningTabProps {
  filter?: string;
  levelsData?: GetUserLevelsResponse | null;
  isLoading?: boolean;
  error?: Error | null;
}

export function StartLearningTab({
  filter = "all",
  levelsData,
  isLoading,
  error,
}: StartLearningTabProps) {
  // Data comes from parent
  const data = levelsData;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading your journey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <p className="text-destructive">Failed to load levels</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!data?.response) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No levels available</p>
      </div>
    );
  }

  // Response is directly an array of levels
  const levels = data.response;

  // Filter out tasks with #cl- hashtags (expert/Interest Group tasks)
  // Start Learning Tab: EXCLUDE tasks containing #cl- in their hashtag
  const foundationLevels = levels
    .map((level: UserLevelData) => ({
      ...level,
      tasks: (level.tasks || []).filter((task: Task) => {
        const hashtag = task.hashtag || "";
        const isFoundationTask = !hashtag.includes("#cl-");

        // Apply completion filter
        if (filter === "completed") {
          return isFoundationTask && task.completed;
        } else if (filter === "incomplete") {
          return isFoundationTask && !task.completed;
        }
        return isFoundationTask;
      }),
    }))
    .filter((level: UserLevelData) => (level.tasks || []).length > 0); // Remove empty levels

  return (
    <div className="space-y-10">
      {foundationLevels.map((level, index) => {
        // All levels are always unlocked - no locking logic needed
        // Tasks show completed status via task.completed field

        // Use level name and index for unique key
        const uniqueKey = `${level.name}-${index}`;

        return <LevelCard key={uniqueKey} level={level} isLocked={false} />;
      })}

      {foundationLevels.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No foundation tasks available</p>
        </div>
      )}
    </div>
  );
}
