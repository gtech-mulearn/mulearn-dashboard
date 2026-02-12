"use client";

import { Loader2 } from "lucide-react";
import { UserSearchCard } from "./UserSearchCard";
import { CampusSearchCard } from "./CampusSearchCard";
import type { UserSearchResult, CampusSearchResult } from "../schemas";

interface BaseSearchResultsProps {
  searchQuery: string;
  isLoading: boolean;
  isError: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement>;
  hasNextPage: boolean;
}

interface UserSearchResultsProps extends BaseSearchResultsProps {
  type: "user";
  data: UserSearchResult[] | undefined;
}

interface CampusSearchResultsProps extends BaseSearchResultsProps {
  type: "campus";
  data: CampusSearchResult[] | undefined;
}

type SearchResultsProps = UserSearchResultsProps | CampusSearchResultsProps;

export function SearchResults({
  searchQuery,
  isLoading,
  isError,
  data,
  loadMoreRef,
  hasNextPage,
  type,
}: SearchResultsProps) {
  return (
    <div className="space-y-4">
      {/* Minimum query length message */}
      {searchQuery.length < 3 && (
        <p className="text-center text-muted-foreground">
          Enter at least 3 characters to search
        </p>
      )}

      {/* Error state */}
      {isError && (
        <p className="text-center text-destructive">
          Failed to load results. Please try again.
        </p>
      )}

      {/* Empty state */}
      {data?.length === 0 && searchQuery.length >= 3 && !isLoading && (
        <p className="text-center text-muted-foreground">
          No {type === "user" ? "users" : "campuses"} found
        </p>
      )}

      {/* Results */}
      {data?.map((item) =>
        type === "user" ? (
          <UserSearchCard key={item.id} user={item as UserSearchResult} />
        ) : (
          <CampusSearchCard key={item.id} campus={item as CampusSearchResult} />
        ),
      )}

      {/* Infinite scroll trigger */}
      {hasNextPage && <div ref={loadMoreRef} className="h-10" />}

      {/* Loading indicator */}
      {isLoading && searchQuery.length >= 3 && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
