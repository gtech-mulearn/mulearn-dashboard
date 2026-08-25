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

export interface ImportSuccessRow {
  muid?: string | null;
  code: string;
  user?: string | null;
  task?: string | null;
  karma?: number | string | null;
  month?: string | null;
  week?: string | null;
  description?: string | null;
  event?: string | null;
}

export interface ImportFailureRow {
  muid?: string | null;
  karma?: number | string | null;
  hashtag?: string | null;
  month?: string | null;
  week?: string | null;
  description?: string | null;
  event?: string | null;
  error: string;
}

export interface BulkImportResponse {
  Success: ImportSuccessRow[];
  Failed: ImportFailureRow[];
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
