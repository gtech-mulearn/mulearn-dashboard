import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { GetOrganizationsResponseSchema } from "../schemas/college.schema";

interface GetCollegesParams {
  pageIndex: number;
  perPage: number;
  search?: string;
  sortBy?: string;
}

export async function fetchColleges(params: GetCollegesParams) {
  const query = new URLSearchParams({
    pageIndex: String(params.pageIndex),
    perPage: String(params.perPage),
  });

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.sortBy?.trim()) {
    query.set("sortBy", params.sortBy.trim());
  }

  const response = await apiClient.get(
    `${endpoints.collegeLevels.collegeList}?${query.toString()}`,
    GetOrganizationsResponseSchema,
  );

  return response.response;
}
