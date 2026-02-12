"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { searchMentors } from "../api";

export function useSearchMentors(initialQuery = "") {
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["search-mentors", debouncedQuery, page],
    queryFn: () =>
      searchMentors({
        search: debouncedQuery,
        pageIndex: page,
        perPage: 30,
      }),
    staleTime: 5 * 60 * 1000,
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
