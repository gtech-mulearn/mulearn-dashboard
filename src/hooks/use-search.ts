import * as React from "react";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { useDebounce } from "./use-debounce";

export interface UserResult {
  id: string;
  full_name: string;
  muid: string;
  profile_pic?: string | null;
}

const EMPTY_EXCLUDED: string[] = [];

export function useSearch(excludedMuids: string[] = EMPTY_EXCLUDED) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<UserResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const debouncedQuery = useDebounce(query, 300);

  // Serialize and stabilize excludedMuids to prevent reference changes from triggering useEffect
  const serializedExcluded = excludedMuids.join(",");
  // biome-ignore lint/correctness/useExhaustiveDependencies: serializedExcluded is the actual value dependency for stable array recreation
  const stableExcluded = React.useMemo(() => {
    return [...excludedMuids];
  }, [serializedExcluded]);

  React.useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults((prev) => (prev.length === 0 ? prev : []));
      setIsLoading((prev) => (prev ? false : prev));
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
          setResults(users.filter((u) => !stableExcluded.includes(u.muid)));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResults((prev) => (prev.length === 0 ? prev : []));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, stableExcluded]);

  const handleSearch = React.useCallback((val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setResults((prev) => (prev.length === 0 ? prev : []));
    }
  }, []);

  const clearResults = React.useCallback(() => {
    setQuery("");
    setResults((prev) => (prev.length === 0 ? prev : []));
  }, []);

  return { query, results, isLoading, handleSearch, clearResults };
}
