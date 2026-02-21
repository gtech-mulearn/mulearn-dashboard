"use client";

// ==========================================
// Constants for Level Options
// ==========================================
export const LEVEL_OPTIONS = [
  { value: "1", label: "Level 1" },
  { value: "2", label: "Level 2" },
  { value: "3", label: "Level 3" },
  { value: "4", label: "Level 4" },
  { value: "5", label: "Level 5" },
  { value: "6", label: "Level 6" },
  { value: "7", label: "Level 7" },
];

// ==========================================
// Constants for IssuedLogsTable
// ==========================================

export const ISSUED_LOGS_PAGE_SIZE = 20;

/** Column headers for the issued-logs manual HTML table */
export const ISSUED_LOGS_HEADERS = [
  "MUID",
  "User",
  "Achievement",
  "Issued By",
  "Issued On",
] as const;
