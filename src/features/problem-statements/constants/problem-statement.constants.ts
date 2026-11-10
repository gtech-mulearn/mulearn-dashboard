/**
 * Problem Statement Constants
 *
 * 📍 src/features/problem-statements/constants/problem-statement.constants.ts
 *
 * Static configuration for UI: status badges, sort options, category suggestions.
 * Aligned with PROBLEM_STATEMENT_API.md (3 statuses, single category, skills[]).
 */

import type { BadgeProps } from "@/components/ui/badge";
import type {
  BrowseStatusFilter,
  FeedTab,
  ParticipationStatusFilter,
  ProblemStatementStatus,
} from "../types/problem-statement.types";

// ─── Feed Sort Options ────────────────────────────────────────────────────────

export const FEED_SORT_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Newest first", value: "-published_at" },
  { label: "Deadline soonest", value: "deadline" },
  { label: "Title (A → Z)", value: "title" },
];

export const FEED_SORT_DEFAULT = "-published_at";

// ─── Learner Feed Tabs & Filters ──────────────────────────────────────────────
// Two jobs on one page: discover statements ("Browse") and track your own
// participation ("Participating"). Each tab has its own status filter.

export const FEED_TABS: Array<{ label: string; value: FeedTab }> = [
  { label: "Browse", value: "browse" },
  { label: "Participating", value: "participating" },
];

export const BROWSE_STATUS_OPTIONS: Array<{
  label: string;
  value: BrowseStatusFilter;
}> = [
  { label: "Any status", value: "all" },
  { label: "Open only", value: "open" },
];

export const PARTICIPATION_STATUS_OPTIONS: Array<{
  label: string;
  value: ParticipationStatusFilter;
}> = [
  { label: "Any status", value: "all" },
  { label: "Trying", value: "trying" },
  { label: "Submitted", value: "submitted" },
];

// ─── Company/Admin Manage Sort Options ───────────────────────────────────────

export const MANAGE_SORT_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Last updated", value: "-updated_at" },
  { label: "Newest first", value: "-created_at" },
  { label: "Title (A → Z)", value: "title" },
  { label: "Deadline soonest", value: "deadline" },
  { label: "Recently published", value: "-published_at" },
];

export const MANAGE_SORT_DEFAULT = "-updated_at";

// ─── Status Filter Tabs (for manage views) ───────────────────────────────────

export const MANAGE_STATUS_PILLS: Array<{
  label: string;
  value: ProblemStatementStatus | "all";
}> = [
  { label: "All", value: "all" },
  { label: "Draft", value: "Draft" },
  { label: "Published", value: "Published" },
  { label: "Unpublished", value: "Unpublished" },
];

// ─── Status Badge Config ──────────────────────────────────────────────────────
// Maps lifecycle status onto the shared Badge variants (token colours only).

export const STATUS_CONFIG: Record<
  ProblemStatementStatus,
  { label: string; variant: NonNullable<BadgeProps["variant"]> }
> = {
  Draft: { label: "Draft", variant: "secondary" },
  Published: { label: "Published", variant: "success" },
  Unpublished: { label: "Unpublished", variant: "warning" },
};

// ─── Category Suggestions ─────────────────────────────────────────────────────
// Offered in the form (datalist) and the feed filter; custom categories allowed.

export const CATEGORY_SUGGESTIONS = [
  "AI / ML",
  "Web Development",
  "Mobile",
  "Sustainability",
  "IoT",
  "Fintech",
  "Healthcare",
  "EdTech",
  "Blockchain",
  "Open Source",
  "Data Science",
  "Cybersecurity",
  "AR / VR",
  "Social Impact",
  "Gaming",
] as const;
