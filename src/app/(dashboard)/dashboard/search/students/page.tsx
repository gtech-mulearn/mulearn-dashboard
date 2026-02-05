"use client";

import { AlertCircle } from "lucide-react";
import {
  SearchInput,
  UserSearchCard,
  useSearchUsers,
  useInfiniteScroll,
} from "@/features/search";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function StudentsSearchPage() {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search Students</h1>
        <p className="mt-1 text-gray-500">
          Discover students by name, interest groups, or organization
        </p>
      </div>

      {/* Disclaimer */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Only public profiles are shown. Users can control their privacy
          settings in their profile.
        </AlertDescription>
      </Alert>

      {/* Search Input */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search students by name, interest, or organization..."
        isLoading={isLoading}
      />

      {/* Results */}
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
          <p className="text-center text-gray-500">No students found</p>
        )}

        {data?.data.map((user) => (
          <UserSearchCard key={user.id} user={user} />
        ))}

        {/* Infinite Scroll Trigger */}
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
