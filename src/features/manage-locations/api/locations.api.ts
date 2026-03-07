import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  type CreateCountryInput,
  type CreateDistrictInput,
  type CreateStateInput,
  type CreateZoneInput,
  DistrictDataSchema,
  DropdownResponseSchema,
  LocationDataSchema,
  MutationResponseSchema,
  StateDataSchema,
  type UpdateCountryInput,
  type UpdateDistrictInput,
  type UpdateStateInput,
  type UpdateZoneInput,
  ZoneDataSchema,
} from "../schema";
import type { ApiEnvelope, LocationData } from "../types";

type PaginatedApiResponse = {
  response?: LocationData;
  data?: LocationData;
};
type DropdownApiResponse = {
  response?: { id: string; name: string }[];
};

type DropdownItem = { id: string; name: string };

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LocationParams {
  page: number;
  perPage: number;
  search?: string;
  sortBy?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildQuery(params: LocationParams): string {
  const query = new URLSearchParams({
    pageIndex: String(params.page),
    perPage: String(params.perPage),
  });
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.sortBy?.trim()) query.set("sortBy", params.sortBy.trim());
  return query.toString();
}

function extractPaginatedResponse(
  response: PaginatedApiResponse,
): LocationData {
  return (
    response.response ??
    response.data ?? {
      data: [],
      pagination: { count: 0, totalPages: 1, isNext: false, isPrev: false },
    }
  );
}

function mapDropdownItems(response: DropdownApiResponse) {
  return (response.response ?? []).map((item: DropdownItem) => ({
    label: item.name,
    value: item.id,
  }));
}

// ─── Countries ───────────────────────────────────────────────────────────────

export async function fetchLocation(
  params: LocationParams,
): Promise<LocationData> {
  const response = await apiClient.get<ApiEnvelope<LocationData>>(
    `${endpoints.countries.list}?${buildQuery(params)}`,
    LocationDataSchema,
  );
  return extractPaginatedResponse(response);
}

export async function addCountry(data: CreateCountryInput): Promise<void> {
  await apiClient.post(
    endpoints.countries.create,
    data,
    MutationResponseSchema,
  );
}

export async function updateCountry(data: UpdateCountryInput): Promise<void> {
  await apiClient.patch(
    endpoints.countries.update(data.id),
    data,
    MutationResponseSchema,
  );
}

export async function deleteCountry(id: string): Promise<void> {
  await apiClient.delete(endpoints.countries.delete(id));
}

export async function fetchCountryList() {
  const response = await apiClient.get<DropdownApiResponse>(
    endpoints.countries.dropdownList,
    DropdownResponseSchema,
  );
  return mapDropdownItems(response);
}

// ─── States ──────────────────────────────────────────────────────────────────

export async function fetchStates(
  params: LocationParams,
): Promise<LocationData> {
  const response = await apiClient.get<ApiEnvelope<LocationData>>(
    `${endpoints.states.list}?${buildQuery(params)}`,
    StateDataSchema,
  );
  return extractPaginatedResponse(response);
}

export async function addState(data: CreateStateInput): Promise<void> {
  await apiClient.post(endpoints.states.create, data, MutationResponseSchema);
}

export async function updateState(data: UpdateStateInput): Promise<void> {
  console.log("url:", endpoints.states.update(data.id));
  console.log("payload:", data);
  await apiClient.patch(
    endpoints.states.update(data.id),
    data,
    MutationResponseSchema,
  );
}

export async function deleteState(id: string): Promise<void> {
  await apiClient.delete(endpoints.states.delete(id));
}
export async function fetchStateList() {
  const response = await apiClient.get<DropdownApiResponse>(
    endpoints.states.dropdownList,
    DropdownResponseSchema,
  );
  return mapDropdownItems(response);
}
// ─── Zones ───────────────────────────────────────────────────────────────────

export async function fetchZones(
  params: LocationParams,
): Promise<LocationData> {
  const response = await apiClient.get<ApiEnvelope<LocationData>>(
    `${endpoints.zones.list}?${buildQuery(params)}`,
    ZoneDataSchema,
  );
  return extractPaginatedResponse(response);
}

export async function addZone(data: CreateZoneInput): Promise<void> {
  await apiClient.post(endpoints.zones.create, data, MutationResponseSchema);
}

export async function updateZone(data: UpdateZoneInput): Promise<void> {
  await apiClient.patch(
    endpoints.zones.update(data.id),
    data,
    MutationResponseSchema,
  );
}

export async function deleteZone(id: string): Promise<void> {
  await apiClient.delete(endpoints.zones.delete(id));
}

export async function fetchZoneList() {
  const response = await apiClient.get<DropdownApiResponse>(
    endpoints.zones.dropdownList,
    DropdownResponseSchema,
  );
  return mapDropdownItems(response);
}

// ─── Districts ───────────────────────────────────────────────────────────────

export async function fetchDistricts(
  params: LocationParams,
): Promise<LocationData> {
  const response = await apiClient.get<ApiEnvelope<LocationData>>(
    `${endpoints.districts.list}?${buildQuery(params)}`,
    DistrictDataSchema,
  );
  return extractPaginatedResponse(response);
}

export async function addDistrict(data: CreateDistrictInput): Promise<void> {
  console.log("addDistrict payload:", data);
  await apiClient.post(
    endpoints.districts.create,
    data,
    MutationResponseSchema,
  );
}

export async function updateDistrict(data: UpdateDistrictInput): Promise<void> {
  await apiClient.patch(
    endpoints.districts.update(data.id),
    data,
    MutationResponseSchema,
  );
}

export async function deleteDistrict(id: string): Promise<void> {
  await apiClient.delete(endpoints.districts.delete(id));
}
