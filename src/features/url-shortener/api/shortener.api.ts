import { ApiError, apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  type AnalyticsData,
  AnalyticsDataSchema,
  AnalyticsResponseSchema,
  GenericMutationResponseSchema,
  type ShortUrlListData,
  ShortUrlListResponseSchema,
} from "../schemas/shortener.schema";

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
  try {
    const res = await apiClient.get(
      endpoints.urlShortener.analytics(id),
      AnalyticsResponseSchema,
    );

    return res.response;
  } catch (error) {
    // A URL with no clicks yet isn't an error — the backend returns 400/404
    // with "No records found". Treat that as an empty (zero-value) dataset so
    // the analytics page renders zeros instead of a failure screen.
    if (error instanceof ApiError) {
      const noRecords =
        error.status === 404 ||
        (error.status === 400 && /no records found/i.test(error.message ?? ""));
      if (noRecords) {
        return AnalyticsDataSchema.parse({});
      }
    }
    throw error;
  }
}
