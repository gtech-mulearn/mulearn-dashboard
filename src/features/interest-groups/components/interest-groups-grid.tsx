/**
 * Interest Groups Grid Component
 *
 * 📍 src/features/interest-groups/components/interest-groups-grid.tsx
 *
 * Grid layout for displaying interest groups with beautiful gradient variations.
 */

"use client";

import { useMemo, useState } from "react";
import { StateDisplay } from "@/components/ui/state-display";
import { SearchInput } from "@/features/search/components/SearchInput";
import { pickCardGradient } from "@/lib/card-gradients";
import type { InterestGroup } from "../schemas/interest-groups.schema";
import { InterestGroupCard } from "./interest-group-card";

type InterestGroupsGridProps = {
  groups: InterestGroup[];
  isLoading?: boolean;
};

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
        <StateDisplay
          variant="no-results"
          className="rounded-3xl border-2 border-dashed border-border bg-muted/30"
          description={
            searchQuery ? undefined : "Check back later for new groups"
          }
        />
      )}

      {!isLoading && filteredGroups.length > 0 && (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredGroups.map((group) => (
            <InterestGroupCard
              key={group.id}
              group={group}
              gradient={`bg-linear-to-br ${pickCardGradient(group.id)}`}
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
