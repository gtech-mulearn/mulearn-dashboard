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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search Campuses</h1>
        <p className="mt-1 text-gray-500">
          Find campuses by name, code, zone, or location
        </p>
      </div>

      <div className="flex gap-4">
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
          <SelectTrigger className="w-[180px]">
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
          <p className="text-center text-gray-500">No campuses found</p>
        )}

        {data?.data.map((campus) => (
          <CampusSearchCard key={campus.id} campus={campus} />
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
