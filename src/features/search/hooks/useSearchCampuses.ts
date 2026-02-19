"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { searchCampuses } from "../api";
import type { SearchType } from "../schemas";

export function useSearchCampuses(
  initialQuery = "",
  initialSearchType?: SearchType,
) {
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<SearchType | undefined>(
    initialSearchType,
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const query = useInfiniteQuery({
    queryKey: ["search-campuses", debouncedQuery, searchType],
    queryFn: ({ pageParam = 1 }) =>
      searchCampuses({
        search: debouncedQuery,
        pageIndex: pageParam,
        perPage: 30,
        searchType,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
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
