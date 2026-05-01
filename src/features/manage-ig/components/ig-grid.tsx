"use client";

import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import Loader from "@/app/loading";
import type { InterestGroup } from "@/features/interest-groups/schemas";
import { SearchInput } from "@/features/search/components/SearchInput";
import { InterestGroupCard } from "./ig-card";

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
        <div className="flex flex-col items-center justify-center py-20">
          <Loader />
        </div>
      )}

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

      {!isLoading && filteredGroups.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredGroups.map((group) => (
            <InterestGroupCard key={group.id} group={group} />
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
