/**
 * Company Jobs — Constants
 *
 * 📍 src/features/company-jobs/constants/jobs.constants.ts
 *
 * Static option sets and configuration values used across the feature.
 */

import type { StepDefinition } from "../types";

// ─── Job Type Options ───────────────────────────────────────

export const JOB_TYPE_OPTIONS = [
  { value: "Full-Time", label: "Full-Time" },
  { value: "Part-Time", label: "Part-Time" },
  { value: "Internship", label: "Internship" },
  { value: "Contract", label: "Contract" },
  { value: "Gig", label: "Gig" },
] as const;

// ─── Rule Type Options ──────────────────────────────────────

export const RULE_TYPE_OPTIONS = [
  { value: "min_karma", label: "Min Karma" },
  { value: "max_karma", label: "Max Karma" },
  { value: "min_level", label: "Min Level" },
  { value: "max_level", label: "Max Level" },
  { value: "skill", label: "Skill" },
  { value: "interest_group", label: "Interest Group" },
  { value: "achievement", label: "Achievement" },
] as const;

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

export const DURATION_UNIT_OPTIONS = [
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
  { value: "months", label: "Months" },
] as const;

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
} as const;
