"use client";

import {
  SearchInput,
  CampusSearchCard,
  useSearchCampuses,
  useInfiniteScroll,
} from "@/features/search";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CampusesSearchPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-block rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-600">
            Explore Campuses
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Let's Find Campuses
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Discover campuses by name, code, zone, or location
          </p>
        </div>

        {/* Search Section */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-lg border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search campuses..."
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
              <SelectTrigger className="w-full sm:w-[180px] bg-white">
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
        </div>

        {/* Results */}
        <div className="space-y-6">
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
              <p className="text-gray-600">No campuses found</p>
            </div>
          )}

          <div className="space-y-4">
            {data?.data.map((campus) => (
              <div
                key={campus.id}
                className="rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <CampusSearchCard campus={campus} />
              </div>
            ))}
          </div>

          {hasNextPage && <div ref={loadMoreRef} className="h-10" />}

          {isLoading && searchQuery.length >= 2 && (
            <div className="flex justify-center py-8">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
