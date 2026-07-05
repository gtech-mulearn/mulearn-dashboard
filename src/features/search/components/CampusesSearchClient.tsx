"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { StateDisplay } from "@/components/ui/state-display";
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
      <div className="mb-6 flex flex-col gap-4 items-start">
        <div className="flex flex-col sm:flex-row flex-1 gap-2 sm:gap-4 w-full">
          <div className="flex-1 w-full">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search campuses by name, code, or role..."
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
            <SelectTrigger className="w-full sm:w-48">
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
        <div className="w-full shrink-0">
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
        <StateDisplay variant="no-results" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
