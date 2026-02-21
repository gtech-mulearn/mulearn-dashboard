"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { searchCampuses } from "../api";
import type { CampusSearchData, SearchType } from "../schemas";
import { searchKeys } from "./query-keys";

export function useSearchCampuses(
  initialQuery = "",
  initialSearchType?: SearchType,
) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<SearchType | undefined>(
    initialSearchType,
  );

  const debouncedQuery = useDebounce(searchQuery, 800);

  const query = useInfiniteQuery({
    queryKey: searchKeys.campuses(debouncedQuery, searchType),
    queryFn: ({ pageParam = 1 }) =>
      searchCampuses({
        search: debouncedQuery,
        pageIndex: pageParam,
        perPage: 30,
        searchType,
      }),
    initialPageParam: 1,
    getNextPageParam: (
      lastPage: CampusSearchData,
      allPages: CampusSearchData[],
    ) => {
      const total = lastPage.pagination.totalPages ?? 1;
      const nextPage = allPages.length + 1;
      return nextPage <= total ? nextPage : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });

  const campusesRaw = query.data?.pages?.flatMap((p) => p.data) ?? [];
  const campuses = Array.from(
    new Map(campusesRaw.map((c) => [c.id, c])).values(),
  );

  return {
    ...query,
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    campuses,
  };
}
