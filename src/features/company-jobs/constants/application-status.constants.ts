/**
 * Application Status Constants
 *
 * 📍 src/features/company-jobs/constants/application-status.constants.ts
 *
 * Centralised FSM definition and display config for applicant statuses.
 * Uses only CSS-variable-derived Tailwind utilities (no raw palette colours).
 */

import type { JobApplicant } from "../types";

export type AppStatus = JobApplicant["status"];

/** FSM: allowed next states from each status */
export const APP_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ["in-review", "rejected"],
  "in-review": ["shortlisted", "rejected"],
  shortlisted: ["interview", "rejected"],
  interview: ["selected", "rejected"],
  selected: [],
  rejected: [],
};

export const APP_STATUS_META: Record<
  string,
  {
    label: string;
    backendStatus: string;
    badgeClass: string;
    dotVar: string;
  }
> = {
  pending: {
    label: "Pending",
    backendStatus: "Pending",
    badgeClass: "app-status-applied",
    dotVar: "var(--brand-blue)",
  },
  "in-review": {
    label: "In Review",
    backendStatus: "In-Review",
    badgeClass: "app-status-applied",
    dotVar: "var(--brand-blue)",
  },
  shortlisted: {
    label: "Shortlisted",
    backendStatus: "Shortlisted",
    badgeClass: "app-status-shortlisted",
    dotVar: "var(--warning)",
  },
  interview: {
    label: "Interview",
    backendStatus: "Interview",
    badgeClass: "app-status-shortlisted",
    dotVar: "var(--warning)",
  },
  selected: {
    label: "Selected",
    backendStatus: "Selected",
    badgeClass: "app-status-accepted",
    dotVar: "var(--success)",
  },
  rejected: {
    label: "Rejected",
    backendStatus: "Rejected",
    badgeClass: "app-status-rejected",
    dotVar: "var(--destructive)",
  },
};
