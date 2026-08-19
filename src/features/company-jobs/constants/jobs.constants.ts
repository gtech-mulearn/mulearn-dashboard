/**
 * Company Jobs — Constants
 *
 * 📍 src/features/company-jobs/constants/jobs.constants.ts
 *
 * Static option sets and configuration values used across the feature.
 */

import type { JobSortValue, StepDefinition } from "../types";

export const JOB_SORT_DEFAULT: JobSortValue = "-created_at";

export const JOB_SORT_OPTIONS: readonly {
  value: JobSortValue;
  label: string;
}[] = [
  { value: "-created_at", label: "Latest first" },
  { value: "created_at", label: "Oldest first" },
  { value: "title", label: "Title (A–Z)" },
  { value: "-title", label: "Title (Z–A)" },
] as const;

// ─── Backend column limits ──────────────────────────────────
// Mirrors db/job.py :: CompanyJob exactly. A form rule may be stricter than
// the column, never looser — anything looser reaches the API as a 400.

export const JOB_FIELD_LIMITS = {
  /** CharField(max_length=75) — required */
  title: 75,
  /** CharField(max_length=20) */
  experience: 20,
  /** CharField(max_length=75) */
  location: 75,
  /** CharField(max_length=36) */
  salaryRange: 36,
  /** CharField(max_length=75) */
  stipend: 75,
  /** TextField — no DB limit; kept as a sanity bound */
  jobDescription: 10000,
  /** DecimalField(max_digits=10, decimal_places=2) → 8 integer digits */
  hourlyRateIntegerDigits: 8,
  hourlyRateDecimalPlaces: 2,
  /** PositiveSmallIntegerField → SMALLINT UNSIGNED, so 0–32767 is the real ceiling */
  durationValueMax: 32767,
} as const;

/** DecimalField(max_digits=10, decimal_places=2): digits only, ≤2 dp. */
export const HOURLY_RATE_PATTERN = /^\d{1,8}(\.\d{1,2})?$/;

// ─── Job Type Options ───────────────────────────────────────
// Values match the backend enum in db/job.py :: CompanyJob.job_type
// (# Enum: Hybrid, Full-Time, Remote, Part-Time, Internship, Gig).
// Note the column is a plain CharField(20) with no DB-level ENUM, so this list
// is a contract we choose to honour rather than one the database enforces.

export const JOB_TYPE_VALUES = [
  "Full-Time",
  "Part-Time",
  "Remote",
  "Hybrid",
  "Internship",
  "Gig",
] as const;

export type JobTypeValue = (typeof JOB_TYPE_VALUES)[number];

export const JOB_TYPE_OPTIONS: readonly {
  value: JobTypeValue;
  label: string;
  hint: string;
}[] = [
  {
    value: "Full-Time",
    label: "Full-Time",
    hint: "Permanent role, on-site",
  },
  {
    value: "Part-Time",
    label: "Part-Time",
    hint: "Permanent role, reduced hours",
  },
  { value: "Remote", label: "Remote", hint: "Permanent role, fully remote" },
  { value: "Hybrid", label: "Hybrid", hint: "Permanent role, split on-site" },
  {
    value: "Internship",
    label: "Internship",
    hint: "Fixed-term, stipend paid",
  },
  { value: "Gig", label: "Gig", hint: "Short project, paid hourly" },
] as const;

export function isJobTypeValue(value: string): value is JobTypeValue {
  return (JOB_TYPE_VALUES as readonly string[]).includes(value);
}

// ─── Which fields each job type actually uses ───────────────
// The wizard previously showed every optional column to every job type behind
// one "Advanced options" drawer, so a Full-Time listing was asked about
// deliverables and completion certificates. Each job type now declares only
// the fields that mean something for it.
//
// Safe because the backend requires ONLY title and job_type; every field
// gated here is null=True, blank=True on the model, so omitting it is valid.

export type CompensationKind = "salary" | "stipend" | "hourly";

export interface JobTypeFieldModel {
  /** The single compensation field this job type uses. Always required. */
  compensation: CompensationKind;
  /** Fixed-term engagement → duration_value + duration_unit apply. */
  duration: boolean;
  /** Scoped piece of work → a deliverables list applies. */
  deliverables: boolean;
  /** Completion certificate is a meaningful offer for this job type. */
  certificate: boolean;
}

const SALARIED: JobTypeFieldModel = {
  compensation: "salary",
  duration: false,
  deliverables: false,
  certificate: false,
};

export const JOB_TYPE_FIELD_MODEL: Record<JobTypeValue, JobTypeFieldModel> = {
  "Full-Time": SALARIED,
  "Part-Time": SALARIED,
  Remote: SALARIED,
  Hybrid: SALARIED,
  Internship: {
    compensation: "stipend",
    duration: true,
    deliverables: false,
    certificate: true,
  },
  Gig: {
    compensation: "hourly",
    duration: true,
    deliverables: true,
    certificate: true,
  },
};

/** Falls back to the salaried shape while no job type is chosen yet. */
export function getJobTypeFieldModel(
  jobType: string | undefined,
): JobTypeFieldModel {
  if (!jobType || !isJobTypeValue(jobType)) return SALARIED;
  return JOB_TYPE_FIELD_MODEL[jobType];
}

