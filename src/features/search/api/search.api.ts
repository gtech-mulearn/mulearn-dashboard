import { apiClient } from "@/api";
import { endpoints } from "@/api/endpoints";
import {
  userSearchResponseSchema,
  campusSearchResponseSchema,
  type UserSearchData,
  type CampusSearchData,
  type SearchType,
} from "../schemas";

interface SearchParams {
  search: string;
  pageIndex?: number;
  perPage?: number;
}

interface CampusSearchParams extends SearchParams {
  searchType?: SearchType;
}

export async function searchUsers(
  params: SearchParams,
): Promise<UserSearchData> {
  const searchParams = new URLSearchParams({
    search: params.search,
    pageIndex: String(params.pageIndex ?? 1),
    perPage: String(params.perPage ?? 30),
  });

  const response = await apiClient.get(
    `/api/v1/dashboard/user/search/?${searchParams}`,
    userSearchResponseSchema,
  );

  return response.response;
}

export async function searchMentors(
  params: SearchParams,
): Promise<UserSearchData> {
  const searchParams = new URLSearchParams({
    search: params.search,
    role: "mentor",
    pageIndex: String(params.pageIndex ?? 1),
    perPage: String(params.perPage ?? 30),
  });

  const response = await apiClient.get(
    `/api/v1/dashboard/user/search/?${searchParams}`,
    userSearchResponseSchema,
  );

  return response.response;
}

export async function searchCampuses(
  params: CampusSearchParams,
): Promise<CampusSearchData> {
  const searchParams = new URLSearchParams({
    search: params.search,
    pageIndex: String(params.pageIndex ?? 1),
    perPage: String(params.perPage ?? 30),
  });

  // Determine endpoint based on searchType
  let endpoint: string = endpoints.search.colleges; // Changed type to string

  if (params.searchType === "school") {
    endpoint = endpoints.search.schools;
  } else if (params.searchType === "college") {
    endpoint = endpoints.search.colleges;
  }

  const response = await apiClient.get(
    `${endpoint}?${searchParams}`,
    campusSearchResponseSchema,
  );

  return response.response;
}
