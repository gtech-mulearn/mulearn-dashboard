import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { getApiResponseError } from "@/hooks/use-get-error";
import { ApiResponseSchema } from "@/lib/schemas/api-response";
import { useDebounce } from "./use-debounce";

export interface UserResult {
  id: string;
  full_name: string;
  muid: string;
  profile_pic?: string | null;
}

const UserResultSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  muid: z.string(),
  profile_pic: z.string().nullable().optional(),
});

const SearchResponseSchema = ApiResponseSchema(
  z.object({
    data: z.array(UserResultSchema),
  }),
);

const EMPTY_EXCLUDED: string[] = [];

export interface SearchOptions {
  excludedMuids?: string[];
  endpoint?: string;
  queryParam?: "search" | "q";
}

export function useSearch(options: SearchOptions | string[] = EMPTY_EXCLUDED) {
  const excludedMuids = Array.isArray(options)
    ? options
    : (options.excludedMuids ?? []);
  const endpoint =
    !Array.isArray(options) && options.endpoint
      ? options.endpoint
      : endpoints.search.users;
  const queryParam =
    !Array.isArray(options) && options.queryParam
      ? options.queryParam
      : "search";

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
      [queryParam]: debouncedQuery.trim(),
    });

    if (endpoint === endpoints.search.users) {
      params.append("perPage", "15");
      params.append("pageIndex", "1");
      params.append("sortBy", "");
    }

    apiClient
      .get(`${endpoint}?${params}`, SearchResponseSchema)
      .then((response) => {
        if (!cancelled) {
          const users = response.response.data ?? [];
          setResults(users.filter((u) => !stableExcluded.includes(u.muid)));
        }
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error(
            getApiResponseError(error, { fallback: "Search failed" }),
          );
          setResults((prev) => (prev.length === 0 ? prev : []));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, stableExcluded, endpoint, queryParam]);

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
