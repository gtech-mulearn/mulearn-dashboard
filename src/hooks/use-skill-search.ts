import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { getApiResponseError } from "@/hooks/use-get-error";
import { ApiResponseSchema } from "@/lib/schemas/api-response";
import { useDebounce } from "./use-debounce";

export const SkillResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  description: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
});

export type SkillResult = z.infer<typeof SkillResultSchema>;

const SkillListResponseSchema = ApiResponseSchema(
  z.object({
    skills: z.array(SkillResultSchema),
  }),
);

const SkillCreateResponseSchema = ApiResponseSchema(SkillResultSchema);

/** Backend `code` is unique, max 20 chars, stored uppercase. */
export function deriveSkillCode(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 20)
    .replace(/_+$/g, "");
}

const EMPTY_EXCLUDED: string[] = [];

export interface SkillSearchOptions {
  /** Skill ids to hide from results (e.g. already selected) */
  excludedIds?: string[];
  /** Skill names to hide from results, case-insensitive (for name-based values) */
  excludedNames?: string[];
  /** Only return active skills (default true) */
  activeOnly?: boolean;
  /** Max results per query (default 15) */
  perPage?: number;
}

export function useSkillSearch({
  excludedIds = EMPTY_EXCLUDED,
  excludedNames = EMPTY_EXCLUDED,
  activeOnly = true,
  perPage = 15,
}: SkillSearchOptions = {}) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SkillResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  // True when the backend returned an exact (case-insensitive) name match,
  // including excluded ones — used to hide the "Create" option.
  const [hasExactMatch, setHasExactMatch] = React.useState(false);
  const debouncedQuery = useDebounce(query, 300);

  const serializedExcluded = `${excludedIds.join(",")}|${excludedNames.join(",")}`;
  // biome-ignore lint/correctness/useExhaustiveDependencies: serializedExcluded is the actual value dependency for stable recreation
  const isExcluded = React.useMemo(() => {
    const ids = new Set(excludedIds);
    const names = new Set(excludedNames.map((n) => n.trim().toLowerCase()));
    return (s: SkillResult) =>
      ids.has(s.id) || names.has(s.name.trim().toLowerCase());
  }, [serializedExcluded]);

  React.useEffect(() => {
    const term = debouncedQuery.trim();
    if (!term) {
      setResults((prev) => (prev.length === 0 ? prev : []));
      setHasExactMatch(false);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const params = new URLSearchParams({
      search: term,
      perPage: String(perPage),
      pageIndex: "1",
      sortBy: "name",
      isAsc: "true",
      activeOnly: String(activeOnly),
    });

    apiClient
      .get(`${endpoints.skills.list}?${params}`, SkillListResponseSchema)
      .then((response) => {
        if (cancelled) return;
        const skills = response.response.skills ?? [];
        const lower = term.toLowerCase();
        setHasExactMatch(skills.some((s) => s.name.toLowerCase() === lower));
        setResults(skills.filter((s) => !isExcluded(s)));
      })
      .catch((error) => {
        if (cancelled) return;
        toast.error(
          getApiResponseError(error, { fallback: "Skill search failed" }),
        );
        setResults((prev) => (prev.length === 0 ? prev : []));
        setHasExactMatch(false);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, isExcluded, activeOnly, perPage]);

  const handleSearch = React.useCallback((val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setResults((prev) => (prev.length === 0 ? prev : []));
      setHasExactMatch(false);
    }
  }, []);

  const clearResults = React.useCallback(() => {
    setQuery("");
    setResults((prev) => (prev.length === 0 ? prev : []));
    setHasExactMatch(false);
  }, []);

  /** Create a skill via POST /skill/create/ (admin only). Returns null on failure. */
  const createSkill = React.useCallback(
    async (name: string, code?: string): Promise<SkillResult | null> => {
      const trimmed = name.trim();
      const finalCode = (code ?? deriveSkillCode(trimmed)).trim();
      if (!trimmed || !finalCode) {
        toast.error("Skill name must contain letters or numbers");
        return null;
      }
      setIsCreating(true);
      try {
        const res = await apiClient.post(
          endpoints.skills.create,
          { name: trimmed.slice(0, 75), code: finalCode, is_active: true },
          SkillCreateResponseSchema,
        );
        toast.success(`Skill "${res.response.name}" created`);
        return res.response;
      } catch (error) {
        toast.error(
          getApiResponseError(error, { fallback: "Failed to create skill" }),
        );
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [],
  );

  // Results correspond to the current input (debounce caught up, fetch done).
  const isSettled = query === debouncedQuery && !isLoading;

  return {
    query,
    results,
    isLoading,
    isSettled,
    isCreating,
    hasExactMatch,
    handleSearch,
    clearResults,
    createSkill,
  };
}
