import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  type AnalyticsData,
  AnalyticsResponseSchema,
  GenericMutationResponseSchema,
  type ShortUrlListData,
  ShortUrlListResponseSchema,
} from "../schemas/shortner.schema";

interface ShortUrlListParams {
  pageIndex: number;
  perPage: number;
  search?: string;
  sortBy?: string;
}

export async function fetchShortUrls(
  params: ShortUrlListParams,
): Promise<ShortUrlListData> {
  const query = new URLSearchParams({
    perPage: String(params.perPage),
    pageIndex: String(params.pageIndex),
  });

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.sortBy?.trim()) {
    query.set("sortBy", params.sortBy.trim());
  }

  const response = await apiClient.get(
    `${endpoints.urlShortener.list}?${query.toString()}`,
    ShortUrlListResponseSchema,
  );

  return response.response;
}

export interface CreateShortUrlPayload {
  title: string;
  long_url: string;
  short_url?: string;
}

export async function createShortUrl(
  payload: CreateShortUrlPayload,
): Promise<void> {
  await apiClient.post(
    endpoints.urlShortener.create,
    payload,
    GenericMutationResponseSchema,
  );
}

export async function updateShortUrl(
  id: string,
  payload: Partial<CreateShortUrlPayload>,
): Promise<void> {
  await apiClient.put(
    endpoints.urlShortener.edit(id),
    payload,
    GenericMutationResponseSchema,
  );
}

export async function deleteShortUrl(id: string): Promise<void> {
  await apiClient.delete(
    endpoints.urlShortener.delete(id),
    GenericMutationResponseSchema,
  );
}

export async function fetchShortUrlAnalytics(
  id: string,
): Promise<AnalyticsData> {
  const res = await apiClient.get(
    endpoints.urlShortener.analytics(id),
    AnalyticsResponseSchema,
  );

  return res.response;
}
