"use client";

import { SearchInput } from "./SearchInput";
import { SearchTabsClient } from "./SearchTabsClient";
import { CampusSearchCard } from "./CampusSearchCard";
import { useSearchCampuses } from "../hooks";
import { useInfiniteScroll } from "../hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const searchTabs = [
  { label: "Learners", href: "/dashboard/search/students" },
  { label: "Mentors", href: "/dashboard/search/mentors" },
  { label: "Campuses", href: "/dashboard/search/campuses" },
];

export function CampusesSearchClient() {
  const {
    data,
    isLoading,
    isError,
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    setPage,
    hasNextPage,
  } = useSearchCampuses();

  const loadMoreRef = useInfiniteScroll({
    onLoadMore: () => setPage((p) => p + 1),
    hasMore: hasNextPage,
    isLoading,
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
              isLoading={isLoading}
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
      {searchQuery.length < 3 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">
            Enter at least 3 characters to search
          </p>
        </div>
      ) : isError ? (
        <div className="text-center py-16">
          <p className="text-destructive text-lg">
            Failed to load results. Please try again.
          </p>
        </div>
      ) : data?.data.length === 0 && !isLoading ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No campuses found</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {data?.data.map((campus) => (
              <CampusSearchCard key={campus.id} campus={campus} />
            ))}
          </div>

          {hasNextPage && <div ref={loadMoreRef} className="h-10" />}

          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
            </div>
          )}
        </>
      )}
    </>
  );
}
