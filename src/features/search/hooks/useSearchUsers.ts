"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { searchUsers } from "../api";

export function useSearchUsers(initialQuery = "") {
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Debounce search input (800ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const query = useInfiniteQuery({
    queryKey: ["search-users", debouncedQuery],
    queryFn: ({ pageParam = 1 }) =>
      searchUsers({
        search: debouncedQuery,
        pageIndex: pageParam,
        perPage: 30,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const total = lastPage.pagination.totalPages ?? 1;
      const nextPage = allPages.length + 1;
      return nextPage <= total ? nextPage : undefined;
    },

    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    searchQuery,
    setSearchQuery,

    // This is what your UI should use
    users: query.data?.pages?.flatMap((p) => p.data) ?? [],
  };
}
