import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  GenericMutationResponseSchema,
  type Hiring,
  type HiringFormValues,
  HiringImportResponseSchema,
  type HiringImportResult,
  type HiringListData,
  HiringListResponseSchema,
  type HiringStatusFilter,
} from "../schemas";

interface FetchHiringParams {
  pageIndex: number;
  perPage: number;
  search?: string;
  sortBy?: string;
  status?: HiringStatusFilter;
}

// ─── Hiring CRUD ────────────────────────────────────────────────────────────

export async function fetchHiring(
  params: FetchHiringParams,
): Promise<HiringListData> {
  const query = new URLSearchParams({
    perPage: String(params.perPage),
    pageIndex: String(params.pageIndex),
  });
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.sortBy?.trim()) query.set("sortBy", params.sortBy.trim());
  if (params.status && params.status !== "all")
    query.set("status", params.status);

  const response = await apiClient.get(
    `${endpoints.careerLab.hiring.list}?${query.toString()}`,
    HiringListResponseSchema,
  );
  return response.response;
}

export async function createHiring(payload: HiringFormValues): Promise<void> {
  await apiClient.post(
    endpoints.careerLab.hiring.create,
    payload,
    GenericMutationResponseSchema,
  );
}

export async function updateHiring(
  id: string,
  payload: HiringFormValues,
): Promise<void> {
  await apiClient.put(
    endpoints.careerLab.hiring.update(id),
    payload,
    GenericMutationResponseSchema,
  );
}

export async function deleteHiring(id: string): Promise<void> {
  await apiClient.delete(
    endpoints.careerLab.hiring.delete(id),
    GenericMutationResponseSchema,
  );
}

// ─── CSV export / import ─────────────────────────────────────────────────────

export async function downloadHiringCsvBlob(): Promise<void> {
  const blob = await apiClient.get<Blob>(
    endpoints.careerLab.hiring.csvExport,
    undefined,
    { responseType: "blob" },
  );

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "hiring-postings.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function importHiringCsv(file: File): Promise<HiringImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post(
    endpoints.careerLab.hiring.csvImport,
    formData,
    HiringImportResponseSchema,
    { isFormData: true },
  );
  return response.response;
}

export type { Hiring };
