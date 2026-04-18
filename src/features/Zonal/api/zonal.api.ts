import { apiClient } from "@/api";
import { endpoints } from "@/api/endpoints";
import {
  StudentListSchema,
  CollegeListSchema,
  ZoneSchema,
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
    return ZoneSchema.parse(res);
  },

  /** GET /api/dashboard/zonal/top-districts/ */
  getTopDistricts: async () => {
    const res = await apiClient.get<unknown>(endpoints.zonal.topDistrict);
    return TopDistrictSchema.parse(res);
  },

  /** GET /api/dashboard/zonal/student-level/ */
  getStudentLevels: async () => {
    const res = await apiClient.get<unknown>(endpoints.zonal.studentLevel);
    return StudentLevelSchema.parse(res);
  },

  /** GET /api/dashboard/zonal/student-details/ */
  getStudentDetails: async (params: StudentListParams = {}) => {
    const url = withQuery(
      endpoints.zonal.studentList,
      params as Record<string, unknown>,
    );
    const res = await apiClient.get<unknown>(url);
    return StudentListSchema.parse(res);
  },

  /** GET /api/dashboard/zonal/student-details/csv/ — returns raw Blob */
  downloadStudentCsv: async (): Promise<Blob> => {
    const res = await apiClient.get<Blob>(
      endpoints.zonal.studentCsv,
      undefined,
      { responseType: "blob" }, // ← tells apiClient to skip JSON parsing
    );
    return res;
  },

  /** GET /api/dashboard/zonal/college-details/ */
  getCollegeDetails: async (params: CollegeListParams = {}) => {
    const url = withQuery(
      endpoints.zonal.collegeList,
      params as Record<string, unknown>,
    );
    const res = await apiClient.get<unknown>(url);
    return CollegeListSchema.parse(res);
  },

  /** GET /api/dashboard/zonal/college-details/csv/ — returns raw Blob */
  downloadCollegeCsv: async (): Promise<Blob> => {
    const res = await apiClient.get<Blob>(
      endpoints.zonal.collegeCsv,
      undefined,
      { responseType: "blob" }, // ← tells apiClient to skip JSON parsing
    );
    return res;
  },
};

/** Trigger a CSV file download in the browser */
export function triggerCsvDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  try {
    anchor.click();
  } finally {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }
}
