"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { searchUsers } from "../api";

export function useSearchUsers(initialQuery = "") {
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);

  // Debounce search input (800ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1); // Reset to first page on new search
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["search-users", debouncedQuery, page],
    queryFn: () =>
      searchUsers({
        search: debouncedQuery,
        pageIndex: page,
        perPage: 30,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    data,
    isLoading: isLoading || searchQuery !== debouncedQuery,
    isError,
    error,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    hasNextPage: data ? page < (data.pagination.totalPages ?? 0) : false,
  };
}
