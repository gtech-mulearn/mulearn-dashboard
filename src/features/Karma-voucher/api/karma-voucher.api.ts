import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { authStore } from "@/lib/auth";
import { env } from "../../../../config/env";
import type {} from "../schemas";
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
  const token = authStore.getAccessToken();
  const base = env.NEXT_PUBLIC_DJANGO_API_URL;

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${base}${endpoints.admin.karmaVoucher.import}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Import failed (${res.status})`);
  }

  const json = await res.json();
  const data = json?.response ?? json;
  return BulkImportResponseSchema.parse(data);
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
