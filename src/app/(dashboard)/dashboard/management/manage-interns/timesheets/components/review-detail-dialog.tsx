"use client";

import { CheckCircle2, Sparkles, Star, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Textarea } from "@/components/ui/textarea";
import {
  formatDateOnly,
  formatReviewMonth,
  formatTaskStatus,
  formatTeam,
  type TAdminMonthlyReview,
  type TReviewer,
  type TTimesheet,
  useReviewMonthlyReview,
  useSaveTimesheetReviewNote,
} from "@/features/intern";

const REVIEW_NOTE_MAX = 300;

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
        {label}
      </span>
      {children}
    </div>
  );
}

function TextBlock({
  label,
  value,
  tone = "muted",
  icon,
}: {
  label: string;
  value: string | null | undefined;
  tone?: "muted" | "danger";
  icon?: React.ReactNode;
}) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1 border-t border-border/20 pt-3">
      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1">
        {icon}
        {label}
      </span>
      <p
        className={`p-2.5 rounded-lg text-xs mt-1 border leading-relaxed break-words ${
          tone === "danger"
            ? "bg-destructive/5 text-destructive border-destructive/20 font-semibold"
            : "bg-muted/20 border-border/10 text-foreground font-medium"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ReviewStatusBadge({ status }: { status: string }) {
  if (status === "APPROVED") {
    return (
      <Badge
        variant="outline"
        className="gap-1.5 text-success border-success/30 font-bold uppercase text-xs"
      >
        <CheckCircle2 className="w-3 h-3" /> Approved
      </Badge>
    );
  }
  if (status === "REJECTED") {
    return (
      <Badge
        variant="outline"
        className="gap-1.5 text-destructive border-destructive/30 font-bold uppercase text-xs"
      >
        <XCircle className="w-3 h-3" /> Rejected
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="gap-1.5 text-warning border-warning/30 font-bold uppercase text-xs"
    >
      Pending
    </Badge>
  );
}

function ReviewedBy({
  reviewer,
  at,
}: {
  reviewer: TReviewer | null;
  at: string | null;
}) {
  if (!reviewer && !at) return null;
  return (
    <p className="text-[10px] text-muted-foreground">
      Reviewed
      {reviewer && ` by ${reviewer.full_name} (${reviewer.muid})`}
      {at && ` · ${new Date(at).toLocaleString()}`}
    </p>
  );
}

function DailyTimesheetDetails({
  timesheet,
  reviewNote,
  onReviewNoteChange,
}: {
  timesheet: TTimesheet;
  reviewNote: string;
  onReviewNoteChange: (note: string) => void;
}) {
  return (
    <div className="space-y-4 py-2 my-2 text-sm max-h-[60vh] overflow-y-auto pr-1 w-full min-w-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Intern">
          <span className="font-bold text-foreground text-sm">
            {timesheet.user_name || "Unknown"}
          </span>
        </Field>
        <Field label="MUID">
          <span className="font-bold text-foreground text-sm">
            {timesheet.muid || "-"}
          </span>
        </Field>
        <Field label="Time Spent">
          <span className="font-bold text-foreground text-sm">
            {timesheet.hours} Hour{Number(timesheet.hours) !== 1 ? "s" : ""}
          </span>
        </Field>
        <Field label="Log Date">
          <span className="font-bold text-foreground text-sm">
            {new Date(`${timesheet.entry_date}T00:00:00`).toLocaleDateString(
              undefined,
              {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric",
              },
            )}
          </span>
        </Field>
        <Field label="Team">
          <span className="font-bold text-foreground text-sm">
            {formatTeam(timesheet.team)}
          </span>
        </Field>
      </div>

      <Field label="Log Description">
        {timesheet.description ? (
          <div className="bg-muted/40 p-2.5 rounded-lg border border-border/20 max-h-40 overflow-y-auto leading-relaxed mt-1">
            <MarkdownRenderer
              content={timesheet.description}
              className="text-xs"
            />
          </div>
        ) : (
          <p className="text-xs italic text-muted-foreground mt-1">
            No description provided.
          </p>
        )}
      </Field>

      {timesheet.task && timesheet.task.length > 0 && (
        <Field label="Task Updates">
          <ul className="space-y-1.5 mt-1">
            {timesheet.task.map((t) => (
              <li
                key={t.task_id}
                className="bg-muted/30 p-2 rounded-lg border border-border/10 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-foreground">{t.title}</span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-brand-blue">
                    {formatTaskStatus(t.status)}
                  </span>
                </div>
                {t.remark && (
                  <p className="text-muted-foreground mt-1">{t.remark}</p>
                )}
              </li>
            ))}
          </ul>
        </Field>
      )}

      <TextBlock label="Blockers" value={timesheet.blockers} tone="danger" />
      <TextBlock label="End of Day Note" value={timesheet.end_of_day_note} />
      <TextBlock label="Edit Reason" value={timesheet.edit_reason} />

      <div className="space-y-2 pt-3 border-t border-border/20 flex flex-col gap-1">
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center justify-between">
          Review Note
          <span className="tabular-nums">
            {reviewNote.length}/{REVIEW_NOTE_MAX}
          </span>
        </span>
        <Textarea
          value={reviewNote}
          maxLength={REVIEW_NOTE_MAX}
          onChange={(e) => onReviewNoteChange(e.target.value)}
          placeholder="Feedback visible to the intern (no approval needed)..."
          className="min-h-[80px] text-xs font-semibold resize-none"
        />
        <ReviewedBy
          reviewer={timesheet.reviewed_by}
          at={timesheet.reviewed_at}
        />
      </div>
    </div>
  );
}

function MonthlyReviewDetails({
  review,
  reviewNote,
  onReviewNoteChange,
}: {
  review: TAdminMonthlyReview;
  reviewNote: string;
  onReviewNoteChange: (note: string) => void;
}) {
  const remarks = review.task_remarks;
  return (
    <div className="space-y-4 py-2 my-2 text-sm max-h-[60vh] overflow-y-auto pr-1 w-full min-w-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Intern">
          <span className="font-bold text-foreground text-sm">
            {review.user_name || "Unknown"}
          </span>
        </Field>
        <Field label="MUID">
          <span className="font-bold text-foreground text-sm">
            {review.muid || "-"}
          </span>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Team">
          <div className="inline-flex items-center rounded-full border border-border/40 px-2 py-0.5 text-foreground font-bold text-xs uppercase tracking-wider mt-1 w-fit">
            {formatTeam(review.team)}
          </div>
        </Field>
        <Field label="Leave Days">
          <span className="font-bold text-foreground text-sm">
            {review.leave_days}
          </span>
        </Field>
        <Field label="Status">
          <div className="mt-1">
            <ReviewStatusBadge status={review.status} />
          </div>
        </Field>
      </div>

      {remarks?.rating ? (
        <div className="flex flex-col gap-1 border-t border-border/20 pt-3">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
            Self Rating
          </span>
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((num) => (
              <Star
                key={num}
                className={`w-4 h-4 ${
                  num <= (remarks.rating || 0)
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
            <span className="text-xs font-bold ml-1 text-foreground">
              {remarks.rating} / 5
            </span>
          </div>
        </div>
      ) : null}

      {review.monthly_review && (
        <div className="flex flex-col gap-1 border-t border-border/20 pt-3">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
            Monthly Summary
          </span>
          <div className="bg-muted/40 p-2.5 rounded-lg border border-border/20 max-h-40 overflow-y-auto leading-relaxed mt-1">
            <MarkdownRenderer
              content={review.monthly_review}
              className="text-xs"
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1 border-t border-border/20 pt-3">
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
          Tasks Completed
        </span>
        {review.tasks_completed.length === 0 ? (
          <p className="text-xs italic text-muted-foreground mt-1">
            No completed tasks this month.
          </p>
        ) : (
          <ul className="space-y-1.5 mt-1">
            {review.tasks_completed.map((t) => (
              <li
                key={t.task_id}
                className="bg-muted/30 p-2 rounded-lg border border-border/10 text-xs flex flex-wrap items-center justify-between gap-2"
              >
                <span className="font-bold text-foreground">
                  {t.output_link ? (
                    <a
                      href={t.output_link}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline text-brand-blue"
                    >
                      {t.title}
                    </a>
                  ) : (
                    t.title
                  )}
                </span>
                <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider">
                  <span className="text-muted-foreground">{t.complexity}</span>
                  <span className="text-brand-blue">
                    {formatTaskStatus(t.final_status)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <TextBlock
        label="Key Learnings"
        value={remarks?.learnings}
        icon={<Sparkles className="w-3.5 h-3.5 text-brand-blue" />}
      />
      <TextBlock label="Challenges Faced" value={remarks?.challenges_faced} />
      <TextBlock label="Next Month Plan" value={remarks?.next_month_plan} />
      <TextBlock label="Blockers" value={review.blockers} tone="danger" />
      <TextBlock label="Suggestions" value={review.suggestions} />

      {review.status === "PENDING" ? (
        <div className="space-y-2 pt-3 border-t border-border/20 flex flex-col gap-1">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            Review Notes / Feedback
            <span className="tabular-nums">
              {reviewNote.length}/{REVIEW_NOTE_MAX}
            </span>
          </span>
          <Textarea
            value={reviewNote}
            maxLength={REVIEW_NOTE_MAX}
            onChange={(e) => onReviewNoteChange(e.target.value)}
            placeholder="Feedback visible to the intern..."
            className="min-h-[80px] text-xs font-semibold resize-none"
          />
        </div>
      ) : (
        (review.review_note || review.reviewed_at) && (
          <div className="pt-3 border-t border-border/20 flex flex-col gap-1">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
              Council Review Note
            </span>
            {review.review_note && (
              <p className="p-2.5 bg-muted/20 border rounded-lg text-xs mt-1 text-muted-foreground leading-relaxed break-words">
                {review.review_note}
              </p>
            )}
            <ReviewedBy reviewer={review.reviewed_by} at={review.reviewed_at} />
          </div>
        )
      )}
    </div>
  );
}

interface ReviewDetailDialogProps {
  selectedTimesheet: TTimesheet | null;
  selectedMonthlyReview: TAdminMonthlyReview | null;
  onClose: () => void;
}

/** Read-only daily timesheet view, or monthly review evaluation. */
export function ReviewDetailDialog({
  selectedTimesheet,
  selectedMonthlyReview,
  onClose,
}: ReviewDetailDialogProps) {
  const [reviewNote, setReviewNote] = useState("");
  const reviewMutation = useReviewMonthlyReview(
    selectedMonthlyReview?.id || "",
  );
  const noteMutation = useSaveTimesheetReviewNote(selectedTimesheet?.id || "");

  useEffect(() => {
    setReviewNote(
      selectedMonthlyReview?.review_note ??
        selectedTimesheet?.review_note ??
        "",
    );
  }, [selectedMonthlyReview, selectedTimesheet]);

  const isOpen = !!selectedTimesheet || !!selectedMonthlyReview;
  const canReview = selectedMonthlyReview?.status === "PENDING";
  const canSaveNote =
    !!selectedTimesheet &&
    reviewNote.trim().length > 0 &&
    reviewNote.trim() !== (selectedTimesheet.review_note ?? "");

  const handleReview = (action: "approve" | "reject") => {
    reviewMutation.mutate(
      { action, review_note: reviewNote.trim() || undefined },
      { onSettled: onClose },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={`bg-card/95 backdrop-blur-xl border-border/60 w-full max-w-[calc(100%-2rem)] ${
          selectedMonthlyReview ? "sm:max-w-2xl" : "sm:max-w-lg"
        }`}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-wider text-foreground">
            {selectedMonthlyReview
              ? canReview
                ? "Evaluate Monthly Review"
                : "Monthly Review"
              : "Daily Timesheet"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {selectedMonthlyReview
              ? `${formatReviewMonth(selectedMonthlyReview)} (${formatDateOnly(selectedMonthlyReview.period_start)} – ${formatDateOnly(selectedMonthlyReview.period_end)}). Evaluate monthly performance, self-rating, and completed tasks.`
              : "Timesheets count on submit. You can leave a review note."}
          </DialogDescription>
        </DialogHeader>

        {selectedTimesheet && (
          <DailyTimesheetDetails
            timesheet={selectedTimesheet}
            reviewNote={reviewNote}
            onReviewNoteChange={setReviewNote}
          />
        )}
        {selectedMonthlyReview && (
          <MonthlyReviewDetails
            review={selectedMonthlyReview}
            reviewNote={reviewNote}
            onReviewNoteChange={setReviewNote}
          />
        )}

        <DialogFooter className="gap-2 sm:justify-between border-t border-border/20 pt-4">
          {canReview ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="gap-2 text-[10px] tracking-widest h-10 shadow-lg"
              >
                Close
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => handleReview("reject")}
                  disabled={reviewMutation.isPending}
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-white hover:border-destructive hover:bg-none gap-2 text-[10px] tracking-widest h-10 shadow-lg font-bold"
                >
                  Reject
                </Button>
                <Button
                  type="button"
                  onClick={() => handleReview("approve")}
                  disabled={reviewMutation.isPending}
                  variant="outline"
                  className="border-success text-success hover:bg-success hover:text-white hover:border-success hover:bg-none gap-2 text-[10px] tracking-widest h-10 shadow-lg font-bold"
                >
                  Approve
                </Button>
              </div>
            </>
          ) : selectedTimesheet ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="gap-2 text-[10px] tracking-widest h-10 shadow-lg"
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={() =>
                  noteMutation.mutate(reviewNote.trim(), { onSuccess: onClose })
                }
                disabled={!canSaveNote || noteMutation.isPending}
                className="gap-2 text-[10px] tracking-widest h-10 shadow-lg font-bold"
              >
                Save Note
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full gap-2 text-[10px] tracking-widest h-10 shadow-lg font-bold"
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
