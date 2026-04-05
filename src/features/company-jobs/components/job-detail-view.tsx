"use client";

/**
 * JobDetailView — Full job detail with rules management
 *
 * 📍 src/features/company-jobs/components/job-detail-view.tsx
 */

import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Edit,
  MapPin,
  Plus,
  Sparkles,
  Star,
  Trash2,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { JOB_STATUS_CONFIG } from "../constants";
import type { RuleFormValues } from "../schemas";
import type { Job } from "../types";
import { JobDeleteDialog } from "./job-delete-dialog";
import { RuleAddDialog, RuleList } from "./rules";

interface JobDetailViewProps {
  job: Job;
  onBack: () => void;
  onEdit: (jobId: string) => void;
  onDelete: (jobId: string) => void;
  onAddRule: (values: RuleFormValues) => void;
  onDeleteRule: (ruleId: string) => void;
  isDeleting: boolean;
  isAddingRule: boolean;
  deletingRuleId: string | null;
}

export function JobDetailView({
  job,
  onBack,
  onEdit,
  onDelete,
  onAddRule,
  onDeleteRule,
  isDeleting,
  isAddingRule,
  deletingRuleId,
}: JobDetailViewProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRuleDialog, setShowRuleDialog] = useState(false);

  const statusConfig =
    JOB_STATUS_CONFIG[job.status as keyof typeof JOB_STATUS_CONFIG] ??
    JOB_STATUS_CONFIG.Active;

  const formattedCreated = new Date(job.created_at).toLocaleDateString(
    "en-IN",
    { day: "numeric", month: "long", year: "numeric" },
  );
  const formattedUpdated = new Date(job.updated_at).toLocaleDateString(
    "en-IN",
    { day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Button>

      {/* Header card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {job.title}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotColor}`}
                />
                {statusConfig.label}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5" />
              <span>{job.job_type}</span>
              {job.experience && (
                <>
                  <span className="text-border">•</span>
                  <span>{job.experience}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(job.id)}
              className="gap-1.5"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>

        {/* Details grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 border-t border-border pt-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Location
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-foreground">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              {job.location}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Salary Range
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-foreground">
              <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
              {job.salary_range}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Min Karma
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
              {job.min_karma}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Min Level
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-foreground">
              <Star className="h-3.5 w-3.5 text-muted-foreground" />
              Level {job.min_level}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {job.job_description && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-foreground">
            Job Description
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {job.job_description}
          </p>
        </div>
      )}

      {/* Eligibility Rules */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Eligibility Rules
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {job.rules.length} rule{job.rules.length !== 1 ? "s" : ""}{" "}
              configured
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowRuleDialog(true)}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Rule
          </Button>
        </div>
        <div className="mt-4">
          <RuleList
            rules={job.rules}
            onDeleteRule={onDeleteRule}
            deletingRuleId={deletingRuleId}
          />
        </div>
      </div>

      {/* Timestamps */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Created: {formattedCreated}
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Updated: {formattedUpdated}
        </div>
      </div>

      {/* Dialogs */}
      <JobDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => {
          onDelete(job.id);
          setShowDeleteDialog(false);
        }}
        jobTitle={job.title}
        isDeleting={isDeleting}
      />

      <RuleAddDialog
        open={showRuleDialog}
        onOpenChange={setShowRuleDialog}
        onSubmit={(values) => {
          onAddRule(values);
          setShowRuleDialog(false);
        }}
        isPending={isAddingRule}
      />
    </div>
  );
}
