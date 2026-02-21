import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  BulkImportResponseSchema,
  KarmaVoucherListResponseSchema,
} from "../schemas";
import type { BulkImportResponse, KarmaVoucherListData } from "../types";

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

// ─── Delete Voucher ─────────────────────────────────────────────────────────

export async function deleteKarmaVoucher(id: string): Promise<void> {
  await apiClient.delete(endpoints.admin.karmaVoucher.delete(id));
}

// ─── Bulk Import Vouchers (XLSX) ────────────────────────────────────────────

export async function importVouchers(file: File): Promise<BulkImportResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post(
    endpoints.admin.karmaVoucher.import,
    formData,
    BulkImportResponseSchema,
    { isFormData: true },
  );

  return response;
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
