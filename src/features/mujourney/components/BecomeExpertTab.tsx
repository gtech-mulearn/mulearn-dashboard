"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import { updateInterestGroups } from "@/features/profile/api/profile.api";
import { EditInterestGroupsModal } from "@/features/profile/components/edit-interest-groups-modal";
import { usePublicTasks } from "@/features/tasks/hooks";
import { mujourneyKeys } from "../hooks/query-keys";
import type {
  GetUserLevelsResponse,
  InterestGroup,
  InterestGroupsResponse,
  Task,
  UserLevelData,
} from "../schemas/mujourney.schemas";
import { LevelCard } from "./LevelCard";

const FETCH_ALL_SIZE = 500;

interface BecomeExpertTabProps {
  filter?: string;
  levelsData?: GetUserLevelsResponse | null;
  igData?: InterestGroupsResponse | null;
  isLoading?: boolean;
  error?: Error | null;
  isAuthenticated?: boolean;
}

export function BecomeExpertTab({
  filter = "all",
  levelsData,
  igData,
  isLoading,
  error,
  isAuthenticated,
}: BecomeExpertTabProps) {
  const [selectedIG, setSelectedIG] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const interestGroups = igData?.response?.aois || [];

  const handleToggleIG = (igId: string) => {
    setSelectedIG((prev) => (prev === igId ? null : igId));
  };

  const handleSaveIGs = async (groupIds: string[]) => {
    await updateInterestGroups(groupIds);

    // Immediately reflect the saved selection in the cache so the pills
    // update without waiting for a round-trip.
    const savedAois = interestGroups.filter((ig) => groupIds.includes(ig.id));
    queryClient.setQueryData(mujourneyKeys.interestGroups(), {
      hasError: false,
      statusCode: 200,
      message: null,
      response: { aois: savedAois },
    });

    // Force an immediate background refetch to sync with the server.
    queryClient.refetchQueries({ queryKey: mujourneyKeys.interestGroups() });

    // Clear any active pill filter so it can't point at a removed IG.
    setSelectedIG(null);
  };

  // Adapt mujourney IGs to the shape EditInterestGroupsModal expects
  const currentGroupsForModal = interestGroups.map((ig: InterestGroup) => ({
    id: ig.id,
    name: ig.name,
    karma: 0,
    level: { unit: "level", count: 1 } as { unit: string; count: number },
  }));

  const { data: mentorData } = usePublicTasks({
    pageIndex: 1,
    perPage: FETCH_ALL_SIZE,
    task_source: "ig_mentor",
  });

  const mentorTasks = useMemo<Task[]>(() => {
    return (mentorData?.data ?? []).map((task) => ({
      task_name: task.title,
      task_description: task.description ?? "",
      karma: task.karma,
      hashtag: task.hashtag,
      completed: false,
      active: task.active,
      discord_link: task.discord_link,
      level: task.level,
      interest_group: task.ig ? { id: task.ig, name: task.ig } : undefined,
      submission_channel: task.channel ? { name: task.channel } : undefined,
    }));
  }, [mentorData]);

  const expertLevels = useMemo(() => {
    const map = new Map<string, UserLevelData>();

    const addTask = (
      task: Task,
      isAlreadyExpert: boolean,
      levelHint?: string | null,
    ) => {
      const isExpertTask =
        isAlreadyExpert || (task.hashtag || "").includes("#cl-");
      if (!isExpertTask) return;

      const matchesIG = selectedIG
        ? task.interest_group?.id === selectedIG
        : true;
      if (!matchesIG) return;

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

    (levelsData?.response ?? []).forEach((level: UserLevelData) => {
      (level.tasks || []).forEach((task: Task) => {
        addTask(task, false, level.name);
      });
    });
    mentorTasks.forEach((task) => {
      addTask(task, true, (task as { level?: string | null }).level);
    });

    return Array.from(map.values())
      .map((level) => ({
        ...level,
        tasks: Array.from(
          new Map(
            (level.tasks || []).map((task: Task) => [task.hashtag, task]),
          ).values(),
        ),
      }))
      .filter((level) => (level.tasks || []).length > 0)
      .sort((a, b) => {
        const numA = parseInt(a.name.match(/\d+/)?.[0] ?? "0", 10);
        const numB = parseInt(b.name.match(/\d+/)?.[0] ?? "0", 10);
        return numA - numB;
      });
  }, [levelsData, selectedIG, filter, mentorTasks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-bold">
              Advanced Interest Group Tasks
            </h2>
            <p className="text-muted-foreground mt-1">
              Complete specialized tasks in your interest groups
            </p>
          </div>
          {isAuthenticated && !isLoading && (
            <button
              type="button"
              onClick={() => setEditModalOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20 shrink-0"
              title="Edit interest groups"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* IG Pills */}
      {!isLoading && interestGroups.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {interestGroups.map((ig: InterestGroup) => {
            const isActive = selectedIG === ig.id;
            return (
              <button
                key={ig.id}
                type="button"
                onClick={() => handleToggleIG(ig.id)}
                className={`rounded-full border-2 px-4 py-1.5 text-sm font-medium transition-all ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-primary/40 bg-primary/5 text-foreground hover:border-primary hover:bg-primary/10"
                }`}
              >
                {ig.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <p className="text-destructive">Failed to load tasks</p>
            {process.env.NODE_ENV === "development" && (
              <p className="text-sm text-muted-foreground">{error.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Levels Display */}
      {!isLoading &&
        !error &&
        (expertLevels.length > 0 ? (
          <div className="space-y-10">
            {expertLevels.map((level: UserLevelData) => (
              <LevelCard key={level.name} level={level} isLocked={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {interestGroups.length === 0
                ? isAuthenticated
                  ? "You haven't joined any interest groups yet"
                  : "Please log in to view interest group tasks"
                : "No expert tasks available for this interest group"}
            </p>
          </div>
        ))}

      {/* Edit Modal */}
      <EditInterestGroupsModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        currentGroups={currentGroupsForModal}
        onSave={handleSaveIGs}
      />
    </div>
  );
}
