"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { searchUsers } from "../api";
import { searchKeys } from "./query-keys";
import type { UserSearchData } from "../schemas";

export function useSearchUsers(initialQuery = "") {
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const debouncedQuery = useDebounce(searchQuery, 800);

  const query = useInfiniteQuery({
    queryKey: searchKeys.users(debouncedQuery),
    queryFn: ({ pageParam = 1 }) =>
      searchUsers({
        search: debouncedQuery,
        pageIndex: pageParam,
        perPage: 30,
      }),
    initialPageParam: 1,
    getNextPageParam: (
      lastPage: UserSearchData,
      allPages: UserSearchData[],
    ) => {
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
