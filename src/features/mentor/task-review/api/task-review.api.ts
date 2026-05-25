import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type { ReviewActionValues, ReviewItem } from "../schemas";
import { GenericResponseSchema, ReviewListResponseSchema } from "../schemas";

const OPT = { skipAuthRedirectOn403: true } as const;

interface ListParams {
  status?: string;
  page?: number;
  search?: string;
}

export async function fetchReviewQueue(params: ListParams = {}): Promise<{
  data: ReviewItem[];
  totalPages: number;
}> {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.page) q.set("page", String(params.page));
  if (params.search) q.set("search", params.search);

  const url =
    params.status || params.page || params.search
      ? `${endpoints.mentor.reviewQueue}?${q}`
      : endpoints.mentor.reviewQueue;

  const res = await apiClient.get(url, ReviewListResponseSchema, OPT);
  return {
    data: res.response.data,
    totalPages: res.response.pagination?.totalPages ?? 1,
  };
}

export async function reviewItem(
  kalId: string,
  data: ReviewActionValues,
): Promise<void> {
  await apiClient.patch(
    endpoints.mentor.reviewQueueItem(kalId),
    data,
    GenericResponseSchema,
    OPT,
  );
}
