/**
 * Company Jobs — Form values → API payload
 *
 * 📍 src/features/company-jobs/lib/job-payload.ts
 *
 * The single place where wizard state is translated into the wire format the
 * Django serializer accepts. Keeping it here (rather than inline in the create
 * and edit page clients) is what stops the two flows from drifting apart.
 *
 * Backend contract — db/job.py :: CompanyJob
 *   certificate_provided  CharField(max_length=3)   # Enum: Yes, No
 *   hourly_rate           DecimalField(10, 2)
 *   deliverables          JSONField
 *   duration_value/unit   must be supplied together (serializer.validate)
 *
 * Two rules this module exists to enforce:
 *
 * 1. `certificate_provided` must be the string "Yes", or absent. DRF's
 *    CharField rejects booleans outright with "Not a valid string." — sending
 *    `true` was the cause of the 400 on job creation. The column is nullable,
 *    so "no certificate" is expressed by omitting the field, not by "No".
 *
 * 2. Clearing a field means `null`, never `""`. DecimalField and JSONField both
 *    reject an empty string, so switching a job from Gig to Full-Time has to
 *    null out hourly_rate/deliverables rather than blank them.
 */

import { getJobTypeFieldModel } from "../constants/jobs.constants";
import type { JobFormValues } from "../schemas/jobs.schema";
import type { CreateJobPayload, JobRule, UpdateJobPayload } from "../types";

/**
 * Builds the payload body shared by create and update.
 *
 * `absent` is what a non-applicable field becomes:
 *   - `undefined` on create — the key is dropped from the JSON entirely.
 *   - `null` on update — the key is sent explicitly so PATCH clears the column.
 */
function buildJobBody<TAbsent extends undefined | null>(
  values: JobFormValues,
  absent: TAbsent,
) {
  const model = getJobTypeFieldModel(values.job_type);

  /** Non-empty trimmed text, or the absent marker. */
  const text = (value: string | undefined) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : absent;
  };

  // The serializer raises if only one half of the pair is present, so they are
  // emitted together or not at all.
  const hasDuration =
    model.duration && values.duration_value != null && !!values.duration_unit;

  const deliverables = model.deliverables
    ? (values.deliverables ?? []).map((d) => d.trim()).filter(Boolean)
    : [];

  return {
    title: values.title.trim(),
    job_type: values.job_type,
    location: values.location.trim(),
    experience: values.experience.trim(),
    job_description: values.job_description.trim(),

    // Exactly one compensation field applies; the others are cleared.
    salary_range:
      model.compensation === "salary" ? text(values.salary_range) : absent,
    stipend: model.compensation === "stipend" ? text(values.stipend) : absent,
    hourly_rate:
      model.compensation === "hourly" ? text(values.hourly_rate) : absent,

    duration_value: hasDuration ? Number(values.duration_value) : absent,
    duration_unit: hasDuration ? values.duration_unit : absent,

    deliverables: deliverables.length > 0 ? deliverables : absent,

    // Optional column (null=True, blank=True). Only assert "Yes" when the
    // company actually offers a certificate — sending "No" would record a
    // claim the user never made, and an unset value is equally valid.
    certificate_provided:
      model.certificate && values.certificate_provided === true
        ? "Yes"
        : absent,
  };
}

/** POST /dashboard/company/jobs/ — omits every field that does not apply. */
export function buildCreateJobPayload(
  values: JobFormValues,
  rules: JobRule[] = [],
): CreateJobPayload {
  const body = buildJobBody(values, undefined);

  return {
    ...body,
    ...(rules.length > 0
      ? {
          rules: rules.map((r) => ({
            rule_type: r.rule_type,
            rule_value: r.rule_value,
          })),
        }
      : {}),
  } as CreateJobPayload;
}

/** PATCH /dashboard/company/jobs/{id}/ — nulls every field that no longer applies. */
export function buildUpdateJobPayload(values: JobFormValues): UpdateJobPayload {
  return buildJobBody(values, null) as UpdateJobPayload;
}
