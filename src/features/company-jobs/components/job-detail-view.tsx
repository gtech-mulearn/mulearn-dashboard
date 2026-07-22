"use client";

/**
 * JobDetailView — Full job detail with rules management
 *
 * 📍 src/features/company-jobs/components/job-detail-view.tsx
 */

import {
  ArrowLeft,
  Award,
  Ban,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  Timer,
  Trash2,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { JOB_STATUS_CONFIG } from "../constants";
import { useUpdateJob } from "../hooks";
import type { RuleFormValues } from "../schemas";
import type { Job } from "../types";
import { ApplicantsSection } from "./applicants-section";
import { JobDeleteDialog } from "./job-delete-dialog";
import { RuleAddDialog, RuleList } from "./rules";

// ─── Props ────────────────────────────────────────────────────────────────────

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

  const { mutate: updateJob, isPending: isUpdatingStatus } = useUpdateJob();

  const isClosed = job.status === "Closed";
  const isDraft = job.status === "Draft";
  const canToggleStatus = job.status === "Active" || isClosed || isDraft;

  const handleToggleStatus = () => {
    const nextStatus = isClosed || isDraft ? "Active" : "Closed";
    // Success/error toasts are handled by useUpdateJob's own onSuccess/onError.
    updateJob({ jobId: job.id, payload: { status: nextStatus } });
  };

  const statusConfig =
    JOB_STATUS_CONFIG[job.status as keyof typeof JOB_STATUS_CONFIG] ??
    JOB_STATUS_CONFIG.Active;

  const createdDateObj = job.created_at ? new Date(job.created_at) : null;
  const formattedCreated =
    createdDateObj && !Number.isNaN(createdDateObj.getTime())
      ? createdDateObj.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "N/A";

  const updatedDateObj = job.updated_at ? new Date(job.updated_at) : null;
  const formattedUpdated =
    updatedDateObj && !Number.isNaN(updatedDateObj.getTime())
      ? updatedDateObj.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : null;

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

          <div className="flex flex-wrap gap-2 shrink-0">
            {canToggleStatus && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleStatus}
                disabled={isUpdatingStatus}
                className="gap-1.5"
              >
                {isClosed || isDraft ? (
                  <RefreshCw className="h-3.5 w-3.5" />
                ) : (
                  <Ban className="h-3.5 w-3.5" />
                )}
                {isDraft
                  ? "Publish Job"
                  : isClosed
                    ? "Reopen Job"
                    : "Close Job"}
              </Button>
            )}
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
              {job.location || "Not specified"}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Salary Range
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-foreground">
              <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
              {job.salary_range || "Not specified"}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Experience
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-foreground">
              <Timer className="h-3.5 w-3.5 text-muted-foreground" />
              {job.experience || "Not specified"}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Duration
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-foreground">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              {job.duration_value != null && job.duration_unit
                ? `${job.duration_value} ${job.duration_unit}`
                : job.duration_value != null
                  ? String(job.duration_value)
                  : job.duration_unit || "Not specified"}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Hourly Rate
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-foreground">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              {job.hourly_rate || "Not specified"}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Stipend
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-foreground">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              {job.stipend || "Not specified"}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Certificate
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-foreground">
              <Award className="h-3.5 w-3.5 text-muted-foreground" />
              {job.certificate_provided
                ? "Certificate Provided"
                : "Not Provided"}
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
          <div className="mt-3">
            <MarkdownRenderer
              content={job.job_description}
              className="text-sm"
            />
          </div>
        </div>
      )}

      {/* Deliverables */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground">
          Deliverables
        </h2>
        <div className="mt-3">
          {(() => {
            const items = Array.isArray(job.deliverables)
              ? job.deliverables
              : typeof job.deliverables === "string" &&
                  job.deliverables.trim().length > 0
                ? (() => {
                    const trimmed = job.deliverables.trim();
                    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
                      try {
                        const parsed = JSON.parse(trimmed);
                        if (Array.isArray(parsed))
                          return parsed.map(String).filter(Boolean);
                      } catch {}
                    }
                    return trimmed
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean);
                  })()
                : [];
            return items.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {items.map((d) => (
                  <Badge
                    key={d}
                    variant="secondary"
                    className="gap-1.5 text-sm"
                  >
                    <Package className="h-3.5 w-3.5" />
                    {d}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not specified</p>
            );
          })()}
        </div>
      </div>

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

      {/* Applicants */}
      <ApplicantsSection jobId={job.id} />

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
