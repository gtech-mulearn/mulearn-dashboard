"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
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
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["search-campuses", debouncedQuery, searchType, page],
    queryFn: () =>
      searchCampuses({
        search: debouncedQuery,
        pageIndex: page,
        perPage: 30,
        searchType,
      }),
    enabled: debouncedQuery.length >= 3,
    staleTime: 5 * 60 * 1000,
  });

  return {
    data,
    isLoading: isLoading || searchQuery !== debouncedQuery,
    isError,
    error,
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    page,
    setPage,
    hasNextPage: data ? page < (data.pagination.totalPages ?? 0) : false,
  };
}
