//import { z } from "zod";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  BulkImportResponseSchema,
  KarmaVoucherSchema,
  PaginatedResponseSchema,
} from "../schema";

// ==========================================
// Fetch Karma Vouchers
// ==========================================

export const fetchKarmaVouchers = async (
  token: string,
  page: number,
  perPage: number,
  search?: string,
  sortBy?: string,
) => {
  return apiClient.post(
    endpoints.admin.karmaVoucher.list,
    {
      token,
      page,
      page_size: perPage,
      search,
      ordering: sortBy,
    },
    PaginatedResponseSchema(KarmaVoucherSchema),
  );
};

// ==========================================
// Delete Voucher
// ==========================================

export const deleteKarmaVoucher = async (id: string) => {
  return apiClient.delete(endpoints.admin.karmaVoucher.delete(id));
};

// ==========================================
// Import Vouchers
// ==========================================

export const importVouchers = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient.post(
    endpoints.admin.karmaVoucher.import,
    formData,
    BulkImportResponseSchema,
  );
};

// ==========================================
// Export CSV
// ==========================================

/*export const exportVoucherCsv = async (token: string): Promise<Blob> => {
  return publicApiClient.get(
    endpoints.admin.karmaVoucher.exportCSV,
    {
      token,
    },
    BulkImportResponseSchema,
  );
};


const blob = await publicApiClient.get<Blob>(
  endpoints.admin.karmaVoucher.template,
  {
    responseType: "blob",
    
  }
);*/
