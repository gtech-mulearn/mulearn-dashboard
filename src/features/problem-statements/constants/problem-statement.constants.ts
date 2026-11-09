/**
 * Problem Statement Constants
 *
 * 📍 src/features/problem-statements/constants/problem-statement.constants.ts
 *
 * Static configuration for UI: status badges, sort options, category suggestions.
 * Aligned with PROBLEM_STATEMENT_API.md (3 statuses, single category, skills[]).
 */

import type {
  FeedStatusFilter,
  ProblemStatementStatus,
} from "../types/problem-statement.types";

// ─── Feed Sort Options ────────────────────────────────────────────────────────

export const FEED_SORT_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Newest", value: "-published_at" },
  { label: "Deadline Approaching", value: "deadline" },
  { label: "A → Z", value: "title" },
];

export const FEED_SORT_DEFAULT = "-published_at";

// ─── Feed Status Filter Pills ─────────────────────────────────────────────────

export const FEED_STATUS_PILLS: Array<{
  label: string;
  value: FeedStatusFilter;
}> = [
  { label: "All Challenges", value: "all" },
  { label: "Open Submissions", value: "open" },
  { label: "I'm Trying", value: "trying" },
  { label: "Submitted", value: "submitted" },
];

// ─── Company/Admin Manage Sort Options ───────────────────────────────────────

export const MANAGE_SORT_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Last Updated", value: "-updated_at" },
  { label: "Newest", value: "-created_at" },
  { label: "Title A → Z", value: "title" },
  { label: "Deadline", value: "deadline" },
  { label: "Published At", value: "-published_at" },
];

export const MANAGE_SORT_DEFAULT = "-updated_at";

// ─── Status Filter Pills (for manage views) ───────────────────────────────────

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

export const STATUS_CONFIG: Record<
  ProblemStatementStatus,
  { label: string; className: string }
> = {
  Draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground border-border",
  },
  Published: {
    label: "Published",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  Unpublished: {
    label: "Unpublished",
    className:
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  },
};

// ─── Category Suggestion Pills ────────────────────────────────────────────────
// Used in the form to speed up input; user can also type a custom category.

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

// ─── Form Defaults ────────────────────────────────────────────────────────────

export const STATEMENT_FORM_DEFAULTS = {
  title: "",
  description: "",
  category: "",
  skills: [] as string[],
  deadline: null,
};
