import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  IGRequestListResponseSchema,
  CreateIGRequestResponseSchema,
  UpdateIGRequestStatusResponseSchema,
  type CreateIGRequestForm,
  type UpdateIGRequestStatusForm,
} from "../schemas";

interface ListIGRequestsParams {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  sortBy?: string;
}

function buildIGRequestListUrl(params: ListIGRequestsParams): string {
  const base = endpoints.interestGroups.requestList;
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("pageIndex", String(params.page));
  if (params.perPage) searchParams.set("perPage", String(params.perPage));
  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);
  if (params.sortBy) searchParams.set("sort", params.sortBy);
  const qs = searchParams.toString();
  return qs ? `${base}?${qs}` : base;
}

export async function listIGRequests(params: ListIGRequestsParams = {}) {
  return apiClient.get(
    buildIGRequestListUrl(params),
    IGRequestListResponseSchema,
  );
}

export async function createIGRequest(data: CreateIGRequestForm) {
  // Explicitly construct the payload with ONLY the fields defined in the schema
  // and remove any empty strings to avoid validation errors for optional fields.
  const payload = {
    name: data.name,
    code: data.code,
    category: data.category,
    icon: data.icon,
    ...(data.about ? { about: data.about } : {}),
    ...(data.prerequisites ? { prerequisites: data.prerequisites } : {}),
    ...(data.career_opportunities
      ? { career_opportunities: data.career_opportunities }
      : {}),
    ...(data.resource ? { resource: data.resource } : {}),
    ...(data.top_blogs ? { top_blogs: data.top_blogs } : {}),
    ...(data.people_to_follow
      ? { people_to_follow: data.people_to_follow }
      : {}),
    ...(data.leads ? { leads: data.leads } : {}),
    ...(data.mentors ? { mentors: data.mentors } : {}),
    ...(data.thinktank ? { thinktank: data.thinktank } : {}),
    ...(data.office_hours ? { office_hours: data.office_hours } : {}),
  };

  return apiClient.post(
    endpoints.interestGroups.requestCreate,
    payload,
    CreateIGRequestResponseSchema,
  );
}

// Used by Issue #3 (admin side) — defined here so the API layer is complete in one place
export async function updateIGRequestStatus(
  pk: string,
  data: UpdateIGRequestStatusForm,
) {
  return apiClient.patch(
    endpoints.interestGroups.requestUpdate(pk),
    data,
    UpdateIGRequestStatusResponseSchema,
  );
}
