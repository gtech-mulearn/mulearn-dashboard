"use client";

/**
 * ValidationSummary — what's still missing, and where to fix it
 *
 * 📍 src/features/company-jobs/components/job-stepper/validation-summary.tsx
 *
 * The Review step renders no inputs, so a failed submit used to write its
 * errors onto fields mounted two steps back and the button simply appeared to
 * do nothing. This lists every outstanding error grouped by step, with a link
 * that jumps straight to the offending step.
 */

import { AlertCircle } from "lucide-react";
import type { FieldErrors } from "react-hook-form";
import { JOB_STEPPER_STEPS } from "../../constants";
import type { JobFormValues } from "../../schemas";
import type { StepId } from "../../types";

/** Human names for form fields, used in the summary list. */
const FIELD_LABELS: Record<keyof JobFormValues, string> = {
  title: "Job title",
  job_type: "Job type",
  location: "Location",
  salary_range: "Salary range",
  stipend: "Monthly stipend",
  hourly_rate: "Hourly rate",
  experience: "Experience required",
  job_description: "Job description",
  duration_value: "Duration",
  duration_unit: "Duration unit",
  deliverables: "Deliverables",
  certificate_provided: "Completion certificate",
};

interface ValidationSummaryProps {
  errors: FieldErrors<JobFormValues>;
  fieldsByStep: Record<StepId, (keyof JobFormValues)[]>;
  onJumpToStep: (index: number) => void;
}

export function ValidationSummary({
  errors,
  fieldsByStep,
  onJumpToStep,
}: ValidationSummaryProps) {
  const groups = JOB_STEPPER_STEPS.map((step, index) => ({
    index,
    label: step.label,
    issues: fieldsByStep[step.id]
      .filter((field) => errors[field])
      .map((field) => ({
        field,
        label: FIELD_LABELS[field],
        message: String(errors[field]?.message ?? "Needs attention"),
      })),
  })).filter((group) => group.issues.length > 0);

  if (groups.length === 0) return null;

  const total = groups.reduce((sum, g) => sum + g.issues.length, 0);

  return (
    <div
      role="alert"
      aria-live="polite"
      className="rounded-lg border border-destructive/30 bg-destructive/5 p-4"
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
        <p className="text-sm font-semibold text-destructive">
          {total === 1
            ? "1 thing needs fixing before you can post this"
            : `${total} things need fixing before you can post this`}
        </p>
      </div>

      <ul className="mt-3 space-y-3">
        {groups.map((group) => (
          <li key={group.index}>
            <button
              type="button"
              onClick={() => onJumpToStep(group.index)}
              className="text-xs font-medium text-destructive underline underline-offset-2 hover:no-underline"
            >
              {group.label}
            </button>
            <ul className="mt-1 space-y-1">
              {group.issues.map((issue) => (
                <li
                  key={issue.field}
                  className="text-sm text-foreground/80 before:mr-2 before:text-destructive before:content-['•']"
                >
                  <span className="font-medium">{issue.label}</span> —{" "}
                  {issue.message}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
