"use client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { triggerCsvDownload, zonalApi } from "../api";
import type { CollegeListParams, SortState, StudentListParams } from "../types";

type SortBy<T extends string> = T | `-${T}`;

// ── Query keys ─────────────────────────────────────────────────────────────
export const zonalKeys = {
  all: ["zonal"] as const,
  zoneDetails: () => [...zonalKeys.all, "zone-details"] as const,
  topDistricts: () => [...zonalKeys.all, "top-districts"] as const,
  studentLevels: () => [...zonalKeys.all, "student-levels"] as const,
  students: (p: StudentListParams) =>
    [...zonalKeys.all, "students", p] as const,
  colleges: (p: CollegeListParams) =>
    [...zonalKeys.all, "colleges", p] as const,
};

// ── 1. Zone Details ────────────────────────────────────────────────────────
// apiClient unwraps response → returns { zone, rank, zonal_lead, ... } directly
export function useZoneDetails() {
  return useQuery({
    queryKey: zonalKeys.zoneDetails(),
    queryFn: zonalApi.getZoneDetails,
    select: (res) => res,
  });
}

// ── 2. Top Districts ───────────────────────────────────────────────────────
// apiClient unwraps response → returns [ { district, rank, karma }, ... ] directly
export function useTopDistricts() {
  return useQuery({
    queryKey: zonalKeys.topDistricts(),
    queryFn: zonalApi.getTopDistricts,
    select: (res) => (Array.isArray(res) ? res : []),
  });
}

// ── 3. Student Levels ──────────────────────────────────────────────────────
// apiClient unwraps response → returns [ { level_order, students_count }, ... ] directly
export function useStudentLevels() {
  return useQuery({
    queryKey: zonalKeys.studentLevels(),
    queryFn: zonalApi.getStudentLevels,
    select: (res) => {
      const levels = Array.isArray(res) ? res : [];
      return [...levels].sort((a, b) => a.level_order - b.level_order);
    },
  });
}

// ── 4. Student Details (paginated) ────────────────────────────────────────
// apiClient unwraps response → returns { data: [...], pagination?: {...} } directly
export function useStudentDetails(params: StudentListParams = {}) {
  return useQuery({
    queryKey: zonalKeys.students(params),
    queryFn: () => zonalApi.getStudentDetails(params),
    placeholderData: keepPreviousData,
    select: (res) => {
      const data = res?.data ?? [];
      return {
        data,
        pagination: res?.pagination ?? {
          count: data.length,
          totalPages: 1,
          isNext: false,
          isPrev: false,
        },
      };
    },
  });
}

// ── 5. College Details (paginated) ────────────────────────────────────────
// apiClient unwraps response → returns { data: [...], pagination?: {...} } directly
export function useCollegeDetails(params: CollegeListParams = {}) {
  return useQuery({
    queryKey: zonalKeys.colleges(params),
    queryFn: () => zonalApi.getCollegeDetails(params),
    placeholderData: keepPreviousData,
    select: (res) => {
      const data = res?.data ?? [];
      return {
        data,
        pagination: res?.pagination ?? {
          count: data.length,
          totalPages: 1,
          isNext: false,
          isPrev: false,
        },
      };
    },
  });
}

// ── 6. CSV Downloads (imperative, not queries) ─────────────────────────────
export function useStudentCsvDownload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const download = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const blob = await zonalApi.downloadStudentCsv();
      triggerCsvDownload(blob, "Zonal Student Details.csv");
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Download failed"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { download, isLoading, error };
}

export function useCollegeCsvDownload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const download = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const blob = await zonalApi.downloadCollegeCsv();
      triggerCsvDownload(blob, "Zonal College Details.csv");
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Download failed"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { download, isLoading, error };
}

// ── 7. Table state: pagination + sort + search ────────────────────────────
export function useTableState<TSortField extends string>(
  defaultSort: SortState<TSortField>,
  defaultPerPage = 20,
) {
  const [pageIndex, setPageIndex] = useState(1);
  const [perPage] = useState(defaultPerPage);
  const [search, setSearchRaw] = useState("");
  const [sort, setSort] = useState<SortState<TSortField>>(defaultSort);

  const setSearch = useCallback((value: string) => {
    setSearchRaw(value);
    setPageIndex(1);
  }, []);

  const toggleSort = useCallback((field: TSortField) => {
    setSort((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    setPageIndex(1);
  }, []);

  const sortBy =
    `${sort.direction === "desc" ? "-" : ""}${sort.field}` as SortBy<TSortField>;

  return {
    pageIndex,
    perPage,
    search,
    sort,
    sortBy,
    setPage: setPageIndex,
    setSearch,
    toggleSort,
  };
}
