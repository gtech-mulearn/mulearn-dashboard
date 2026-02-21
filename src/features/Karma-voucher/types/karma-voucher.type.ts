/**
 * Karma Voucher Types
 *
 * 📍 src/features/Karma-voucher/types/karma-voucher.type.ts
 */

export interface KarmaVoucher {
  id: string;
  user: string;
  code: string;
  karma: number;
  claimed: boolean;
  task?: string | null;
  week?: string | null;
  month?: string | null;
  updated_by?: string | null;
  updated_at: string;
  created_by: string;
  created_at: string;
  muid?: string | null;
}

export interface ImportResult {
  code: string;
  message: string;
}

export interface BulkImportResponse {
  Success: ImportResult[];
  Failed: ImportResult[];
}

export interface PaginatedData<T> {
  data: T[];
  pagination: {
    count: number;
    totalPages: number;
    isNext: boolean;
    isPrev: boolean;
    nextPage?: number | null;
  };
}

export interface KarmaVoucherListData extends PaginatedData<KarmaVoucher> {}
