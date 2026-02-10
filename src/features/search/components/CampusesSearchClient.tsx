"use client";

import { SearchInput } from "./SearchInput";
import { CampusSearchCard } from "./CampusSearchCard";
import { useSearchCampuses } from "../hooks";
import { useInfiniteScroll } from "../hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CampusesSearchClient() {
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
    <>
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

        {searchQuery.length >= 3 && (
          <>
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
          </>
        )}

        {isLoading && searchQuery.length >= 3 && (
          <div className="flex justify-center py-8">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
          </div>
        )}
      </div>
    </>
  );
}
