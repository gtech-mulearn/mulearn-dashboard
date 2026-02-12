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
import { InterestGroupsResponseSchema } from "../schemas/mujourney.schemas";
import { LevelCard } from "./LevelCard";

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

  // Filter levels to show only #cl- tasks (Interest Group specific tasks)
  // organized by level, similar to Start Learning Tab
  const expertLevels = useMemo(() => {
    if (!levelsData?.response) return [];

    const levels = levelsData.response;

    // Filter tasks within each level for #cl- hashtags and selected IG
    const filteredLevels = levels
      .map((level) => {
        const filteredTasks = (level.tasks || []).filter((task) => {
          const hashtag = task.hashtag || "";
          const isExpertTask = hashtag.includes("#cl-");

          // Filter by interest group if selected
          const matchesIG = selectedIG
            ? task.interest_group?.id === selectedIG
            : true;

          // Apply completion filter
          if (filter === "completed") {
            return isExpertTask && matchesIG && task.completed;
          } else if (filter === "incomplete") {
            return isExpertTask && matchesIG && !task.completed;
          }
          return isExpertTask && matchesIG;
        });

        // Deduplicate tasks by hashtag within each level
        const uniqueTasks = Array.from(
          new Map(filteredTasks.map((task) => [task.hashtag, task])).values(),
        );

        return {
          ...level,
          tasks: uniqueTasks,
        };
      })
      .filter((level) => (level.tasks || []).length > 0); // Remove empty levels

    return filteredLevels;
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

      {/* Levels Display */}
      {!igLoading &&
        !tasksLoading &&
        !error &&
        (expertLevels.length > 0 ? (
          <div className="space-y-10">
            {expertLevels.map((level, index) => {
              const uniqueKey = `${level.name}-${index}`;
              return (
                <LevelCard key={uniqueKey} level={level} isLocked={false} />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {selectedIG
                ? "No expert tasks available for this interest group"
                : "Select an interest group to view tasks"}
            </p>
          </div>
        ))}

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
