/**
 * Interest Groups Grid Component
 *
 * 📍 src/features/interest-groups/components/interest-groups-grid.tsx
 *
 * Grid layout for displaying interest groups with beautiful gradient variations.
 */

"use client";

import { Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { InterestGroupCard } from "./interest-group-card";
import type { InterestGroup } from "../schemas/interest-groups.schema";

type InterestGroupsGridProps = {
  groups: InterestGroup[];
  isLoading?: boolean;
};

// Beautiful gradient combinations for different interest groups
const gradients = [
  "bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700",
  "bg-gradient-to-br from-violet-600 via-purple-700 to-fuchsia-700",
  "bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-600",
  "bg-gradient-to-br from-rose-500 via-pink-600 to-purple-600",
  "bg-gradient-to-br from-amber-500 via-orange-600 to-red-600",
  "bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600",
  "bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700",
  "bg-gradient-to-br from-fuchsia-600 via-pink-600 to-rose-600",
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
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search interest groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-2xl border border-border bg-card px-12 py-4 text-base font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

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
