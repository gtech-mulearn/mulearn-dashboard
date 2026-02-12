"use client";

import { useInfiniteScroll, useSearchUsers } from "../hooks";
import { SearchInput } from "./SearchInput";
import { SearchTabsClient } from "./SearchTabsClient";
import { UserSearchCard } from "./UserSearchCard";

const searchTabs = [
  { label: "Learners", href: "/dashboard/search/students" },
  { label: "Mentors", href: "/dashboard/search/mentors" },
  { label: "Campuses", href: "/dashboard/search/campuses" },
];

export function StudentsSearchClient() {
  const {
    data,
    isLoading,
    isError,
    searchQuery,
    setSearchQuery,
    setPage,
    hasNextPage,
  } = useSearchUsers();

  const loadMoreRef = useInfiniteScroll({
    onLoadMore: () => setPage((p) => p + 1),
    hasMore: hasNextPage,
    isLoading,
  });

  return (
    <>
      {/* Search Input and Tabs */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:w-auto">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search public profiles by name, skill, or role..."
            isLoading={isLoading}
          />
        </div>
        <div className="shrink-0">
          <SearchTabsClient tabs={searchTabs} />
        </div>
      </div>

      {/* Results */}
      {isError ? (
        <div className="text-center py-16">
          <p className="text-destructive text-lg">
            Failed to load results. Please try again.
          </p>
        </div>
      ) : data?.data.length === 0 && !isLoading ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No learners found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.data.map((user, index) => (
              <UserSearchCard
                key={user.muid || user.id || `user-${index}`}
                user={user}
              />
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
