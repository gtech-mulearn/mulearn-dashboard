"use client";

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  type DistrictCollegeDetailsParams,
  type DistrictStudentDetailsParams,
  fetchDistrictCollegeDetails,
  fetchDistrictCollegeDetailsCsv,
  fetchDistrictDetails,
  fetchDistrictStudentDetails,
  fetchDistrictStudentDetailsCsv,
  fetchDistrictStudentLevel,
  fetchDistrictTopCampus,
} from "../api";
import { districtKeys } from "./query-keys";

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

// ============================================
// Overview
// ============================================

export function useDistrictDetails() {
  return useQuery({
    queryKey: districtKeys.details(),
    queryFn: fetchDistrictDetails,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useDistrictTopCampus() {
  return useQuery({
    queryKey: districtKeys.topCampus(),
    queryFn: fetchDistrictTopCampus,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useDistrictStudentLevel() {
  return useQuery({
    queryKey: districtKeys.studentLevel(),
    queryFn: fetchDistrictStudentLevel,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ============================================
// Students (Paginated)
// ============================================

export function useDistrictStudentDetails(
  params: DistrictStudentDetailsParams,
) {
  return useQuery({
    queryKey: districtKeys.studentDetails(params),
    queryFn: () => fetchDistrictStudentDetails(params),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useDownloadDistrictStudentDetailsCsv() {
  return useMutation({
    mutationFn: fetchDistrictStudentDetailsCsv,
    onSuccess: (blob) => {
      downloadBlob(blob, "District Student Details.csv");
      toast.success("Downloaded district student details CSV");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to download district student details CSV",
        }),
      );
    },
  });
}

// ============================================
// Colleges (Paginated)
// ============================================

export function useDistrictCollegeDetails(
  params: DistrictCollegeDetailsParams,
) {
  return useQuery({
    queryKey: districtKeys.collegeDetails(params),
    queryFn: () => fetchDistrictCollegeDetails(params),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useDownloadDistrictCollegeDetailsCsv() {
  return useMutation({
    mutationFn: fetchDistrictCollegeDetailsCsv,
    onSuccess: (blob) => {
      downloadBlob(blob, "District College Details.csv");
      toast.success("Downloaded district college details CSV");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to download district college details CSV",
        }),
      );
    },
  });
}
