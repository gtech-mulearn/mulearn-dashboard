"use client";

/**
 * StepReview — Step 4: Review all inputs before submission
 *
 * 📍 src/features/company-jobs/components/job-stepper/step-review.tsx
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
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className="mt-0.5 break-words text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function StepReview({
  values,
  rules,
  onEditStep,
  isEditing,
}: StepReviewProps) {
  const durationText =
    values.duration_value && values.duration_unit
      ? `${values.duration_value} ${values.duration_unit}`
      : values.duration_value
        ? String(values.duration_value)
        : values.duration_unit || "Not specified";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Review & {isEditing ? "Update" : "Submit"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review all the details before {isEditing ? "updating" : "publishing"}{" "}
          your job listing.
        </p>
      </div>

      {/* Basic Info Section */}
      <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Basic Information
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEditStep(0)}
            className="w-full gap-1 text-xs text-primary sm:w-auto"
          >
            <Edit2 className="h-3 w-3" />
            Edit
          </Button>
        </div>
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
            label="Salary Range"
            value={values.salary_range || "Not specified"}
          />
        </div>
      </div>

      {/* Requirements Section */}
      <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Requirements & Eligibility
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEditStep(1)}
            className="w-full gap-1 text-xs text-primary sm:w-auto"
          >
            <Edit2 className="h-3 w-3" />
            Edit
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ReviewField
            icon={Timer}
            label="Experience"
            value={values.experience || "Not specified"}
          />
        </div>
        {values.job_description && (
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Job Description
            </p>
            <MarkdownRenderer
              content={values.job_description}
              className="text-sm"
            />
          </div>
        )}
      </div>

      {/* Advanced Options Section */}
      <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Advanced Options
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEditStep(1)}
            className="w-full gap-1 text-xs text-primary sm:w-auto"
          >
            <Edit2 className="h-3 w-3" />
            Edit
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ReviewField
            icon={Award}
            label="Certificate Provided"
            value={values.certificate_provided ? "Provided" : "Not Provided"}
          />
          <ReviewField icon={Clock} label="Duration" value={durationText} />
          <ReviewField
            icon={Wallet}
            label="Hourly Rate"
            value={values.hourly_rate || "Not specified"}
          />
          <ReviewField
            icon={Wallet}
            label="Stipend"
            value={values.stipend || "Not specified"}
          />
        </div>
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Deliverables
          </p>
          {values.deliverables && values.deliverables.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {values.deliverables.map((d) => (
                <Badge key={d} variant="secondary" className="text-xs gap-1">
                  <Package className="h-3 w-3" />
                  {d}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Not specified</p>
          )}
        </div>
      </div>

      {/* Rules Section */}
      <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Eligibility Rules ({rules.length})
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEditStep(2)}
            className="w-full gap-1 text-xs text-primary sm:w-auto"
          >
            <Edit2 className="h-3 w-3" />
            Edit
          </Button>
        </div>
        <RuleList rules={rules} readOnly showAddHint={false} />
      </div>
    </div>
  );
}
