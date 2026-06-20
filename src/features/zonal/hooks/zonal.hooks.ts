"use client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import { triggerCsvDownload, zonalApi } from "../api";
import type { CollegeListParams, SortState, StudentListParams } from "../types";

type SortBy<T extends string> = T | `-${T}`;

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

export function useZoneDetails() {
  return useQuery({
    queryKey: zonalKeys.zoneDetails(),
    queryFn: zonalApi.getZoneDetails,
    select: (res) => res,
  });
}

export function useTopDistricts() {
  return useQuery({
    queryKey: zonalKeys.topDistricts(),
    queryFn: zonalApi.getTopDistricts,
    select: (res) => (Array.isArray(res) ? res : []),
  });
}

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

export function useStudentCsvDownload() {
  const [isLoading, setIsLoading] = useState(false);

  const download = useCallback(async () => {
    setIsLoading(true);
    try {
      const blob = await zonalApi.downloadStudentCsv();
      triggerCsvDownload(blob, "Zonal Student Details.csv");
    } catch (err) {
      toast.error(
        getApiResponseError(err, {
          fallback: "Failed to download student CSV",
        }),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { download, isLoading };
}

export function useCollegeCsvDownload() {
  const [isLoading, setIsLoading] = useState(false);

  const download = useCallback(async () => {
    setIsLoading(true);
    try {
      const blob = await zonalApi.downloadCollegeCsv();
      triggerCsvDownload(blob, "Zonal College Details.csv");
    } catch (err) {
      toast.error(
        getApiResponseError(err, {
          fallback: "Failed to download college CSV",
        }),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { download, isLoading };
}

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
