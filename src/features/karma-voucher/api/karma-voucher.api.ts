import { ApiError, apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  ApiResponseSchema,
  BulkImportResponseSchema,
  CreateVoucherResponseSchema,
  KarmaVoucherListResponseSchema,
} from "../schemas";
import type {
  BulkImportResponse,
  CreateVoucherPayload,
  CreateVoucherResponse,
  KarmaVoucherListData,
  UpdateVoucherPayload,
} from "../types";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface KarmaVoucherListParams {
  page: number;
  perPage: number;
  search?: string;
  sortBy?: string;
}

// ─── Fetch Karma Vouchers ───────────────────────────────────────────────────

export async function fetchKarmaVouchers(
  params: KarmaVoucherListParams,
): Promise<KarmaVoucherListData> {
  const query = new URLSearchParams({
    pageIndex: String(params.page),
    perPage: String(params.perPage),
  });

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }
  if (params.sortBy?.trim()) {
    query.set("sortBy", params.sortBy.trim());
  }

  const response = await apiClient.get(
    `${endpoints.admin.karmaVoucher.list}?${query.toString()}`,
    KarmaVoucherListResponseSchema,
  );

  return (
    response.response ||
    response.data || {
      data: [],
      pagination: { count: 0, totalPages: 1, isNext: false, isPrev: false },
    }
  );
}

// ─── Create Voucher ─────────────────────────────────────────────────────────

export async function createVoucher(
  payload: CreateVoucherPayload,
): Promise<CreateVoucherResponse> {
  const response = await apiClient.post(
    endpoints.admin.karmaVoucher.create,
    payload,
    ApiResponseSchema(CreateVoucherResponseSchema),
  );

  const voucher = response.response ?? response.data;
  if (!voucher) {
    throw new Error("Voucher creation failed. Please try again.");
  }
  return voucher;
}

// ─── Update Voucher ─────────────────────────────────────────────────────────

export async function updateVoucher({
  id,
  ...payload
}: UpdateVoucherPayload): Promise<void> {
  await apiClient.patch(endpoints.admin.karmaVoucher.update(id), payload);
}

// ─── Delete Voucher ─────────────────────────────────────────────────────────

export async function deleteKarmaVoucher(id: string): Promise<void> {
  await apiClient.delete(endpoints.admin.karmaVoucher.delete(id));
}

// ─── Bulk Import Vouchers (XLSX) ────────────────────────────────────────────

export async function importVouchers(file: File): Promise<BulkImportResponse> {
  const formData = new FormData();
  formData.append("voucher_log", file);

  try {
    const response = await apiClient.post(
      endpoints.admin.karmaVoucher.import,
      formData,
      ApiResponseSchema(BulkImportResponseSchema),
      { isFormData: true },
    );

    const nestedResult = response.response || response.data;
    if (!nestedResult) {
      throw new Error("Import failed. Please try again.");
    }
    return nestedResult;
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.data &&
      typeof error.data === "object"
    ) {
      const envelope = error.data as { response?: unknown; data?: unknown };
      const candidates = [envelope.response, envelope.data, error.data];
      for (const candidate of candidates) {
        if (
          !candidate ||
          typeof candidate !== "object" ||
          (!("Success" in candidate) && !("Failed" in candidate))
        ) {
          continue;
        }
        const parsed = BulkImportResponseSchema.safeParse(candidate);
        if (parsed.success) return parsed.data;
      }
    }
    throw error;
  }
}

// ─── Export CSV (blob download) ─────────────────────────────────────────────

export async function exportVouchersCsv(): Promise<Blob> {
  return apiClient.get<Blob>(
    endpoints.admin.karmaVoucher.exportCSV,
    undefined,
    { responseType: "blob" },
  );
}

// ─── Download Import Template (blob download) ──────────────────────────────

export async function downloadTemplate(): Promise<Blob> {
  return apiClient.get<Blob>(endpoints.admin.karmaVoucher.template, undefined, {
    responseType: "blob",
  });
}
