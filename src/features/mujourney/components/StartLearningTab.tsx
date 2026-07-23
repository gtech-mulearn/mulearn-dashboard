/**
 * Start Learning Tab Component
 *
 * 📍 src/features/mujourney/components/StartLearningTab.tsx
 *
 * Shows foundational tasks across 7 levels
 */

"use client";

import { useMemo } from "react";
import { StateDisplay } from "@/components/ui/state-display";
import { useAllPublicTasks } from "@/features/tasks/hooks";
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
  const data = levelsData;
  const levels = data?.response ?? [];

  // The user's own completion state, keyed by hashtag, so tasks merged in
  // below from the public catalog (which carries no per-user completion)
  // can be reconciled against what the user has actually completed.
  const completionByHashtag = useMemo(() => {
    const map = new Map<string, boolean>();
    levels.forEach((level: UserLevelData) => {
      (level.tasks || []).forEach((task: Task) => {
        if (task.hashtag) map.set(task.hashtag, Boolean(task.completed));
      });
    });
    return map;
  }, [levels]);

  const { data: companyData } = useAllPublicTasks({ task_source: "company" });
  const { data: campusData } = useAllPublicTasks({
    task_source: "campus_mentor",
  });

  const generalTasks = useMemo<Task[]>(() => {
    const raw = [...(companyData ?? []), ...(campusData ?? [])];
    return raw.map((task) => ({
      task_id: task.id,
      task_name: task.title,
      task_description: task.description ?? "",
      karma: task.karma,
      hashtag: task.hashtag,
      completed: completionByHashtag.get(task.hashtag) ?? false,
      active: task.active,
      discord_link: task.discord_link,
      level: task.level,
      interest_group: task.ig ? { name: task.ig } : undefined,
      submission_channel: task.channel ? { name: task.channel } : undefined,
    }));
  }, [companyData, campusData, completionByHashtag]);

  // Filter out tasks with #cl- (expert/Interest Group) or #evn (event) hashtags
  // Start Learning Tab: EXCLUDE tasks containing #cl- or starting with #evn
  const foundationLevels = useMemo(() => {
    const map = new Map<string, UserLevelData>();

    const addTask = (task: Task, levelHint?: string | null) => {
      const hashtag = task.hashtag || "";
      const isFoundationTask =
        !hashtag.includes("#cl-") && !hashtag.startsWith("#evn");
      if (!isFoundationTask) return;

      if (filter === "completed" && !task.completed) return;
      if (filter === "incomplete" && task.completed) return;

      const levelNumber = (levelHint || "").match(/\d+/)?.[0] ?? "1";
      const levelKey = `Lvl ${levelNumber}`;

      const existing = map.get(levelKey);
      if (existing) {
        existing.tasks = [...(existing.tasks || []), task];
      } else {
        map.set(levelKey, { name: levelKey, karma: 0, tasks: [task] });
      }
    };

    levels.forEach((level: UserLevelData) => {
      (level.tasks || []).forEach((task: Task) => {
        addTask(task, level.name);
      });
    });
    generalTasks.forEach((task) => {
      addTask(task, (task as { level?: string | null }).level);
    });

    return Array.from(map.values()).sort((a, b) => {
      const numA = parseInt(a.name.match(/\d+/)?.[0] ?? "0", 10);
      const numB = parseInt(b.name.match(/\d+/)?.[0] ?? "0", 10);
      return numA - numB;
    });
  }, [levels, filter, generalTasks]);

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
          {process.env.NODE_ENV === "development" && (
            <p className="text-sm text-muted-foreground">{error.message}</p>
          )}
        </div>
      </div>
    );
  }

  if (!data?.response && generalTasks.length === 0) {
    return <StateDisplay variant="no-tasks" />;
  }

  return (
    <div className="space-y-10">
      {foundationLevels.map((level, index) => {
        // All levels are always unlocked - no locking logic needed
        // Tasks show completed status via task.completed field

        // Use level name and index for unique key
        const uniqueKey = `${level.name}-${index}`;

        return <LevelCard key={uniqueKey} level={level} isLocked={false} />;
      })}

      {foundationLevels.length === 0 &&
        (filter === "completed" || filter === "incomplete" ? (
          <StateDisplay variant="no-results" />
        ) : (
          <StateDisplay variant="no-tasks" />
        ))}
    </div>
  );
}
