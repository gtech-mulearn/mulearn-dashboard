import { apiClient } from "@/api";
import { endpoints } from "@/api/endpoints";
import {
  type CampusSearchData,
  type CampusSearchResult,
  campusSearchResponseSchema,
  type SearchType,
  type UserSearchData,
  userSearchResponseSchema,
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

  try {
    // Always fetch both college and school results in parallel
    const [collegeResponse, schoolResponse] = await Promise.allSettled([
      apiClient.get(
        `${endpoints.search.colleges}?${searchParams}`,
        campusSearchResponseSchema,
      ),
      apiClient.get(
        `${endpoints.search.schools}?${searchParams}`,
        campusSearchResponseSchema,
      ),
    ]);

    // Extract data from both responses
    const collegeData =
      collegeResponse.status === "fulfilled"
        ? collegeResponse.value.response.data
        : [];
    const schoolData =
      schoolResponse.status === "fulfilled"
        ? schoolResponse.value.response.data
        : [];

    // Merge results from both APIs
    let mergedData: CampusSearchResult[] = [...collegeData, ...schoolData];

    // Filter results based on searchType if specified
    if (params.searchType === "school") {
      mergedData = schoolData;
    } else if (params.searchType === "college") {
      mergedData = collegeData;
    }
    // For "name", "code", "zone", or undefined - show all results (already merged)

    // Get pagination from the first successful response
    const pagination =
      collegeResponse.status === "fulfilled"
        ? collegeResponse.value.response.pagination
        : schoolResponse.status === "fulfilled"
          ? schoolResponse.value.response.pagination
          : { page: 1, perPage: 30, total: 0, totalPages: 1 };

    return {
      data: mergedData,
      pagination: {
        ...pagination,
        total: mergedData.length,
        totalPages: Math.ceil(mergedData.length / (pagination.perPage || 30)),
      },
    };
  } catch (error) {
    console.error("Error fetching campus data:", error);
    throw error;
  }
}
