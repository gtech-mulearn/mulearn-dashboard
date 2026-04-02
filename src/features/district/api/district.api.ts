import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  DistrictCollegeDetailsResponseSchema,
  DistrictDetailsResponseSchema,
  DistrictStudentDetailsResponseSchema,
  DistrictStudentLevelResponseSchema,
  DistrictTopCampusResponseSchema,
  type DistrictCollegeDetailsData,
  type DistrictDetails,
  type DistrictStudentDetailsData,
  type DistrictStudentLevelItem,
  type DistrictTopCampusItem,
} from "../schemas";

// ============================================
// District Overview
// ============================================

export async function fetchDistrictDetails(): Promise<DistrictDetails> {
  const response = await apiClient.get(
    endpoints.district.details,
    DistrictDetailsResponseSchema,
  );
  return response.response;
}

export async function fetchDistrictTopCampus(): Promise<
  DistrictTopCampusItem[]
> {
  const response = await apiClient.get(
    endpoints.district.topCampus,
    DistrictTopCampusResponseSchema,
  );
  return response.response;
}

export async function fetchDistrictStudentLevel(): Promise<
  DistrictStudentLevelItem[]
> {
  const response = await apiClient.get(
    endpoints.district.studentLevel,
    DistrictStudentLevelResponseSchema,
  );
  return response.response;
}

// ============================================
// Students (Paginated)
// ============================================

export interface DistrictStudentDetailsParams {
  pageIndex: number;
  perPage: number;
  sortBy?: string;
  search?: string;
}

export async function fetchDistrictStudentDetails(
  params: DistrictStudentDetailsParams,
): Promise<DistrictStudentDetailsData> {
  const query = new URLSearchParams({
    pageIndex: String(params.pageIndex),
    perPage: String(params.perPage),
  });

  if (params.sortBy?.trim()) {
    query.set("sortBy", params.sortBy.trim());
  }

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  const response = await apiClient.get(
    `${endpoints.district.studentDetails}?${query.toString()}`,
    DistrictStudentDetailsResponseSchema,
  );

  return response.response;
}

export async function fetchDistrictStudentDetailsCsv(): Promise<Blob> {
  return apiClient.get<Blob>(endpoints.district.studentDetailsCsv, undefined, {
    responseType: "blob",
  });
}

// ============================================
// Colleges (Paginated)
// ============================================

export interface DistrictCollegeDetailsParams {
  pageIndex: number;
  perPage: number;
  sortBy?: string;
  search?: string;
}

export async function fetchDistrictCollegeDetails(
  params: DistrictCollegeDetailsParams,
): Promise<DistrictCollegeDetailsData> {
  const query = new URLSearchParams({
    pageIndex: String(params.pageIndex),
    perPage: String(params.perPage),
  });

  if (params.sortBy?.trim()) {
    query.set("sortBy", params.sortBy.trim());
  }

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  const response = await apiClient.get(
    `${endpoints.district.collegeDetails}?${query.toString()}`,
    DistrictCollegeDetailsResponseSchema,
  );

  return response.response;
}

export async function fetchDistrictCollegeDetailsCsv(): Promise<Blob> {
  return apiClient.get<Blob>(endpoints.district.collegeDetailsCsv, undefined, {
    responseType: "blob",
  });
}
