"use client";

import { Clock, Edit2, HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useEditMonthlyReview,
  useEditTimesheet,
  useMonthlyReviewPrefill,
  useUpdateTaskStatus,
} from "../hooks/use-intern";
import {
  MONTHLY_REVIEW_FIELD_MAX,
  MONTHLY_REVIEW_TEXT_MAX,
} from "../schemas/intern-form-schema";
import type {
  TInternTask,
  TInternTaskStatus,
  TMonthlyReview,
  TMonthlyReviewPayload,
  TMonthlyReviewStatus,
  TTimesheet,
  TTimesheetUpdatePayload,
} from "../types";
import {
  formatDateOnly,
  formatReviewMonth,
  formatTaskStatus,
  isTimesheetEditable,
} from "../utils/intern-helpers";

export type UnifiedActivity = {
  id: string;
  type: "timesheet" | "monthly_review" | "completed_task";
  title: string;
  description: string;
  dateStr: string;
  rawDate: Date;
  status:
    | "SUBMITTED"
    | TMonthlyReviewStatus
    | "MISSING"
    | "CANCELLED"
    | "COMPLETED";
  karma: number | null;
  raw: TTimesheet | TMonthlyReview | TInternTask;
};

/** Maps a monthly review onto the shared activity row. */
export function monthlyReviewToActivity(
  review: TMonthlyReview,
  dateFormat: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
): UnifiedActivity {
  return {
    id: review.id,
    type: "monthly_review",
    title: `Monthly Review - ${formatReviewMonth(review)}`,
    description: review.monthly_review || "",
    dateStr: new Date(review.created_at).toLocaleDateString(
      undefined,
      dateFormat,
    ),
    rawDate: new Date(review.created_at),
    status: review.status,
    karma: null,
    raw: review,
  };
}

