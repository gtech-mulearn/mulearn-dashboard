import type { z } from "zod";
import type {
  ZoneShema,
  TopDistrictSchema,
  StudentLevelSchema,
  StudentListSchema,
  ColegeListSchema,
  zonedetails,
  TopDistrict,
  StudentLevel,
} from "../schemas";

export type ZoneDetails = z.infer<typeof zonedetails>;
export type TTopDistrict = z.infer<typeof TopDistrict>;
export type TStudentLevel = z.infer<typeof StudentLevel>;

export type ZoneDetailsResponse = z.infer<typeof ZoneShema>;
export type TopDistrictsResponse = z.infer<typeof TopDistrictSchema>;
export type StudentLevelResponse = z.infer<typeof StudentLevelSchema>;
export type StudentListResponse = z.infer<typeof StudentListSchema>;
export type CollegeListResponse = z.infer<typeof ColegeListSchema>;

export interface Pagination {
  count: number;
  totalPages: number;
  isNext: boolean;
  isPrev: boolean;
  nextPage?: number | null;
}

// ── Query param types ──────────────────────────────────────────────────────
type Sortable<T extends string> = T | `-${T}`;

export interface StudentListParams {
  pageIndex?: number;
  perPage?: number;
  sortBy?: Sortable<"full_name" | "muid" | "karma" | "level">;
  search?: string;
}

export interface CollegeListParams {
  pageIndex?: number;
  perPage?: number;
  sortBy?: Sortable<"title" | "code">;
  search?: string;
}

// ── Sort direction helper ──────────────────────────────────────────────────
export type SortDirection = "asc" | "desc";

export interface SortState<T extends string> {
  field: T;
  direction: SortDirection;
}
