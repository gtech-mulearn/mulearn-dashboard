/**
 * Interest Groups Grid Component
 *
 * 📍 src/features/interest-groups/components/interest-groups-grid.tsx
 *
 * Grid layout for displaying interest groups with beautiful gradient variations.
 */

"use client";

import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { SearchInput } from "@/features/search/components/SearchInput";
import type { InterestGroup } from "../schemas/interest-groups.schema";
import { InterestGroupCard } from "./interest-group-card";

type InterestGroupsGridProps = {
  groups: InterestGroup[];
  isLoading?: boolean;
};

const gradients = [
  "bg-linear-to-br from-primary via-primary/80 to-primary/60",
  "bg-linear-to-br from-chart-1 via-chart-2 to-chart-3",
  "bg-linear-to-br from-chart-2 via-chart-3 to-chart-4",
  "bg-linear-to-br from-chart-3 via-chart-4 to-chart-5",
  "bg-linear-to-br from-chart-5 via-chart-1 to-chart-2",
  "bg-linear-to-br from-chart-4 via-chart-5 to-chart-1",
  "bg-linear-to-br from-primary/90 via-accent to-primary/70",
  "bg-linear-to-br from-chart-1 via-primary to-chart-5",
];

export function InterestGroupsGrid({
  groups,
  isLoading,
}: InterestGroupsGridProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGroups = useMemo(
    () =>
      groups.filter((group) =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [groups, searchQuery],
  );

  return (
    <div className="space-y-8">
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search interest groups..."
      />

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 sm:py-20">
          <div className="flex gap-2">
            <div className="h-3 w-3 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
            <div className="h-3 w-3 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
            <div className="h-3 w-3 animate-bounce rounded-full bg-primary" />
          </div>
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            Loading interest groups...
          </p>
        </div>
      )}

      {!isLoading && filteredGroups.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-muted/30 py-12 sm:py-20 px-4">
          <div className="rounded-full bg-muted p-3 sm:p-4">
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            No interest groups found
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery
              ? "Try adjusting your search"
              : "Check back later for new groups"}
          </p>
        </div>
      )}

      {!isLoading && filteredGroups.length > 0 && (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredGroups.map((group, index) => (
            <InterestGroupCard
              key={group.id}
              group={group}
              gradient={gradients[index % gradients.length]}
            />
          ))}
        </div>
      )}

      {!isLoading && filteredGroups.length > 0 && (
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Showing {filteredGroups.length} of {groups.length} interest group
            {groups.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
