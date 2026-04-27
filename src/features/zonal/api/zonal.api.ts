import { apiClient } from "@/api";
import { endpoints } from "@/api/endpoints";
import {
  CollegeListSchema,
  StudentLevelSchema,
  StudentListSchema,
  TopDistrictSchema,
  ZoneSchema,
} from "../schemas";
import type { CollegeListParams, StudentListParams } from "../types";

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
  getZoneDetails: async () => {
    const res = await apiClient.get<unknown>(endpoints.zonal.details);
    return ZoneSchema.parse(res);
  },

  getTopDistricts: async () => {
    const res = await apiClient.get<unknown>(endpoints.zonal.topDistrict);
    return TopDistrictSchema.parse(res);
  },

  getStudentLevels: async () => {
    const res = await apiClient.get<unknown>(endpoints.zonal.studentLevel);
    return StudentLevelSchema.parse(res);
  },

  getStudentDetails: async (params: StudentListParams = {}) => {
    const url = withQuery(
      endpoints.zonal.studentList,
      params as Record<string, unknown>,
    );
    const res = await apiClient.get<unknown>(url);
    return StudentListSchema.parse(res);
  },

  downloadStudentCsv: async (): Promise<Blob> => {
    const res = await apiClient.get<Blob>(
      endpoints.zonal.studentCsv,
      undefined,
      { responseType: "blob" },
    );
    return res;
  },

  getCollegeDetails: async (params: CollegeListParams = {}) => {
    const url = withQuery(
      endpoints.zonal.collegeList,
      params as Record<string, unknown>,
    );
    const res = await apiClient.get<unknown>(url);
    return CollegeListSchema.parse(res);
  },

  downloadCollegeCsv: async (): Promise<Blob> => {
    const res = await apiClient.get<Blob>(
      endpoints.zonal.collegeCsv,
      undefined,
      { responseType: "blob" },
    );
    return res;
  },
};

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
