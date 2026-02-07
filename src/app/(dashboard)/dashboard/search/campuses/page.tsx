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
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-block rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
            Explore Campuses
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Let's Find Campuses
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Discover campuses by name, code, zone, or location
          </p>
        </div>

        {/* Search Section */}
        <div className="rounded-2xl bg-card backdrop-blur-sm p-6 shadow-lg border border-border">
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
              <SelectTrigger className="w-full sm:w-[180px] bg-card">
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
              <p className="text-muted-foreground">No campuses found</p>
            </div>
          )}

          <div className="space-y-4">
            {data?.data.map((campus) => (
              <div
                key={campus.id}
                className="rounded-2xl bg-card backdrop-blur-sm shadow-lg border border-border hover:shadow-xl transition-shadow"
              >
                <CampusSearchCard campus={campus} />
              </div>
            ))}
          </div>

          {hasNextPage && <div ref={loadMoreRef} className="h-10" />}

          {isLoading && searchQuery.length >= 3 && (
            <div className="flex justify-center py-8">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
