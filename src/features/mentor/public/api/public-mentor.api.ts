import { publicApiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  PublicMentorAvailabilityResponse,
  PublicMentorCard,
  PublicMentorSession,
} from "../schemas";
import {
  PublicMentorAvailabilityResponseSchema,
  PublicMentorCardResponseSchema,
  PublicMentorSessionsResponseSchema,
} from "../schemas";

export interface PublicMentorSessionsParams {
  ig_id?: string;
  mode?: "ONLINE" | "OFFLINE" | "HYBRID" | string;
  sort_by?: "starts_at" | "title" | string;
  pageIndex?: number;
  perPage?: number;
  search?: string;
}

export async function fetchPublicMentorCard(
  muid: string,
): Promise<PublicMentorCard> {
  const res = await publicApiClient.get(
    endpoints.mentor.publicCard(muid),
    PublicMentorCardResponseSchema,
  );
  return res.response;
}

export async function fetchPublicMentorSessions(
  muid: string,
  params: PublicMentorSessionsParams = {},
): Promise<{
  data: PublicMentorSession[];
  totalPages: number;
  totalItems: number;
}> {
  const q = new URLSearchParams();
  if (params.ig_id) q.set("ig_id", params.ig_id);
  if (params.mode) q.set("mode", params.mode);
  if (params.sort_by) q.set("sort_by", params.sort_by);
  if (params.pageIndex) q.set("pageIndex", String(params.pageIndex));
  if (params.perPage) q.set("perPage", String(params.perPage));
  if (params.search) q.set("search", params.search);

  const query = q.toString();
  const url = query
    ? `${endpoints.mentor.publicSessions(muid)}?${query}`
    : endpoints.mentor.publicSessions(muid);

  const res = await publicApiClient.get(
    url,
    PublicMentorSessionsResponseSchema,
  );
  return {
    data: res.response.data,
    totalPages: res.response.pagination?.totalPages ?? 1,
    totalItems: res.response.pagination?.count ?? res.response.data.length,
  };
}

export async function fetchPublicMentorAvailability(
  muid: string,
  igId?: string,
): Promise<PublicMentorAvailabilityResponse> {
  const res = await publicApiClient.get(
    endpoints.mentor.publicAvailability(muid, igId),
    PublicMentorAvailabilityResponseSchema,
  );
  return res.response;
}