export const COMPENSATION_FIELD: Record<
  CompensationKind,
  "salary_range" | "stipend" | "hourly_rate"
> = {
  salary: "salary_range",
  stipend: "stipend",
  hourly: "hourly_rate",
};

// ─── Rule Type Options ──────────────────────────────────────

export const RULE_TYPE_OPTIONS = [
  { value: "min_karma", label: "Min Karma" },
  { value: "max_karma", label: "Max Karma" },
  { value: "min_level", label: "Min Level" },
  { value: "max_level", label: "Max Level" },
] as const;

// ─── Rule value input categories ────────────────────────────
// Drive the Add-Rule value field: Karma → numeric input, Level → dropdown of
// fetched levels (value = level_order). Both are compared via int() on the
// backend, so they MUST be non-negative integers.

export const KARMA_RULE_TYPES = ["min_karma", "max_karma"] as const;
export const LEVEL_RULE_TYPES = ["min_level", "max_level"] as const;

export function formatNumericRuleValue(
  rule_type: string,
  rule_value: string,
): string | number {
  if (
    (KARMA_RULE_TYPES as readonly string[]).includes(rule_type) ||
    (LEVEL_RULE_TYPES as readonly string[]).includes(rule_type)
  ) {
    return Number.isNaN(Number(rule_value)) ? "0" : parseInt(rule_value, 10);
  }
  return rule_value;
}

// ─── Min Level Options ──────────────────────────────────────

export const MIN_LEVEL_OPTIONS = [
  { value: 1, label: "Level 1" },
  { value: 2, label: "Level 2" },
  { value: 3, label: "Level 3" },
  { value: 4, label: "Level 4" },
  { value: 5, label: "Level 5" },
  { value: 6, label: "Level 6" },
  { value: 7, label: "Level 7" },
] as const;

// ─── Duration Unit Options ──────────────────────────────────

// Backend: CharField(max_length=20) # Enum: days, weeks, months
export const DURATION_UNIT_VALUES = ["days", "weeks", "months"] as const;

export type DurationUnitValue = (typeof DURATION_UNIT_VALUES)[number];

export const DURATION_UNIT_OPTIONS: readonly {
  value: DurationUnitValue;
  label: string;
}[] = [
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
  { value: "months", label: "Months" },
] as const;

export function isDurationUnitValue(value: string): value is DurationUnitValue {
  return (DURATION_UNIT_VALUES as readonly string[]).includes(value);
}

// ─── Stepper Steps ──────────────────────────────────────────

export const JOB_STEPPER_STEPS: StepDefinition[] = [
  {
    id: "basic-info",
    label: "Basic Info",
    description: "Job title, type, and location",
  },
  {
    id: "requirements",
    label: "Requirements",
    description: "Experience, description, and eligibility thresholds",
  },
  {
    id: "rules",
    label: "Eligibility Rules",
    description: "Skills, interests, and achievements required",
  },
  {
    id: "review",
    label: "Review & Submit",
    description: "Review all details before publishing",
  },
] as const;

// ─── Pagination Defaults ────────────────────────────────────

export const JOBS_DEFAULT_PAGE_SIZE = 10;
export const JOBS_DEFAULT_PAGE_INDEX = 1;

// ─── Status Display Config ──────────────────────────────────

export const COMPANY_STATUS_CONFIG = {
  verified: {
    label: "Active",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    message: "Your company is verified and active.",
  },
  pending: {
    label: "Pending Verification",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    message:
      "Your company is awaiting admin verification. Job management will be available once approved.",
  },
  rejected: {
    label: "Rejected",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    message:
      "Your company verification was rejected. Please review the feedback and resubmit.",
  },
  inactive: {
    label: "Inactive",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    message:
      "Your company profile is inactive. Contact support for assistance.",
  },
  deactivated: {
    label: "Deactivated",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    message: "This company has been deactivated.",
  },
} as const;

export const JOB_STATUS_CONFIG = {
  Active: {
    label: "Active",
    dotColor: "bg-emerald-500",
    textColor: "text-emerald-700",
    bgColor: "bg-emerald-50",
  },
  Inactive: {
    label: "Inactive",
    dotColor: "bg-gray-400",
    textColor: "text-gray-600",
    bgColor: "bg-gray-50",
  },
  Draft: {
    label: "Draft",
    dotColor: "bg-amber-500",
    textColor: "text-amber-700",
    bgColor: "bg-amber-50",
  },
  "Pending Approval": {
    label: "Pending Approval",
    dotColor: "bg-blue-500",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
  },
  "Needs Revision": {
    label: "Needs Revision",
    dotColor: "bg-amber-500",
    textColor: "text-amber-700",
    bgColor: "bg-amber-50",
  },
  Rejected: {
    label: "Rejected",
    dotColor: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
  },
  Closed: {
    label: "Closed",
    dotColor: "bg-rose-500",
    textColor: "text-rose-700",
    bgColor: "bg-rose-50",
  },
  Expired: {
    label: "Expired",
    dotColor: "bg-gray-400",
    textColor: "text-gray-600",
    bgColor: "bg-gray-50",
  },
} as const;
