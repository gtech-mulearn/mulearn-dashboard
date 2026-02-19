"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { searchMentors } from "../api";

export function useSearchMentors(initialQuery = "") {
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const query = useInfiniteQuery({
    queryKey: ["search-mentors", debouncedQuery],
    queryFn: ({ pageParam = 1 }) =>
      searchMentors({
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
