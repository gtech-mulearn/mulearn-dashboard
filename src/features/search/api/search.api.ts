import { apiClient } from "@/api";
import { endpoints } from "@/api/endpoints";
import {
  userSearchResponseSchema,
  campusSearchResponseSchema,
  type UserSearchResponse,
  type CampusSearchResponse,
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
): Promise<UserSearchResponse> {
  const searchParams = new URLSearchParams({
    search: params.search,
    pageIndex: String(params.pageIndex ?? 1),
    perPage: String(params.perPage ?? 30),
  });

  const response = await apiClient.get(
    `${endpoints.search.students}?${searchParams}`,
    userSearchResponseSchema,
  );

  return response;
}

export async function searchMentors(
  params: SearchParams,
): Promise<UserSearchResponse> {
  const searchParams = new URLSearchParams({
    search: params.search,
    pageIndex: String(params.pageIndex ?? 1),
    perPage: String(params.perPage ?? 30),
  });

  const response = await apiClient.get(
    `${endpoints.search.mentors}?${searchParams}`,
    userSearchResponseSchema,
  );

  return response;
}

export async function searchCampuses(
  params: CampusSearchParams,
): Promise<CampusSearchResponse> {
  const searchParams = new URLSearchParams({
    search: params.search,
    pageIndex: String(params.pageIndex ?? 1),
    perPage: String(params.perPage ?? 30),
    ...(params.searchType && { searchType: params.searchType }),
  });

  const response = await apiClient.get(
    `${endpoints.search.campuses}?${searchParams}`,
    campusSearchResponseSchema,
  );

  return response;
}
