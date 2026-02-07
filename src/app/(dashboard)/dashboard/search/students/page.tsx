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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-600">
            Discover Students
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Let's Find Students
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Connect with students by name, interest groups, or organization
          </p>
        </div>

        {/* Disclaimer */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-lg border border-gray-100">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <p className="text-sm text-gray-700">
              Only public profiles are shown. Users can control their privacy
              settings in their profile.
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-lg border border-gray-100">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search students by name, interest, or organization..."
            isLoading={isLoading}
          />
        </div>

        {/* Results */}
        <div>
          {searchQuery.length < 2 && (
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-12 shadow-lg border border-gray-100 text-center">
              <p className="text-gray-600">
                Enter at least 2 characters to search
              </p>
            </div>
          )}

          {isError && (
            <div className="rounded-2xl bg-red-50/80 backdrop-blur-sm p-12 shadow-lg border border-red-100 text-center">
              <p className="text-red-600">
                Failed to load results. Please try again.
              </p>
            </div>
          )}

          {data?.data.length === 0 && searchQuery.length >= 2 && !isLoading && (
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-12 shadow-lg border border-gray-100 text-center">
              <p className="text-gray-600">No students found</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.data.map((user) => (
              <UserSearchCard key={user.id} user={user} />
            ))}
          </div>

          {/* Infinite Scroll Trigger */}
          {hasNextPage && <div ref={loadMoreRef} className="h-10" />}

          {isLoading && searchQuery.length >= 2 && (
            <div className="flex justify-center py-8">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
