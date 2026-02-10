"use client";

import { SearchInput } from "./SearchInput";
import { UserSearchCard } from "./UserSearchCard";
import { useSearchMentors } from "../hooks";
import { useInfiniteScroll } from "../hooks";

export function MentorsSearchClient() {
  const {
    data,
    isLoading,
    isError,
    searchQuery,
    setSearchQuery,
    setPage,
    hasNextPage,
  } = useSearchMentors();

  const loadMoreRef = useInfiniteScroll({
    onLoadMore: () => setPage((p) => p + 1),
    hasMore: hasNextPage,
    isLoading,
  });

  return (
    <>
      {/* Search Input */}
      <div className="rounded-2xl bg-card backdrop-blur-sm p-6 shadow-lg border border-border">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search mentors by name, expertise, or interest..."
          isLoading={isLoading}
        />
      </div>

      {/* Results */}
      <div>
        {searchQuery.length < 3 && (
          <div className="rounded-2xl bg-card backdrop-blur-sm p-12 shadow-lg border border-border text-center">
            <p className="text-muted-foreground">
              Enter at least 3 characters to search
            </p>
          </div>
        )}

        {isError && (
          <div className="rounded-2xl bg-destructive/10 backdrop-blur-sm p-12 shadow-lg border border-destructive/20 text-center">
            <p className="text-destructive">
              Failed to load results. Please try again.
            </p>
          </div>
        )}

        {data?.data.length === 0 && searchQuery.length >= 3 && !isLoading && (
          <div className="rounded-2xl bg-card backdrop-blur-sm p-12 shadow-lg border border-border text-center">
            <p className="text-muted-foreground">No mentors found</p>
          </div>
        )}

        {searchQuery.length >= 3 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data?.data.map((mentor) => (
                <UserSearchCard key={mentor.id || mentor.muid} user={mentor} />
              ))}
            </div>

            {hasNextPage && <div ref={loadMoreRef} className="h-10" />}
          </>
        )}

        {isLoading && searchQuery.length >= 3 && (
          <div className="flex justify-center py-8">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-accent" />
          </div>
        )}
      </div>
    </>
  );
}
