"use client";

/**
 * StepReview — Step 4: Review all inputs before submission
 *
 * 📍 src/features/company-jobs/components/job-stepper/step-review.tsx
 *
 * Mirrors the form: only the fields the chosen job type actually uses are
 * summarised, so a Full-Time listing no longer reports "Certificate Provided:
 * Not Provided" for a question it was never asked.
 */

import {
  Award,
  Briefcase,
  Clock,
  Edit2,
  MapPin,
  Package,
  Timer,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { getJobTypeFieldModel } from "../../constants";
import type { JobFormValues } from "../../schemas";
import type { JobRule } from "../../types";
import { RuleList } from "../rules";

interface StepReviewProps {
  values: JobFormValues;
  rules: JobRule[];
  onEditStep: (stepIndex: number) => void;
  isEditing: boolean;
}

function ReviewField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 wrap-break-word text-sm text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  onEdit,
}: {
  title: string;
  onEdit: () => void;
}) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onEdit}
        className="w-full gap-1 text-xs text-primary sm:w-auto"
      >
        <Edit2 className="h-3 w-3" />
        Edit
      </Button>
    </div>
  );
}

export function StepReview({
  values,
  rules,
  onEditStep,
  isEditing,
}: StepReviewProps) {
  const model = getJobTypeFieldModel(values.job_type);

  const compensation =
    model.compensation === "salary"
      ? { label: "Salary Range", value: values.salary_range || "—" }
      : model.compensation === "stipend"
        ? { label: "Monthly Stipend", value: values.stipend || "—" }
        : {
            label: "Hourly Rate",
            value: values.hourly_rate ? `₹${values.hourly_rate} / hour` : "—",
          };

  const hasDuration = values.duration_value != null && !!values.duration_unit;
  const showEngagement =
    model.duration || model.deliverables || model.certificate;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Review &amp; {isEditing ? "Update" : "Submit"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Check the details before {isEditing ? "updating" : "publishing"} your
          listing.
        </p>
      </div>

      {/* Basic Info */}
      <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <SectionHeader title="Basic Information" onEdit={() => onEditStep(0)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <ReviewField
            icon={Briefcase}
            label="Title"
            value={values.title || "—"}
          />
          <ReviewField
            icon={Briefcase}
            label="Job Type"
            value={values.job_type || "—"}
          />
          <ReviewField
            icon={MapPin}
            label="Location"
            value={values.location || "—"}
          />
          <ReviewField
            icon={Wallet}
            label={compensation.label}
            value={compensation.value}
          />
        </div>
      </div>

      {/* Role details */}
      <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <SectionHeader title="Role Details" onEdit={() => onEditStep(1)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <ReviewField
            icon={Timer}
            label="Experience"
            value={values.experience || "—"}
          />
        </div>
        {values.job_description && (
          <div className="mt-4 border-t border-border pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Job Description
            </p>
            <MarkdownRenderer
              content={values.job_description}
              className="text-sm"
            />
          </div>
        )}
      </div>

      {/* Engagement details — only for the job types that use them */}
      {showEngagement && (
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
          <SectionHeader
            title="Engagement Details"
            onEdit={() => onEditStep(1)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {model.duration && (
              <ReviewField
                icon={Clock}
                label="Duration"
                value={
                  hasDuration
                    ? `${values.duration_value} ${values.duration_unit}`
                    : "Not specified"
                }
              />
            )}
            {model.certificate && (
              <ReviewField
                icon={Award}
                label="Completion Certificate"
                value={values.certificate_provided ? "Offered" : "Not offered"}
              />
            )}
          </div>

          {model.deliverables && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Deliverables
              </p>
              {values.deliverables && values.deliverables.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {values.deliverables.map((d) => (
                    <Badge
                      key={d}
                      variant="secondary"
                      className="gap-1 text-xs"
                    >
                      <Package className="h-3 w-3" />
                      {d}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not specified</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Rules */}
      <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <SectionHeader
          title={`Eligibility Rules (${rules.length})`}
          onEdit={() => onEditStep(2)}
        />
        <RuleList rules={rules} readOnly showAddHint={false} />
      </div>
    </div>
  );
}
