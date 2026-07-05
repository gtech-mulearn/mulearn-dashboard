"use client";

import { Spinner } from "@/components/ui/spinner";
import { StateDisplay } from "@/components/ui/state-display";
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
    users,
    isLoading,
    isError,
    searchQuery,
    setSearchQuery,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useSearchUsers();

  const loadMoreRef = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    hasMore: !!hasNextPage,
    isLoading: isFetchingNextPage,
  });

  return (
    <>
      {/* Search Input and Tabs */}
      <div className="mb-6 flex flex-col gap-4 items-start">
        <div className="flex-1 w-full">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search learners by name, skill, or role..."
          />
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
      ) : users.length === 0 && !isLoading ? (
        <StateDisplay variant="no-results" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user, index) => (
              <UserSearchCard
                key={user.muid || user.id || `user-${index}`}
                user={user}
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
