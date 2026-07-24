import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  CampusContentDetailResponseSchema,
  type CampusContentItem,
  type CampusContentListData,
  CampusContentListResponseSchema,
  type CampusContentWrite,
  MutationResponseSchema,
  OfficeHoursDetailResponseSchema,
  type OfficeHoursItem,
  type OfficeHoursListData,
  OfficeHoursListResponseSchema,
  type OfficeHoursWrite,
} from "../schemas";

export interface ListParams {
  pageIndex: number;
  perPage: number;
  search?: string;
  status?: string;
  sortBy?: string;
  zone?: string;
}

function toOfficeHoursDate(dateStr: string): string {
  if (!dateStr?.includes("-")) return dateStr;
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

function buildQuery(params: ListParams): string {
  const q = new URLSearchParams({
    perPage: String(params.perPage),
    pageIndex: String(params.pageIndex),
  });
  if (params.search?.trim()) q.set("search", params.search.trim());
  if (params.status) q.set("status", params.status);
  if (params.zone) q.set("zone", params.zone);
  if (params.sortBy?.trim()) q.set("sortBy", params.sortBy.trim());
  return q.toString();
}

// ─── Office Hours ─────────────────────────────────────────────

export async function fetchOfficeHoursList(
  params: ListParams,
): Promise<OfficeHoursListData> {
  const res = await apiClient.get(
    `${endpoints.weeklyTwitches.officeHours.list}?${buildQuery(params)}`,
    OfficeHoursListResponseSchema,
  );
  return res.response;
}

export async function fetchOfficeHoursDetail(
  id: string,
): Promise<OfficeHoursItem> {
  const res = await apiClient.get(
    endpoints.weeklyTwitches.officeHours.detail(id),
    OfficeHoursDetailResponseSchema,
  );
  return res.response;
}

function buildOfficeHoursFormData(
  payload: Partial<OfficeHoursWrite>,
  posterFile?: File | null,
): FormData {
  const fd = new FormData();
  if (payload.title !== undefined) fd.append("title", payload.title);
  if (payload.date) fd.append("date", toOfficeHoursDate(payload.date));
  if (payload.performer !== undefined)
    fd.append("performer", payload.performer);
  if (payload.designation !== undefined)
    fd.append("designation", payload.designation);
  if (payload.description !== undefined)
    fd.append("description", payload.description);
  if (payload.link !== undefined) fd.append("link", payload.link);
  for (const ig of payload.interest_groups ?? []) {
    fd.append("interest_groups", ig);
  }
  if (posterFile) {
    fd.append("poster_thumbnail", posterFile);
  }
  return fd;
}

export async function createOfficeHours(
  payload: OfficeHoursWrite,
  posterFile?: File | null,
): Promise<void> {
  if (posterFile) {
    await apiClient.post(
      endpoints.weeklyTwitches.officeHours.create,
      buildOfficeHoursFormData(payload, posterFile),
      MutationResponseSchema,
      { isFormData: true },
    );
    return;
  }
  await apiClient.post(
    endpoints.weeklyTwitches.officeHours.create,
    {
      ...payload,
      date: toOfficeHoursDate(payload.date),
      link: payload.link || undefined,
      performer: payload.performer || undefined,
      designation: payload.designation || undefined,
    },
    MutationResponseSchema,
  );
}

export async function updateOfficeHours(
  id: string,
  payload: Partial<OfficeHoursWrite>,
  posterFile?: File | null,
): Promise<void> {
  if (posterFile) {
    await apiClient.patch(
      endpoints.weeklyTwitches.officeHours.update(id),
      buildOfficeHoursFormData(payload, posterFile),
      MutationResponseSchema,
      { isFormData: true },
    );
    return;
  }
  await apiClient.patch(
    endpoints.weeklyTwitches.officeHours.update(id),
    {
      ...payload,
      ...(payload.date ? { date: toOfficeHoursDate(payload.date) } : {}),
      link: payload.link || undefined,
      performer: payload.performer || undefined,
      designation: payload.designation || undefined,
    },
    MutationResponseSchema,
  );
}

export async function deleteOfficeHours(id: string): Promise<void> {
  await apiClient.delete(
    endpoints.weeklyTwitches.officeHours.delete(id),
    undefined,
    MutationResponseSchema,
  );
}

// ─── Salt Mango Tree ──────────────────────────────────────────

export async function fetchSmtList(
  params: ListParams,
): Promise<CampusContentListData> {
  const res = await apiClient.get(
    `${endpoints.weeklyTwitches.saltMangoTree.list}?${buildQuery(params)}`,
    CampusContentListResponseSchema,
  );
  return res.response;
}

export async function fetchSmtDetail(id: string): Promise<CampusContentItem> {
  const res = await apiClient.get(
    endpoints.weeklyTwitches.saltMangoTree.detail(id),
    CampusContentDetailResponseSchema,
  );
  return res.response;
}

export async function createSmt(payload: CampusContentWrite): Promise<void> {
  await apiClient.post(
    endpoints.weeklyTwitches.saltMangoTree.create,
    { ...payload, link: payload.link || undefined },
    MutationResponseSchema,
  );
}

export async function updateSmt(
  id: string,
  payload: Partial<CampusContentWrite>,
): Promise<void> {
  await apiClient.patch(
    endpoints.weeklyTwitches.saltMangoTree.update(id),
    { ...payload, link: payload.link || undefined },
    MutationResponseSchema,
  );
}

export async function deleteSmt(id: string): Promise<void> {
  await apiClient.delete(
    endpoints.weeklyTwitches.saltMangoTree.delete(id),
    undefined,
    MutationResponseSchema,
  );
}

// ─── Inspiration Station ──────────────────────────────────────

export async function fetchIsList(
  params: ListParams,
): Promise<CampusContentListData> {
  const res = await apiClient.get(
    `${endpoints.weeklyTwitches.inspirationStation.list}?${buildQuery(params)}`,
    CampusContentListResponseSchema,
  );
  return res.response;
}

export async function fetchIsDetail(id: string): Promise<CampusContentItem> {
  const res = await apiClient.get(
    endpoints.weeklyTwitches.inspirationStation.detail(id),
    CampusContentDetailResponseSchema,
  );
  return res.response;
}

export async function createIs(payload: CampusContentWrite): Promise<void> {
  await apiClient.post(
    endpoints.weeklyTwitches.inspirationStation.create,
    { ...payload, link: payload.link || undefined },
    MutationResponseSchema,
  );
}

export async function updateIs(
  id: string,
  payload: Partial<CampusContentWrite>,
): Promise<void> {
  await apiClient.patch(
    endpoints.weeklyTwitches.inspirationStation.update(id),
    { ...payload, link: payload.link || undefined },
    MutationResponseSchema,
  );
}

export async function deleteIs(id: string): Promise<void> {
  await apiClient.delete(
    endpoints.weeklyTwitches.inspirationStation.delete(id),
    undefined,
    MutationResponseSchema,
  );
}
