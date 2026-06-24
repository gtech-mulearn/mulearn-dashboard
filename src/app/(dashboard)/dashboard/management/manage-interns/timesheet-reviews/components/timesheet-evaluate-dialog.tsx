"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Star,
  XCircle,
} from "lucide-react";
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
  type TTimesheet,
  type TWeeklyReview,
  useReviewTimesheet,
  useReviewWeeklyReview,
} from "@/features/intern";
import {
  formatTasksAssigned,
  formatTasksCompleted,
} from "@/features/intern/utils/intern-helpers";

interface TimesheetEvaluateDialogProps {
  isOpen: boolean;
  typeFilter: "DAILY" | "WEEKLY";
  selectedTimesheet: TTimesheet | null;
  selectedWeeklyReview: TWeeklyReview | null;
  reviewNote: string;
  onOpenChange: (open: boolean) => void;
  onReviewNoteChange: (note: string) => void;
  onClose: () => void;
}

export function TimesheetEvaluateDialog({
  isOpen,
  typeFilter,
  selectedTimesheet,
  selectedWeeklyReview,
  reviewNote,
  onOpenChange,
  onReviewNoteChange,
  onClose,
}: TimesheetEvaluateDialogProps) {
  const isDaily = typeFilter === "DAILY";
  const activeItem = isDaily ? selectedTimesheet : selectedWeeklyReview;
  const activeStatus = activeItem?.status;

  const reviewTimesheetMutation = useReviewTimesheet(
    selectedTimesheet?.id || "",
  );
  const reviewWeeklyMutation = useReviewWeeklyReview(
    selectedWeeklyReview?.id || "",
  );

  const isPending = isDaily
    ? reviewTimesheetMutation.isPending
    : reviewWeeklyMutation.isPending;

  const handleReview = (action: "approve" | "reject") => {
    if (isDaily) {
      reviewTimesheetMutation.mutate(
        { action, review_note: reviewNote },
        { onSuccess: onClose },
      );
    } else {
      reviewWeeklyMutation.mutate(
        { action, review_note: reviewNote },
        { onSuccess: onClose },
      );
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={`bg-card/95 backdrop-blur-xl border-border/60 w-full max-w-[calc(100%-2rem)] ${
          typeFilter === "WEEKLY" ? "sm:max-w-2xl" : "sm:max-w-lg"
        }`}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-wider text-foreground">
            {isDaily ? "Evaluate Daily Timesheet" : "Evaluate Weekly Review"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isDaily
              ? "Review accomplishments and approve daily logs."
              : "Evaluate weekly performance, self-rating, and achievements."}
          </DialogDescription>
        </DialogHeader>

        {/* Daily Timesheet Details */}
        {isDaily &&
          selectedTimesheet &&
          (() => {
            const muid =
              ((selectedTimesheet as unknown as Record<string, unknown>)
                .muid as string) || "";
            return (
              <div className="space-y-4 py-2 my-2 text-sm max-h-[60vh] overflow-y-auto pr-1 w-full min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      Intern
                    </span>
                    <span className="font-bold text-foreground text-sm">
                      {String(
                        (
                          selectedTimesheet as unknown as Record<
                            string,
                            unknown
                          >
                        ).user_name ||
                          (
                            selectedTimesheet as unknown as Record<
                              string,
                              unknown
                            >
                          ).full_name ||
                          "Unknown",
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      MUID
                    </span>
                    <span className="font-bold text-foreground text-sm">
                      {muid || "-"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      Time Spent
                    </span>
                    <span className="font-bold text-foreground text-sm">
                      {selectedTimesheet.hours} Hour
                      {Number(selectedTimesheet.hours) !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      Log Date
                    </span>
                    <span className="font-bold text-foreground text-sm">
                      {new Date(
                        selectedTimesheet.entry_date,
                      ).toLocaleDateString(undefined, {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      Status
                    </span>
                    <div className="mt-1">
                      {selectedTimesheet.status === "APPROVED" && (
                        <Badge
                          variant="outline"
                          className="gap-1.5 text-success border-success/30 font-bold uppercase text-xs"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Approved
                        </Badge>
                      )}
                      {selectedTimesheet.status === "REJECTED" && (
                        <Badge
                          variant="outline"
                          className="gap-1.5 text-destructive border-destructive/30 font-bold uppercase text-xs"
                        >
                          <XCircle className="w-3 h-3" /> Rejected
                        </Badge>
                      )}
                      {selectedTimesheet.status === "PENDING" && (
                        <Badge
                          variant="outline"
                          className="gap-1.5 text-warning border-warning/30 font-bold uppercase text-xs"
                        >
                          <AlertTriangle className="w-3 h-3" /> Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                    Log Description
                  </span>
                  {selectedTimesheet.description ? (
                    <div className="bg-muted/40 p-2.5 rounded-lg border border-border/20 max-h-40 overflow-y-auto leading-relaxed mt-1">
                      <MarkdownRenderer
                        content={selectedTimesheet.description}
                        className="text-xs"
                      />
                    </div>
                  ) : (
                    <p className="text-xs italic text-muted-foreground mt-1">
                      No description provided.
                    </p>
                  )}
                </div>

                {selectedTimesheet.blockers &&
                  selectedTimesheet.blockers !== "None" && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Blockers
                      </span>
                      <p className="bg-destructive/5 text-destructive p-2.5 rounded-lg text-xs font-semibold mt-1 border border-destructive/20 leading-relaxed break-words">
                        {selectedTimesheet.blockers}
                      </p>
                    </div>
                  )}

                {selectedTimesheet.status === "PENDING" ? (
                  <div className="space-y-2 pt-2 border-t border-border/20 flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      Review Notes / Feedback
                    </span>
                    <Textarea
                      value={reviewNote}
                      onChange={(e) => onReviewNoteChange(e.target.value)}
                      placeholder="Feedback visible to the intern..."
                      className="min-h-[80px] text-xs font-semibold resize-none"
                    />
                  </div>
                ) : (
                  selectedTimesheet.review_note && (
                    <div className="pt-2 border-t border-border/20 flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Council Review Note
                      </span>
                      <p className="p-2.5 bg-muted/20 border rounded-lg text-xs mt-1 text-muted-foreground leading-relaxed break-words">
                        {selectedTimesheet.review_note}
                      </p>
                    </div>
                  )
                )}
              </div>
            );
          })()}

        {/* Weekly Review Details */}
        {!isDaily &&
          selectedWeeklyReview &&
          (() => {
            const muid =
              ((selectedWeeklyReview as unknown as Record<string, unknown>)
                .muid as string) || "";
            const remarks = selectedWeeklyReview.task_remarks;
            return (
              <div className="space-y-4 py-2 my-2 text-sm max-h-[60vh] overflow-y-auto pr-1 w-full min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      Intern
                    </span>
                    <span className="font-bold text-foreground text-sm">
                      {String(
                        (
                          selectedWeeklyReview as unknown as Record<
                            string,
                            unknown
                          >
                        ).user_name ||
                          (
                            selectedWeeklyReview as unknown as Record<
                              string,
                              unknown
                            >
                          ).full_name ||
                          "Unknown",
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      MUID
                    </span>
                    <span className="font-bold text-foreground text-sm">
                      {muid || "-"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      Week
                    </span>
                    <span className="font-bold text-foreground text-sm">
                      Week {selectedWeeklyReview.iso_week} (
                      {selectedWeeklyReview.iso_year})
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      Hours Committed
                    </span>
                    <span className="font-bold text-foreground text-sm">
                      {selectedWeeklyReview.hours_committed} hrs
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      Team / Guild
                    </span>
                    <div className="inline-flex items-center rounded-full border border-border/40 px-2 py-0.5 text-foreground font-bold text-xs uppercase tracking-wider mt-1 w-fit">
                      {selectedWeeklyReview.team || "-"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      Leave Details
                    </span>
                    <span className="font-bold text-foreground text-xs">
                      {selectedWeeklyReview.is_on_leave
                        ? `On Leave (${selectedWeeklyReview.leave_days} days)`
                        : "No Leave"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      Submission Time
                    </span>
                    <div className="font-bold text-foreground text-xs mt-1">
                      {selectedWeeklyReview.is_late ? (
                        <Badge
                          variant="outline"
                          className="text-destructive border-destructive/20 text-[9px] uppercase font-black tracking-wider px-1.5 py-0.5"
                        >
                          LATE
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-success border-success/20 text-[9px] uppercase font-black tracking-wider px-1.5 py-0.5"
                        >
                          ON TIME
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {remarks?.rating && (
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
                )}

                {selectedWeeklyReview.weekly_review && (
                  <div className="flex flex-col gap-1 border-t border-border/20 pt-3">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      Weekly Summary
                    </span>
                    <div className="bg-muted/40 p-2.5 rounded-lg border border-border/20 max-h-40 overflow-y-auto leading-relaxed mt-1">
                      <MarkdownRenderer
                        content={selectedWeeklyReview.weekly_review}
                        className="text-xs"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border/20 pt-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      Tasks Assigned
                    </span>
                    <div className="bg-muted/30 p-2 rounded-lg border border-border/10 max-h-32 overflow-y-auto leading-relaxed mt-1 text-xs">
                      <MarkdownRenderer
                        content={formatTasksAssigned(
                          selectedWeeklyReview.tasks_assigned,
                        )}
                        className="text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      Tasks Completed
                    </span>
                    <div className="bg-muted/30 p-2 rounded-lg border border-border/10 max-h-32 overflow-y-auto leading-relaxed mt-1 text-xs">
                      <MarkdownRenderer
                        content={formatTasksCompleted(
                          selectedWeeklyReview.tasks_completed,
                        )}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>

                {(remarks?.learnings ||
                  remarks?.challenges_faced ||
                  remarks?.next_week_plan) && (
                  <div className="space-y-3 border-t border-border/20 pt-3">
                    {remarks.learnings && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-brand-blue" />
                          Key Learnings
                        </span>
                        <p className="bg-muted/20 p-2.5 rounded-lg text-xs mt-1 border border-border/10 leading-relaxed text-foreground font-medium break-words">
                          {remarks.learnings}
                        </p>
                      </div>
                    )}
                    {remarks.challenges_faced && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                          Challenges Faced
                        </span>
                        <p className="bg-muted/20 p-2.5 rounded-lg text-xs mt-1 border border-border/10 leading-relaxed text-foreground font-medium break-words">
                          {remarks.challenges_faced}
                        </p>
                      </div>
                    )}
                    {remarks.next_week_plan && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                          Next Week Plan
                        </span>
                        <p className="bg-muted/20 p-2.5 rounded-lg text-xs mt-1 border border-border/10 leading-relaxed text-foreground font-medium break-words">
                          {remarks.next_week_plan}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {selectedWeeklyReview.blockers && (
                  <div className="flex flex-col gap-1 border-t border-border/20 pt-3">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      Blockers
                    </span>
                    <p className="bg-destructive/5 text-destructive p-2.5 rounded-lg text-xs font-semibold mt-1 border border-destructive/20 leading-relaxed break-words">
                      {selectedWeeklyReview.blockers}
                    </p>
                  </div>
                )}

                {selectedWeeklyReview.suggestions && (
                  <div className="flex flex-col gap-1 border-t border-border/20 pt-3">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      Suggestions
                    </span>
                    <p className="bg-muted/20 p-2.5 rounded-lg text-xs mt-1 border border-border/10 leading-relaxed text-muted-foreground font-medium break-words">
                      {selectedWeeklyReview.suggestions}
                    </p>
                  </div>
                )}

                {selectedWeeklyReview.status === "PENDING" ? (
                  <div className="space-y-2 pt-3 border-t border-border/20 flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      Review Notes / Feedback
                    </span>
                    <Textarea
                      value={reviewNote}
                      onChange={(e) => onReviewNoteChange(e.target.value)}
                      placeholder="Feedback visible to the intern..."
                      className="min-h-[80px] text-xs font-semibold resize-none"
                    />
                  </div>
                ) : (
                  selectedWeeklyReview.review_note && (
                    <div className="pt-3 border-t border-border/20 flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Council Review Note
                      </span>
                      <p className="p-2.5 bg-muted/20 border rounded-lg text-xs mt-1 text-muted-foreground leading-relaxed break-words">
                        {selectedWeeklyReview.review_note}
                      </p>
                    </div>
                  )
                )}
              </div>
            );
          })()}

        <DialogFooter className="gap-2 sm:justify-between border-t border-border/20 pt-4">
          {activeStatus === "PENDING" ? (
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
                  disabled={isPending}
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-white hover:border-destructive hover:bg-none gap-2 text-[10px] tracking-widest h-10 shadow-lg font-bold"
                >
                  Reject
                </Button>
                <Button
                  type="button"
                  onClick={() => handleReview("approve")}
                  disabled={isPending}
                  variant="outline"
                  className="border-success text-success hover:bg-success hover:text-white hover:border-success hover:bg-none gap-2 text-[10px] tracking-widest h-10 shadow-lg font-bold"
                >
                  Approve
                </Button>
              </div>
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
