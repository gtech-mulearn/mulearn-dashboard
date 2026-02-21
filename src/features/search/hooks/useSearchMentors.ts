"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { searchMentors } from "../api";
import type { UserSearchData } from "../schemas";
import { searchKeys } from "./query-keys";

export function useSearchMentors(initialQuery = "") {
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const debouncedQuery = useDebounce(searchQuery, 800);

  const query = useInfiniteQuery({
    queryKey: searchKeys.mentors(debouncedQuery),
    queryFn: ({ pageParam = 1 }) =>
      searchMentors({
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

  const mentors = useMemo(() => {
    const raw = query.data?.pages?.flatMap((p) => p.data) ?? [];
    return Array.from(new Map(raw.map((m) => [m.muid || m.id, m])).values());
  }, [query.data]);

  return {
    ...query,
    searchQuery,
    setSearchQuery,
    mentors,
  };
}
