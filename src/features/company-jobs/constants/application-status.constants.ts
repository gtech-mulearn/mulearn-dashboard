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
export const APP_STATUS_TRANSITIONS: Record<AppStatus, AppStatus[]> = {
  applied: ["shortlisted", "rejected"],
  shortlisted: ["accepted", "rejected"],
  accepted: [],
  rejected: [],
};

/**
 * Display metadata for each applicant status.
 *
 * Colour strategy:
 *   - applied    → brand-blue  (--brand-blue)
 *   - shortlisted → warning    (--warning)
 *   - accepted   → success     (--success)
 *   - rejected   → destructive (--destructive)
 *
 * We use inline `style` for the token-level colours and CSS custom properties
 * so we never reference the raw Tailwind palette (blue-*, amber-*, etc.).
 */
export const APP_STATUS_META: Record<
  AppStatus,
  {
    label: string;
    /** Tailwind bg/text built from CSS variable via color-mix in globals */
    badgeClass: string;
    /** Inline style for the status dot colour */
    dotVar: string;
  }
> = {
  applied: {
    label: "Applied",
    badgeClass: "app-status-applied",
    dotVar: "var(--brand-blue)",
  },
  shortlisted: {
    label: "Shortlisted",
    badgeClass: "app-status-shortlisted",
    dotVar: "var(--warning)",
  },
  accepted: {
    label: "Accepted",
    badgeClass: "app-status-accepted",
    dotVar: "var(--success)",
  },
  rejected: {
    label: "Rejected",
    badgeClass: "app-status-rejected",
    dotVar: "var(--destructive)",
  },
};
