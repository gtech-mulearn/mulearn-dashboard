/**
 * Become Expert Tab Component
 *
 * 📍 src/features/mujourney/components/BecomeExpertTab.tsx
 *
 * Shows Interest Group specific tasks (#cl- hashtags)
 * Uses the SAME endpoint as Start Learning Tab, filters by #cl- hashtags
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authStore } from "@/lib/auth";
import { useStartLearning } from "../hooks";
import type { Task } from "../schemas/mujourney.schemas";
import { InterestGroupsResponseSchema } from "../schemas/mujourney.schemas";
import { TaskList } from "./TaskList";

interface BecomeExpertTabProps {
  filter?: string;
}

export function BecomeExpertTab({ filter = "all" }: BecomeExpertTabProps) {
  const isAuthenticated = !!authStore.getAccessToken();
  const [selectedIG, setSelectedIG] = useState<string>("");

  // Fetch interest groups
  const { data: igData, isLoading: igLoading } = useQuery({
    queryKey: ["interest-groups"],
    queryFn: () =>
      apiClient.get(
        endpoints.onboarding.areasOfInterest,
        InterestGroupsResponseSchema,
      ),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Use the SAME endpoint as Start Learning Tab
  const {
    data: levelsData,
    isLoading: tasksLoading,
    error,
  } = useStartLearning();

  // Auto-select first IG if authenticated
  useEffect(() => {
    if (
      igData?.response?.interestGroup &&
      igData.response.interestGroup.length > 0 &&
      selectedIG === ""
    ) {
      setSelectedIG(igData.response.interestGroup[0].id);
    }
  }, [igData, selectedIG]);

  const interestGroups = igData?.response?.interestGroup || [];

  // Extract all tasks from all levels and filter for #cl- hashtags
  const expertTasks = useMemo(() => {
    if (!levelsData?.response) return [];

    const levels = levelsData.response;
    const allTasks: Task[] = [];

    // Collect all tasks from all levels
    levels.forEach((level) => {
      if (level.tasks && Array.isArray(level.tasks)) {
        allTasks.push(...level.tasks);
      }
    });

    // Filter ONLY #cl- tasks (Interest Group specific tasks)
    // Become Expert Tab: INCLUDE only tasks containing #cl- in their hashtag
    const filtered = allTasks.filter((task) => {
      const hashtag = task.hashtag || "";
      const isExpertTask = hashtag.includes("#cl-");

      // Apply completion filter
      if (filter === "completed") {
        return isExpertTask && task.completed;
      } else if (filter === "incomplete") {
        return isExpertTask && !task.completed;
      }
      return isExpertTask;
    });

    // Deduplicate tasks by hashtag (same task can appear in multiple levels)
    const uniqueTasks = Array.from(
      new Map(filtered.map((task) => [task.hashtag, task])).values(),
    );

    // If an IG is selected, further filter by interest group
    if (selectedIG && uniqueTasks.length > 0) {
      return uniqueTasks.filter(
        (task) => task.interest_group?.id === selectedIG,
      );
    }

    return uniqueTasks;
  }, [levelsData, selectedIG, filter]);

  return (
    <div className="space-y-6">
      {/* Header with IG Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Interest Group Tasks</h2>
          <p className="text-muted-foreground mt-1">
            Complete specialized tasks in your interest groups
          </p>
        </div>

        {!igLoading && interestGroups.length > 0 && (
          <Select value={selectedIG} onValueChange={setSelectedIG}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select Interest Group" />
            </SelectTrigger>
            <SelectContent>
              {interestGroups.map((ig) => (
                <SelectItem key={ig.id} value={ig.id}>
                  {ig.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Loading State */}
      {(igLoading || tasksLoading) && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <p className="text-red-600 dark:text-red-400">
              Failed to load tasks
            </p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        </div>
      )}

      {/* Tasks Display */}
      {!igLoading && !tasksLoading && !error && (
        <>
          {expertTasks.length > 0 ? (
            <TaskList tasks={expertTasks} />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {selectedIG
                  ? "No expert tasks available for this interest group"
                  : "Select an interest group to view tasks"}
              </p>
            </div>
          )}
        </>
      )}

      {/* No IGs Available */}
      {!igLoading && interestGroups.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {isAuthenticated
              ? "You haven't joined any interest groups yet"
              : "Please log in to view interest group tasks"}
          </p>
        </div>
      )}
    </div>
  );
}
