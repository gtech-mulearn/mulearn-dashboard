/**
 * Interest Groups Grid Component
 *
 * 📍 src/features/interest-groups/components/interest-groups-grid.tsx
 *
 * Grid layout for displaying interest groups with beautiful gradient variations.
 */

"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import { SearchInput } from "@/features/search/components/SearchInput";
import { InterestGroupCard } from "./interest-group-card";
import type { InterestGroup } from "../schemas/interest-groups.schema";

type InterestGroupsGridProps = {
  groups: InterestGroup[];
  isLoading?: boolean;
};

// Beautiful gradient combinations using global CSS variables
const gradients = [
  "bg-gradient-to-br from-primary via-primary/80 to-primary/60",
  "bg-gradient-to-br from-[var(--chart-1)] via-[var(--chart-2)] to-[var(--chart-3)]",
  "bg-gradient-to-br from-[var(--chart-2)] via-[var(--chart-3)] to-[var(--chart-4)]",
  "bg-gradient-to-br from-[var(--chart-3)] via-[var(--chart-4)] to-[var(--chart-5)]",
  "bg-gradient-to-br from-[var(--chart-5)] via-[var(--chart-1)] to-[var(--chart-2)]",
  "bg-gradient-to-br from-[var(--chart-4)] via-[var(--chart-5)] to-[var(--chart-1)]",
  "bg-gradient-to-br from-primary/90 via-accent to-primary/70",
  "bg-gradient-to-br from-[var(--chart-1)] via-primary to-[var(--chart-5)]",
];

export function InterestGroupsGrid({
  groups,
  isLoading,
}: InterestGroupsGridProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter groups based on search
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search interest groups..."
        isLoading={isLoading}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
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

      {/* Empty State */}
      {!isLoading && filteredGroups.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-muted/30 py-20">
          <div className="rounded-full bg-muted p-4">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
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

      {/* Grid */}
      {!isLoading && filteredGroups.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group, index) => (
            <InterestGroupCard
              key={group.id}
              group={group}
              gradient={gradients[index % gradients.length]}
            />
          ))}
        </div>
      )}

      {/* Results Count */}
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
