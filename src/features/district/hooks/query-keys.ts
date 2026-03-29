/**
 * District Query Keys
 *
 * 📍 src/features/district/hooks/query-keys.ts
 */

import type {
  DistrictCollegeDetailsParams,
  DistrictStudentDetailsParams,
} from "../api";

export const districtKeys = {
  all: ["district"] as const,
  details: () => [...districtKeys.all, "details"] as const,
  topCampus: () => [...districtKeys.all, "top-campus"] as const,
  studentLevel: () => [...districtKeys.all, "student-level"] as const,
  studentDetails: (params: DistrictStudentDetailsParams) =>
    [...districtKeys.all, "student-details", params] as const,
  collegeDetails: (params: DistrictCollegeDetailsParams) =>
    [...districtKeys.all, "college-details", params] as const,
} as const;
