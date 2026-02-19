"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useInfiniteScroll, useSearchCampuses } from "../hooks";
import { CampusSearchCard } from "./CampusSearchCard";
import { SearchInput } from "./SearchInput";
import { SearchTabsClient } from "./SearchTabsClient";

const searchTabs = [
  { label: "Learners", href: "/dashboard/search/students" },
  { label: "Mentors", href: "/dashboard/search/mentors" },
  { label: "Campuses", href: "/dashboard/search/campuses" },
];

export function CampusesSearchClient() {
  const {
    campuses,
    isLoading,
    isError,
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useSearchCampuses();

  const loadMoreRef = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    hasMore: !!hasNextPage,
    isLoading: isFetchingNextPage,
  });

  return (
    <>
      {/* Search Section with Tabs */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        <div className="flex flex-1 gap-4 w-full">
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search public profiles by name, skill, or role..."
            />
          </div>
          <Select
            value={searchType}
            onValueChange={(value) =>
              setSearchType(
                value as "name" | "code" | "zone" | "school" | "college",
              )
            }
          >
            <SelectTrigger className="w-full sm:w-45">
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="code">Code</SelectItem>
              <SelectItem value="zone">Zone</SelectItem>
              <SelectItem value="school">School</SelectItem>
              <SelectItem value="college">College</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="shrink-0">
          <SearchTabsClient tabs={searchTabs} />
        </div>
      </div>

      {/* Results */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Spinner className="h-8 w-8" />
        </div>
      )}
      {isError ? (
        <div className="text-center py-16">
          <p className="text-destructive text-lg">
            Failed to load results. Please try again.
          </p>
        </div>
      ) : campuses.length === 0 && !isLoading ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No campuses found</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {campuses.map((campus) => (
              <CampusSearchCard
                key={campus.id || campus.code}
                campus={campus}
              />
            ))}
          </div>

          {hasNextPage && <div ref={loadMoreRef} className="h-10" />}

          {isFetchingNextPage && (
            <div className="flex justify-center py-8">
              <Spinner className="h-8 w-8" />
            </div>
          )}
        </>
      )}
    </>
  );
}
