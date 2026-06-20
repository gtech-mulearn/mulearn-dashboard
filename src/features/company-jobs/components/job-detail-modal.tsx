/**
 * JobDetailModal
 *
 * 📍 src/features/company-jobs/components/job-detail-modal.tsx
 *
 * Full detail modal for a public job listing.
 * Shows all job fields and lets the learner apply with an optional cover note.
 */

"use client";

import {
  Award,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  Package,
  Timer,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  useApplyJob,
  useLearnerApplications,
  useResubmitApplication,
  useTrackJobView,
} from "../hooks";
import type { PublicJob } from "../types";

interface JobDetailModalProps {
  job: PublicJob | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDate(iso: string) {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime())
    ? d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A";
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

export function JobDetailModal({
  job,
  open,
  onOpenChange,
}: JobDetailModalProps) {
  const [coverNote, setCoverNote] = useState("");
  const [resumeLink, setResumeLink] = useState("");
  const {
    mutate: apply,
    isPending: isApplying,
    isSuccess: applySuccess,
  } = useApplyJob();
  const {
    mutate: resubmit,
    isPending: isResubmitting,
    isSuccess: resubmitSuccess,
  } = useResubmitApplication();
  const { mutate: trackView } = useTrackJobView();

  const { data: appsResponse } = useLearnerApplications();
  const existingApp = appsResponse?.applications.find(
    (app) => app.job.id === job?.id,
  );
  const isRejected = existingApp?.status === "rejected";
  const isAlreadyApplied = existingApp && !isRejected;
  const isPending = isApplying || isResubmitting;
  const isSuccess = applySuccess || resubmitSuccess;
  // A job that is not Active (e.g. Closed) no longer accepts applications.
  const isClosed = !!job && job.status != null && job.status !== "Active";

  useEffect(() => {
    if (open && job?.id) {
      trackView(job.id);
    }
  }, [open, job?.id, trackView]);

  const handleApply = () => {
    if (!job || !resumeLink.trim() || isAlreadyApplied) return;

    const onSuccessOptions = {
      onSuccess: () => {
        setTimeout(() => {
          onOpenChange(false);
          setCoverNote("");
          setResumeLink("");
        }, 1200);
      },
    };

    if (isRejected && existingApp) {
      resubmit(
        {
          appId: existingApp.id,
          payload: {
            resume_link: resumeLink.trim(),
            cover_letter: coverNote.trim() || undefined,
          },
        },
        onSuccessOptions,
      );
    } else {
      apply(
        {
          jobId: job.id,
          resume_link: resumeLink.trim(),
          cover_letter: coverNote.trim() || undefined,
        },
        onSuccessOptions,
      );
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setCoverNote("");
      setResumeLink("");
    }
    onOpenChange(open);
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">{job.title}</DialogTitle>
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <div className="pr-8">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {job.job_type && (
                <Badge variant="secondary" className="capitalize text-xs">
                  <Briefcase className="h-3 w-3 mr-1" />
                  {job.job_type.replace(/_/g, " ")}
                </Badge>
              )}
            </div>
            <h2 className="text-xl font-bold text-foreground leading-tight">
              {job.title}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {job.company_name && (
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <Briefcase className="h-3.5 w-3.5" />
                  {job.company_name}
                </span>
              )}
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.location}
                </span>
              )}
              {job.created_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Posted {formatDate(job.created_at)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Requirements */}
          <Section title="Requirements">
            <div className="flex flex-wrap gap-2">
              {job.experience && (
                <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
                  <Timer className="h-4 w-4 text-primary" />
                  <span className="font-medium">{job.experience}</span>
                </div>
              )}
            </div>
          </Section>

          {/* Job Description */}
          {job.job_description && (
            <Section title="Job Description">
              <MarkdownRenderer
                content={job.job_description}
                className="text-sm"
              />
            </Section>
          )}

          {/* Compensation */}
          {(job.salary_range || job.stipend || job.hourly_rate) && (
            <Section title="Compensation">
              <div className="flex flex-wrap gap-2">
                {job.salary_range && (
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{job.salary_range}</span>
                  </div>
                )}
                {job.stipend && (
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>Stipend: {job.stipend}</span>
                  </div>
                )}
                {job.hourly_rate && (
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>₹{job.hourly_rate}/hr</span>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Duration */}
          {job.duration_value && job.duration_unit && (
            <Section title="Duration">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm w-fit">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {job.duration_value} {job.duration_unit}
                </span>
              </div>
            </Section>
          )}

          {/* Deliverables */}
          {job.deliverables && (
            <Section title="Deliverables">
              {Array.isArray(job.deliverables) ? (
                <ul className="space-y-1.5">
                  {job.deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm">
                      <Package className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-start gap-2 text-sm">
                  <Package className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <span>{job.deliverables}</span>
                </div>
              )}
            </Section>
          )}

          {/* Perks */}
          {job.certificate_provided && (
            <Section title="Perks">
              <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 text-sm w-fit">
                <Award className="h-4 w-4 text-primary" />
                <span className="font-medium text-primary">
                  Certificate Provided
                </span>
              </div>
            </Section>
          )}

          {/* Eligibility Rules */}
          {job.rules && job.rules.length > 0 && (
            <Section title="Eligibility Rules">
              <ul className="space-y-1.5">
                {job.rules.map((rule) => (
                  <li key={rule.id} className="flex items-start gap-2 text-sm">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span>
                      {rule.rule_value}
                      {rule.rule_type && (
                        <span className="ml-1.5 text-xs text-muted-foreground capitalize">
                          ({rule.rule_type.replace(/_/g, " ")})
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Separator />

          {/* Cover note or success state */}
          {isSuccess ? (
            <div className="flex items-start gap-3 rounded-xl bg-success/10 border border-success/20 px-4 py-3">
              <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-success">
                  Application submitted!
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Track your application in the My Applications tab.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Resume Link */}
              <div className="space-y-1.5">
                <label
                  htmlFor="modal-resume-link"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Resume Link{" "}
                  <span className="text-destructive font-normal normal-case">
                    *
                  </span>
                </label>
                <Input
                  id="modal-resume-link"
                  type="url"
                  placeholder="e.g., Google Drive, Notion, Portfolio URL…"
                  value={resumeLink}
                  onChange={(e) => setResumeLink(e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>

              {/* Cover note */}
              <div className="space-y-1.5">
                <label
                  htmlFor="modal-cover-note"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Cover note{" "}
                  <span className="font-normal normal-case">(optional)</span>
                </label>
                <Textarea
                  id="modal-cover-note"
                  placeholder="Tell the company why you're a great fit…"
                  rows={3}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  className="resize-none"
                  disabled={isPending}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2 shrink-0">
          {isClosed && !isSuccess && (
            <p className="mr-auto text-sm text-muted-foreground">
              This job is no longer accepting applications.
            </p>
          )}
          <Button variant="ghost" onClick={() => handleClose(false)}>
            {isSuccess ? "Close" : "Cancel"}
          </Button>
          {!isSuccess && !isClosed && (
            <Button
              onClick={handleApply}
              disabled={isPending || !resumeLink.trim() || isAlreadyApplied}
            >
              {isAlreadyApplied
                ? "Already Applied"
                : isPending
                  ? isRejected
                    ? "Resubmitting…"
                    : "Applying…"
                  : isRejected
                    ? "Resubmit Application"
                    : "Apply Now"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
