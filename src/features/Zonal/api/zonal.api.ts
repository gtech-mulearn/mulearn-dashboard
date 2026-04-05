import { apiClient } from "@/api";
import { endpoints } from "@/api/endpoints";
import {
  StudentListSchema,
  ColegeListSchema,
  ZoneShema,
  TopDistrictSchema,
  StudentLevelSchema,
} from "../schemas";
import type { StudentListParams, CollegeListParams } from "../types";

/** Append a params object as query string onto a base URL */
function withQuery(url: string, params: Record<string, unknown> = {}): string {
  const filtered = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  );
  if (filtered.length === 0) return url;
  const qs = new URLSearchParams(
    filtered.map(([k, v]) => [k, String(v)]),
  ).toString();
  return `${url}?${qs}`;
}

export const zonalApi = {
  /** GET /api/dashboard/zonal/zonal-details/ */
  getZoneDetails: async () => {
    const res = await apiClient.get<unknown>(endpoints.zonal.details);
    return ZoneShema.parse(res);
  },

  /** GET /api/dashboard/zonal/top-districts/ */
  getTopDistricts: async () => {
    const res = await apiClient.get<unknown>(endpoints.zonal.TopDistrict);
    return TopDistrictSchema.parse(res);
  },

  /** GET /api/dashboard/zonal/student-level/ */
  getStudentLevels: async () => {
    const res = await apiClient.get<unknown>(endpoints.zonal.StudentLevel);
    return StudentLevelSchema.parse(res);
  },

  /** GET /api/dashboard/zonal/student-details/ */
  getStudentDetails: async (params: StudentListParams = {}) => {
    const url = withQuery(
      endpoints.zonal.StudentList,
      params as Record<string, unknown>,
    );
    const res = await apiClient.get<unknown>(url);
    return StudentListSchema.parse(res);
  },

  /** GET /api/dashboard/zonal/student-details/csv/ — returns raw Blob */
  downloadStudentCsv: async (): Promise<Blob> => {
    const res = await apiClient.get(endpoints.zonal.StudentCsv);
    return res as Blob;
  },

  /** GET /api/dashboard/zonal/college-details/ */
  getCollegeDetails: async (params: CollegeListParams = {}) => {
    const url = withQuery(
      endpoints.zonal.CollegeList,
      params as Record<string, unknown>,
    );
    const res = await apiClient.get<unknown>(url);
    return ColegeListSchema.parse(res);
  },

  /** GET /api/dashboard/zonal/college-details/csv/ — returns raw Blob */
  downloadCollegeCsv: async (): Promise<Blob> => {
    const res = await apiClient.get(endpoints.zonal.CollegeCsv);
    return res as Blob;
  },
};

/** Trigger a CSV file download in the browser */
export function triggerCsvDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
