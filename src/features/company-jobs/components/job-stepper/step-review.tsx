"use client";

/**
 * StepReview — Step 4: Review all inputs before submission
 *
 * 📍 src/features/company-jobs/components/job-stepper/step-review.tsx
 */

import {
  Briefcase,
  Edit2,
  MapPin,
  Sparkles,
  Star,
  Timer,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
            value={values.salary_range || "—"}
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
            value={values.experience || "—"}
          />
          <ReviewField
            icon={Sparkles}
            label="Min Karma"
            value={values.min_karma}
          />
          <ReviewField
            icon={Star}
            label="Min Level"
            value={`Level ${values.min_level}`}
          />
        </div>
        {values.job_description && (
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Job Description
            </p>
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {values.job_description}
            </p>
          </div>
        )}
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
