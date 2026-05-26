import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  MentorApplicationListItem,
  TierUpdateValues,
  VerifyActionValues,
} from "../schemas";
import { GenericResponseSchema, MentorListResponseSchema } from "../schemas";

interface ListParams {
  search?: string;
  page?: number;
  status?: string;
}

function normalizeMentorItem(
  raw: MentorApplicationListItem,
): MentorApplicationListItem {
  const exp = (raw as Record<string, unknown>).expertise;
  let expertise: string[];
  if (Array.isArray(exp)) expertise = exp as string[];
  else if (typeof exp === "string") {
    try {
      expertise = JSON.parse(exp);
    } catch {
      expertise = [];
    }
  } else expertise = [];
  return { ...raw, expertise };
}

export async function fetchMentorList(params: ListParams = {}): Promise<{
  data: MentorApplicationListItem[];
  totalPages: number;
  totalItems: number;
}> {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.page) q.set("page", String(params.page));
  if (params.status) q.set("status", params.status);

  const url =
    params.search || params.page || params.status
      ? `${endpoints.mentor.list}?${q}`
      : endpoints.mentor.list;

  const res = await apiClient.get(url, MentorListResponseSchema);
  const rawData = Array.isArray(res.response?.data) ? res.response.data : [];
  const data = rawData.map(normalizeMentorItem);
  return {
    data,
    totalPages: res.response?.pagination?.totalPages ?? 1,
    totalItems: res.response?.pagination?.count ?? data.length,
  };
}

export async function verifyMentor(
  mentorId: string,
  data: VerifyActionValues,
): Promise<void> {
  await apiClient.patch(
    endpoints.mentor.verify(mentorId),
    data,
    GenericResponseSchema,
  );
}

export async function updateMentorTier(
  mentorId: string,
  data: TierUpdateValues,
): Promise<void> {
  await apiClient.patch(
    endpoints.mentor.tier(mentorId),
    data,
    GenericResponseSchema,
  );
}
