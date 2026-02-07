"use client";

import { AlertCircle } from "lucide-react";
import {
  SearchInput,
  UserSearchCard,
  useSearchMentors,
  useInfiniteScroll,
} from "@/features/search";

export default function MentorsSearchPage() {
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
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-block rounded-full bg-accent/20 px-4 py-1.5 text-sm font-medium text-accent-foreground">
            Connect With Mentors
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Let's Find Mentors
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Discover mentors by expertise and interest areas
          </p>
        </div>

        {/* Disclaimer */}
        <div className="rounded-2xl bg-card backdrop-blur-sm p-6 shadow-lg border border-border">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-accent mt-0.5" />
            <p className="text-sm text-card-foreground">
              Only public profiles are shown. Users can control their privacy
              settings in their profile.
            </p>
          </div>
        </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.data.map((mentor) => (
              <UserSearchCard key={mentor.id || mentor.muid} user={mentor} />
            ))}
          </div>

          {hasNextPage && <div ref={loadMoreRef} className="h-10" />}

          {isLoading && searchQuery.length >= 3 && (
            <div className="flex justify-center py-8">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-accent" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
