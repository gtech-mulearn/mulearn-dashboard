"use client";

import { AlertCircle } from "lucide-react";
import {
  SearchInput,
  UserSearchCard,
  useSearchMentors,
  useInfiniteScroll,
} from "@/features/search";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search Mentors</h1>
        <p className="mt-1 text-gray-500">
          Find mentors by expertise and interest areas
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Only public profiles are shown. Users can control their privacy
          settings in their profile.
        </AlertDescription>
      </Alert>

      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search mentors by name, expertise, or interest..."
        isLoading={isLoading}
      />

      <div className="space-y-4">
        {searchQuery.length < 2 && (
          <p className="text-center text-gray-500">
            Enter at least 2 characters to search
          </p>
        )}

        {isError && (
          <p className="text-center text-red-500">
            Failed to load results. Please try again.
          </p>
        )}

        {data?.data.length === 0 && searchQuery.length >= 2 && !isLoading && (
          <p className="text-center text-gray-500">No mentors found</p>
        )}

        {data?.data.map((mentor) => (
          <UserSearchCard key={mentor.id} user={mentor} />
        ))}

        {hasNextPage && <div ref={loadMoreRef} className="h-10" />}

        {isLoading && searchQuery.length >= 2 && (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#0961F5]" />
          </div>
        )}
      </div>
    </div>
  );
}