/** Maps a timesheet onto the shared activity row used by logs and dialogs. */
export function timesheetToActivity(
  ts: TTimesheet,
  dateFormat: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
): UnifiedActivity {
  return {
    id: ts.id,
    type: "timesheet",
    title: `Daily Timesheet · ${new Date(`${ts.entry_date}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`,
    description: ts.description || "",
    dateStr: new Date(ts.created_at).toLocaleDateString(undefined, dateFormat),
    rawDate: new Date(ts.created_at),
    status: "SUBMITTED",
    karma: null,
    raw: ts,
  };
}

export function getActivityStatusBadge(
  status: string,
  _karma: number | null,
  isVerified?: boolean,
) {
  switch (status) {
    case "SUBMITTED":
      return (
        <div className="bg-success/15 text-success border border-success/30 font-black text-[9px] rounded-full px-2.5 py-0.5 uppercase tracking-wider flex items-center gap-1 shrink-0">
          Submitted
        </div>
      );
    case "MISSING":
      return (
        <div className="bg-destructive/15 text-destructive border border-destructive/30 font-black text-[9px] rounded-full px-2.5 py-0.5 uppercase tracking-wider flex items-center gap-1 shrink-0">
          Missing
        </div>
      );
    case "APPROVED":
      return (
        <div className="bg-success/15 text-success border border-success/30 font-black text-[9px] rounded-full px-2.5 py-0.5 uppercase tracking-wider flex items-center gap-1 shrink-0">
          Approved
        </div>
      );
    case "COMPLETED":
      if (isVerified) {
        return (
          <div className="bg-success/15 text-success border border-success/30 font-black text-[9px] rounded-full px-2.5 py-0.5 uppercase tracking-wider flex items-center gap-1 shrink-0">
            Completed
          </div>
        );
      }
      return (
        <div className="bg-warning/15 text-warning border border-warning/30 font-black text-[9px] rounded-full px-2.5 py-0.5 uppercase tracking-wider shrink-0">
          Pending
        </div>
      );
    case "PENDING":
      return (
        <div className="bg-warning/15 text-warning border border-warning/30 font-black text-[9px] rounded-full px-2.5 py-0.5 uppercase tracking-wider shrink-0">
          Pending
        </div>
      );
    case "REJECTED":
      return (
        <div className="bg-destructive/15 text-destructive border border-destructive/30 font-black text-[9px] rounded-full px-2.5 py-0.5 uppercase tracking-wider shrink-0">
          Rejected
        </div>
      );
    default:
      return (
        <div className="bg-muted text-muted-foreground border border-border font-black text-[9px] rounded-full px-2.5 py-0.5 uppercase tracking-wider shrink-0">
          {status}
        </div>
      );
  }
}

interface ActivityDetailDialogProps {
  selectedItem: UnifiedActivity | null;
  onClose: () => void;
}

export function ActivityDetailDialog({
  selectedItem,
  onClose,
}: ActivityDetailDialogProps) {
  const updateTaskStatusMutation = useUpdateTaskStatus();

  const [isEditMode, setIsEditMode] = useState(false);

  // Form states for Timesheet
  const [tsHours, setTsHours] = useState("");
  const [tsDescription, setTsDescription] = useState("");
  const [tsBlockers, setTsBlockers] = useState("");
  const [tsEndOfDayNote, setTsEndOfDayNote] = useState("");
  const [tsEditReason, setTsEditReason] = useState("");

  // Form states for Monthly Review
  const [mrReview, setMrReview] = useState("");
  const [mrRating, setMrRating] = useState("");
  const [mrLearnings, setMrLearnings] = useState("");
  const [mrChallenges, setMrChallenges] = useState("");
  const [mrNextPlan, setMrNextPlan] = useState("");
  const [mrBlockers, setMrBlockers] = useState("");
  const [mrSuggestions, setMrSuggestions] = useState("");

  useEffect(() => {
    if (selectedItem) {
      setIsEditMode(false);
      if (selectedItem.type === "timesheet") {
        const ts = selectedItem.raw as TTimesheet;
        setTsHours(ts.hours || "0");
        setTsDescription(ts.description || "");
        setTsBlockers(ts.blockers || "");
        setTsEndOfDayNote(ts.end_of_day_note || "");
        setTsEditReason("");
      } else if (selectedItem.type === "monthly_review") {
        const mr = selectedItem.raw as TMonthlyReview;
        setMrReview(mr.monthly_review || "");
        setMrRating(
          mr.task_remarks?.rating ? String(mr.task_remarks.rating) : "",
        );
        setMrLearnings(mr.task_remarks?.learnings || "");
        setMrChallenges(mr.task_remarks?.challenges_faced || "");
        setMrNextPlan(mr.task_remarks?.next_month_plan || "");
        setMrBlockers(mr.blockers || "");
        setMrSuggestions(mr.suggestions || "");
      }
    }
  }, [selectedItem]);

  const editTimesheetMutation = useEditTimesheet();
  const editMonthlyReviewMutation = useEditMonthlyReview();

  const selectedMonthlyReview =
    selectedItem?.type === "monthly_review"
      ? (selectedItem.raw as TMonthlyReview)
      : null;
  const { data: monthlyPrefill } = useMonthlyReviewPrefill({
    enabled: !!selectedMonthlyReview,
  });
  // Editable only while PENDING and its own window is still open.
  const canEditMonthlyReview =
    !!selectedMonthlyReview &&
    selectedMonthlyReview.status === "PENDING" &&
    !!monthlyPrefill?.window_open &&
    monthlyPrefill.year === selectedMonthlyReview.year &&
    monthlyPrefill.month === selectedMonthlyReview.month;
  const isMonthlyLocked = !canEditMonthlyReview || !isEditMode;
  const monthlyEditError = !selectedMonthlyReview
    ? null
    : ![mrReview, mrLearnings, mrChallenges, mrNextPlan].some((v) => v.trim())
      ? "Write your monthly review, or fill in learnings, challenges faced or next month's plan."
      : null;

  const handleTaskStatusChange = (
    taskId: string,
    status: TInternTaskStatus,
  ) => {
    updateTaskStatusMutation.mutate(
      { id: taskId, status },
      { onSuccess: () => onClose() },
    );
  };

  const handleSaveChanges = () => {
    if (!selectedItem) return;

    if (selectedItem.type === "timesheet") {
      const payload: TTimesheetUpdatePayload = {
        hours: Number(tsHours),
        description: tsDescription.trim(),
        blockers: tsBlockers.trim() || null,
        end_of_day_note: tsEndOfDayNote.trim() || null,
        edit_reason: tsEditReason.trim(),
      };
      editTimesheetMutation.mutate(
        { id: selectedItem.id, payload },
        { onSuccess: () => onClose() },
      );
    } else if (selectedItem.type === "monthly_review") {
      const payload: TMonthlyReviewPayload = {
        monthly_review: mrReview.trim() || null,
        rating: mrRating ? Number(mrRating) : null,
        learnings: mrLearnings.trim() || null,
        challenges_faced: mrChallenges.trim() || null,
        next_month_plan: mrNextPlan.trim() || null,
        blockers: mrBlockers.trim() || null,
        suggestions: mrSuggestions.trim() || null,
      };
      editMonthlyReviewMutation.mutate(
        { id: selectedItem.id, payload },
        { onSuccess: () => onClose() },
      );
    }
  };

  const isMonthlyType = selectedItem?.type === "monthly_review";

  const selectedTimesheet =
    selectedItem?.type === "timesheet"
      ? (selectedItem.raw as TTimesheet)
      : null;
  const canEditTimesheet = selectedTimesheet
    ? isTimesheetEditable(selectedTimesheet)
    : false;
  const canEdit =
    selectedItem?.type === "timesheet"
      ? canEditTimesheet
      : canEditMonthlyReview;
  const isTimesheetLocked = !canEditTimesheet || !isEditMode;

  const tsHoursNum = Number(tsHours);
  const timesheetEditError =
    selectedItem?.type !== "timesheet"
      ? null
      : !tsEditReason.trim()
        ? "Edit reason is required."
        : tsEditReason.trim().length > 300
          ? "Edit reason must be 300 characters or fewer."
          : !(tsHoursNum > 0 && tsHoursNum <= 24)
            ? "Hours must be greater than 0 and at most 24."
            : tsDescription.trim().length < 30
              ? "Description must be at least 30 characters."
              : null;
  const saveError = isMonthlyType ? monthlyEditError : timesheetEditError;
  const isSaving =
    editTimesheetMutation.isPending || editMonthlyReviewMutation.isPending;

  return (
    <Dialog open={!!selectedItem} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-xl border-border/40 bg-card/95 backdrop-blur-2xl shadow-2xl">
        {selectedItem && (
          <>
            <DialogHeader className="pr-8 pb-4 border-b border-border/20">
              <DialogTitle className="text-xl font-black uppercase tracking-tight text-foreground break-all flex items-center gap-2">
                {selectedItem.type === "timesheet"
                  ? "Daily Timesheet"
                  : selectedMonthlyReview
                    ? `Monthly Review · ${formatReviewMonth(selectedMonthlyReview)}`
                    : "Completed Task"}
              </DialogTitle>
              <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {selectedItem.type === "completed_task"
                  ? "Completed on"
                  : "Submitted on"}{" "}
                {selectedItem.dateStr}
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[50vh] overflow-y-auto pr-1 space-y-4 py-4">
              {/* Status and Points/Karma Banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-xl border border-border/40 bg-background/40">
                <div className="space-y-0.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    Status
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {getActivityStatusBadge(
                      selectedItem.status,
                      selectedItem.karma,
                      selectedItem.type === "completed_task"
                        ? (selectedItem.raw as TInternTask).is_verified
                        : undefined,
                    )}
                  </div>
                </div>

                {selectedItem.type === "completed_task" && (
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                      Karma Earned
                    </p>
                    <p className="text-sm font-black text-foreground mt-0.5 tabular-nums">
                      +{selectedItem.karma ?? 0} Karma
                    </p>
                  </div>
                )}
              </div>

              {/* Reviewer Note / Remarks */}
              {selectedItem.type !== "completed_task" &&
                (selectedItem.raw as TTimesheet | TMonthlyReview)
                  .review_note && (
                  <div className="p-3.5 rounded-xl border border-destructive/20 bg-destructive/5 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-destructive flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Review Remarks
                    </p>
                    <p className="text-xs font-medium text-foreground leading-relaxed break-all">
                      {
                        (selectedItem.raw as TTimesheet | TMonthlyReview)
                          .review_note
                      }
                    </p>
                    {selectedMonthlyReview?.reviewed_at && (
                      <p className="text-[10px] text-muted-foreground">
                        Reviewed{" "}
                        {new Date(
                          selectedMonthlyReview.reviewed_at,
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

              {/* Completed Task Fields */}
              {selectedItem.type === "completed_task" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Category
                    </Label>
                    <Input
                      value={(selectedItem.raw as TInternTask).category || ""}
                      disabled={true}
                      className="bg-background/50 border-border/50 font-medium cursor-not-allowed uppercase"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Complexity
                    </Label>
                    <Input
                      value={(selectedItem.raw as TInternTask).complexity || ""}
                      disabled={true}
                      className="bg-background/50 border-border/50 font-medium cursor-not-allowed uppercase"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Task Description
                    </Label>
                    <Textarea
                      value={
                        (selectedItem.raw as TInternTask).description || ""
                      }
                      disabled={true}
                      rows={4}
                      className="bg-background/50 border-border/50 font-medium resize-none cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5 p-3 rounded-xl border border-brand-blue/30 bg-brand-blue/5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-brand-blue">
                      Task Status
                    </Label>
                    <Select
                      value={(selectedItem.raw as TInternTask).status}
                      onValueChange={(val) => {
                        handleTaskStatusChange(
                          selectedItem.id,
                          val as TInternTaskStatus,
                        );
                      }}
                    >
                      <SelectTrigger className="w-full bg-background/50 border-border/50 font-bold uppercase text-[10px] tracking-wider mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        className="bg-card font-bold border-border/60"
                      >
                        <SelectItem
                          value="WAITING_FOR_REVIEW"
                          className="uppercase text-[9px]"
                        >
                          Waiting for Review
                        </SelectItem>
                        <SelectItem
                          value="IN_PROGRESS"
                          className="uppercase text-[9px]"
                        >
                          In Progress
                        </SelectItem>
                        <SelectItem
                          value="COMPLETED"
                          className="uppercase text-[9px]"
                        >
                          Completed
                        </SelectItem>
                        <SelectItem
                          value="ON_HOLD"
                          className="uppercase text-[9px]"
                        >
                          On Hold
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Timesheet Form Fields */}
              {selectedTimesheet && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Entry Date
                      </Label>
                      <Input
                        value={selectedTimesheet.entry_date}
                        disabled
                        className="bg-background/50 border-border/50 font-medium cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Hours Worked
                      </Label>
                      <Input
                        type="number"
                        step="0.25"
                        min="0.25"
                        max="24"
                        value={tsHours}
                        onChange={(e) => setTsHours(e.target.value)}
                        disabled={isTimesheetLocked}
                        className={`bg-background/50 border-border/50 font-medium ${isTimesheetLocked ? "cursor-not-allowed" : ""}`}
                      />
                    </div>
                  </div>

                  {selectedTimesheet.task &&
                    selectedTimesheet.task.length > 0 && (
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Task Updates
                        </Label>
                        <ul className="space-y-1.5">
                          {selectedTimesheet.task.map((t) => (
                            <li
                              key={t.task_id}
                              className="rounded-lg border border-border/40 bg-background/40 px-3 py-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-foreground">
                                  {t.title}
                                </span>
                                <span className="text-[9px] font-black uppercase tracking-wider text-brand-blue">
                                  {formatTaskStatus(t.status)}
                                </span>
                              </div>
                              {t.remark && (
                                <p className="text-[11px] text-muted-foreground mt-1">
                                  {t.remark}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Work Description
                    </Label>
                    <Textarea
                      value={tsDescription}
                      onChange={(e) => setTsDescription(e.target.value)}
                      disabled={isTimesheetLocked}
                      maxLength={2000}
                      rows={4}
                      className={`bg-background/50 border-border/50 font-medium resize-none ${isTimesheetLocked ? "cursor-not-allowed" : ""}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Blockers
                    </Label>
                    <Textarea
                      value={tsBlockers}
                      onChange={(e) => setTsBlockers(e.target.value)}
                      disabled={isTimesheetLocked}
                      maxLength={1000}
                      rows={2}
                      className={`bg-background/50 border-border/50 font-medium resize-none ${isTimesheetLocked ? "cursor-not-allowed" : ""}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      End of Day Note
                    </Label>
                    <Textarea
                      value={tsEndOfDayNote}
                      onChange={(e) => setTsEndOfDayNote(e.target.value)}
                      disabled={isTimesheetLocked}
                      maxLength={1000}
                      rows={3}
                      className={`bg-background/50 border-border/50 font-medium resize-none ${isTimesheetLocked ? "cursor-not-allowed" : ""}`}
                    />
                  </div>

                  {selectedTimesheet.edit_reason && !isEditMode && (
                    <p className="text-[11px] text-muted-foreground">
                      <span className="font-black uppercase tracking-wider text-[9px]">
                        Last edit reason:
                      </span>{" "}
                      {selectedTimesheet.edit_reason}
                    </p>
                  )}

                  {selectedTimesheet.team && (
                    <p className="text-[11px] text-muted-foreground">
                      <span className="font-black uppercase tracking-wider text-[9px]">
                        Team:
                      </span>{" "}
                      {selectedTimesheet.team.name}
                      {selectedTimesheet.is_current_team === false &&
                        " (previous team)"}
                    </p>
                  )}

                  {selectedTimesheet.review_note && (
                    <div className="p-3 rounded-xl border border-brand-blue/30 bg-brand-blue/5 text-xs space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-brand-blue">
                        Review note
                        {selectedTimesheet.reviewed_by &&
                          ` · ${selectedTimesheet.reviewed_by.full_name}`}
                      </p>
                      <p className="text-foreground/90">
                        {selectedTimesheet.review_note}
                      </p>
                    </div>
                  )}

                  {!canEditTimesheet && (
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                      The edit window for this timesheet has closed.
                    </p>
                  )}

                  {isEditMode && (
                    <div className="space-y-1.5 p-3 rounded-xl border border-warning/30 bg-warning/5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-warning">
                        Edit Reason (Mandatory)
                      </Label>
                      <Input
                        placeholder="e.g. Corrected description and hours"
                        value={tsEditReason}
                        maxLength={300}
                        onChange={(e) => setTsEditReason(e.target.value)}
                        className="bg-background/50 border-border/50 font-medium mt-1"
                      />
                      {timesheetEditError && (
                        <p className="text-[10px] font-bold text-destructive">
                          {timesheetEditError}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Monthly Review Fields */}
              {selectedMonthlyReview && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Period
                      </Label>
                      <Input
                        value={`${formatDateOnly(selectedMonthlyReview.period_start)} – ${formatDateOnly(selectedMonthlyReview.period_end)}`}
                        disabled
                        className="bg-background/50 border-border/50 font-medium cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Leave Days
                      </Label>
                      <Input
                        value={String(selectedMonthlyReview.leave_days)}
                        disabled
                        className="bg-background/50 border-border/50 font-medium cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Tasks Completed
                    </Label>
                    {selectedMonthlyReview.tasks_completed.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">
                        No completed tasks this month.
                      </p>
                    ) : (
                      <ul className="space-y-1.5">
                        {selectedMonthlyReview.tasks_completed.map((t) => (
                          <li
                            key={t.task_id}
                            className="rounded-lg border border-border/40 bg-background/40 px-3 py-2 flex items-center justify-between gap-2"
                          >
                            <span className="text-xs font-bold text-foreground">
                              {t.output_link ? (
                                <a
                                  href={t.output_link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="hover:underline"
                                >
                                  {t.title}
                                </a>
                              ) : (
                                t.title
                              )}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-wider text-brand-blue">
                              {formatTaskStatus(t.final_status)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Monthly Rating
                    </Label>
                    <Select
                      value={mrRating}
                      onValueChange={setMrRating}
                      disabled={isMonthlyLocked}
                    >
                      <SelectTrigger className="w-full bg-background/50 border-border/50 font-medium">
                        <SelectValue placeholder="Not rated" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n} / 5
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(
                    [
                      ["Learnings", mrLearnings, setMrLearnings],
                      ["Challenges Faced", mrChallenges, setMrChallenges],
                      ["Next Month's Plan", mrNextPlan, setMrNextPlan],
                    ] as const
                  ).map(([label, value, setValue]) => (
                    <div key={label} className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        {label}
                      </Label>
                      <Textarea
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        disabled={isMonthlyLocked}
                        maxLength={MONTHLY_REVIEW_FIELD_MAX}
                        rows={2}
                        className="bg-background/50 border-border/50 font-medium resize-none"
                      />
                    </div>
                  ))}

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Monthly Review
                    </Label>
                    <Textarea
                      value={mrReview}
                      onChange={(e) => setMrReview(e.target.value)}
                      disabled={isMonthlyLocked}
                      maxLength={MONTHLY_REVIEW_TEXT_MAX}
                      rows={4}
                      className="bg-background/50 border-border/50 font-medium resize-none"
                    />
                  </div>

                  {(
                    [
                      ["Blockers", mrBlockers, setMrBlockers],
                      ["Suggestions", mrSuggestions, setMrSuggestions],
                    ] as const
                  ).map(([label, value, setValue]) => (
                    <div key={label} className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        {label}
                      </Label>
                      <Textarea
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        disabled={isMonthlyLocked}
                        maxLength={MONTHLY_REVIEW_FIELD_MAX}
                        rows={2}
                        className="bg-background/50 border-border/50 font-medium resize-none"
                      />
                    </div>
                  ))}

                  {!canEditMonthlyReview &&
                    selectedMonthlyReview.status === "PENDING" && (
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                        The submission window for this review has closed.
                      </p>
                    )}

                  {isEditMode && monthlyEditError && (
                    <p className="text-[10px] font-bold text-destructive">
                      {monthlyEditError}
                    </p>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="border-t border-border/20 pt-4 flex items-center justify-end gap-2">
              {canEdit &&
                (!isEditMode ? (
                  <Button
                    type="button"
                    onClick={() => setIsEditMode(true)}
                    className="font-black text-[10px] uppercase tracking-widest h-9"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1" />
                    Edit Submission
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditMode(false)}
                      className="font-black text-[10px] uppercase tracking-widest h-9"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSaveChanges}
                      disabled={!!saveError || isSaving}
                      className="font-black text-[10px] uppercase tracking-widest h-9 bg-brand-blue hover:bg-brand-blue/80 text-white"
                    >
                      Save Changes
                    </Button>
                  </>
                ))}
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="font-black text-[10px] uppercase tracking-widest h-9"
              >
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
