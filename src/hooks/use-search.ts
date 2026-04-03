import * as React from "react";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { useDebounce } from "./use-debounce";

export interface UserResult {
  id: string;
  full_name: string;
  muid: string;
}

export function useSearch(excludedMuids: string[] = []) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<UserResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const debouncedQuery = useDebounce(query, 300);

  React.useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const params = new URLSearchParams({
      search: debouncedQuery.trim(),
      perPage: "15",
      pageIndex: "1",
      sortBy: "",
    });

    apiClient
      .get<{ data: UserResult[] }>(`${endpoints.search.users}?${params}`)
      .then((response) => {
        if (!cancelled) {
          const users = response.data ?? [];
          setResults(users.filter((u) => !excludedMuids.includes(u.muid)));
        }
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, excludedMuids]);

  const handleSearch = React.useCallback((val: string) => {
    setQuery(val);
    if (!val.trim()) setResults([]);
  }, []);

  const clearResults = React.useCallback(() => {
    setQuery("");
    setResults([]);
  }, []);

  return { query, results, isLoading, handleSearch, clearResults };
}
