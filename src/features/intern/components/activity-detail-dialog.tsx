"use client";

import { Clock, Edit2, HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
  useEditTimesheet,
  useEditWeeklyReview,
  useUpdateTaskStatus,
} from "../hooks/use-intern";
import type {
  TInternTask,
  TTimesheet,
  TTimesheetUpdatePayload,
  TWeeklyReview,
  TWeeklyReviewUpdatePayload,
} from "../types";

export type UnifiedActivity = {
  id: string;
  type: "timesheet" | "weekly_review" | "weekly_timesheet" | "completed_task";
  title: string;
  description: string;
  dateStr: string;
  rawDate: Date;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "COMPLETED";
  points: number | null;
  karma: number | null;
  raw: TTimesheet | TWeeklyReview | TInternTask;
};

export function getActivityStatusBadge(
  status: string,
  _karma: number | null,
  isVerified?: boolean,
) {
  switch (status) {
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

  // Form states for Weekly Review
  const [wrHours, setWrHours] = useState<number>(0);
  const [wrTasksAssigned, setWrTasksAssigned] = useState("");
  const [wrTasksCompleted, setWrTasksCompleted] = useState("");
  const [wrWeeklyReview, setWrWeeklyReview] = useState("");
  const [wrBlockers, setWrBlockers] = useState("");
  const [wrSuggestions, setWrSuggestions] = useState("");
  const [wrLearnings, setWrLearnings] = useState("");
  const [wrChallenges, setWrChallenges] = useState("");
  const [wrNextPlan, setWrNextPlan] = useState("");

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
      } else if (
        selectedItem.type === "weekly_review" ||
        selectedItem.type === "weekly_timesheet"
      ) {
        const wr = selectedItem.raw as TWeeklyReview;
        setWrHours(wr.hours_committed || 0);

        let assignedStr = "";
        if (wr.tasks_assigned && typeof wr.tasks_assigned === "object") {
          assignedStr = Object.values(wr.tasks_assigned)
            .map((title) => `- ${title}`)
            .join("\n");
        } else if (typeof wr.tasks_assigned === "string") {
          assignedStr = wr.tasks_assigned;
        }
        setWrTasksAssigned(assignedStr);

        let completedStr = "";
        if (Array.isArray(wr.tasks_completed)) {
          completedStr = wr.tasks_completed
            .map((t) => `- ${t.title} (${t.final_status || "COMPLETED"})`)
            .join("\n");
        } else if (typeof wr.tasks_completed === "string") {
          completedStr = wr.tasks_completed;
        }
        setWrTasksCompleted(completedStr);

        setWrWeeklyReview(wr.weekly_review || "");
        setWrBlockers(wr.blockers || "");
        setWrSuggestions(wr.suggestions || "");
        setWrLearnings(wr.task_remarks?.learnings || "");
        setWrChallenges(wr.task_remarks?.challenges_faced || "");
        setWrNextPlan(wr.task_remarks?.next_week_plan || "");
      }
    }
  }, [selectedItem]);

  const editTimesheetMutation = useEditTimesheet();
  const editWeeklyReviewMutation = useEditWeeklyReview();

  const handleTaskStatusChange = (
    taskId: string,
    status: "WAITING_FOR_REVIEW" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD",
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
        description: tsDescription,
        blockers: tsBlockers || "None",
        end_of_day_note: tsEndOfDayNote,
        edit_reason: tsEditReason || "Self correction of details",
      };
      editTimesheetMutation.mutate(
        { id: selectedItem.id, payload },
        { onSuccess: () => onClose() },
      );
    } else {
      const payload: TWeeklyReviewUpdatePayload = {
        hours_committed: Number(wrHours),
        weekly_review: wrWeeklyReview,
        blockers: wrBlockers || "None",
        suggestions: wrSuggestions || "None",
        learnings: wrLearnings,
        challenges_faced: wrChallenges,
        next_week_plan: wrNextPlan,
      };
      editWeeklyReviewMutation.mutate(
        { id: selectedItem.id, payload },
        { onSuccess: () => onClose() },
      );
    }
  };

  const isWeeklyType =
    selectedItem?.type === "weekly_review" ||
    selectedItem?.type === "weekly_timesheet";

  return (
    <Dialog open={!!selectedItem} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-xl border-border/40 bg-card/95 backdrop-blur-2xl shadow-2xl">
        {selectedItem && (
          <>
            <DialogHeader className="pr-8 pb-4 border-b border-border/20">
              <DialogTitle className="text-xl font-black uppercase tracking-tight text-foreground break-all flex items-center gap-2">
                {selectedItem.type === "timesheet"
                  ? "Daily Timesheet"
                  : isWeeklyType
                    ? "Weekly Review"
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

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                      {selectedItem.status === "APPROVED" ||
                      selectedItem.type === "completed_task" ||
                      (selectedItem.status === "COMPLETED" &&
                        (selectedItem.raw as TInternTask).is_verified)
                        ? "Points Earned"
                        : "Estimated Points"}
                    </p>
                    <p className="text-sm font-black text-foreground mt-0.5 tabular-nums">
                      {selectedItem.status === "APPROVED" ||
                      selectedItem.type === "completed_task" ||
                      (selectedItem.status === "COMPLETED" &&
                        (selectedItem.raw as TInternTask).is_verified)
                        ? `+${selectedItem.points ?? 0}`
                        : selectedItem.type === "timesheet"
                          ? 25
                          : 50}{" "}
                      Pts
                    </p>
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
              </div>

              {/* Reviewer Note / Remarks */}
              {selectedItem.type !== "completed_task" &&
                ((selectedItem.raw as TTimesheet).review_note ||
                  (selectedItem.raw as TTimesheet).remark ||
                  (selectedItem.raw as TWeeklyReview).review_note) && (
                  <div className="p-3.5 rounded-xl border border-destructive/20 bg-destructive/5 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-destructive flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Review Remarks
                    </p>
                    <p className="text-xs font-medium text-foreground leading-relaxed break-all">
                      {(selectedItem.raw as TTimesheet).review_note ||
                        (selectedItem.raw as TTimesheet).remark ||
                        (selectedItem.raw as TWeeklyReview).review_note}
                    </p>
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
                          val as
                            | "WAITING_FOR_REVIEW"
                            | "IN_PROGRESS"
                            | "COMPLETED"
                            | "ON_HOLD",
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
              {selectedItem.type === "timesheet" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Hours Worked
                    </Label>
                    <Input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="24"
                      value={tsHours}
                      onChange={(e) => setTsHours(e.target.value)}
                      disabled={
                        selectedItem.status !== "PENDING" || !isEditMode
                      }
                      className={`bg-background/50 border-border/50 font-medium ${selectedItem.status !== "PENDING" || !isEditMode ? "cursor-not-allowed" : ""}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Work Description
                    </Label>
                    <Textarea
                      value={tsDescription}
                      onChange={(e) => setTsDescription(e.target.value)}
                      disabled={
                        selectedItem.status !== "PENDING" || !isEditMode
                      }
                      rows={4}
                      className={`bg-background/50 border-border/50 font-medium resize-none ${selectedItem.status !== "PENDING" || !isEditMode ? "cursor-not-allowed" : ""}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Blockers
                    </Label>
                    <Textarea
                      value={tsBlockers}
                      onChange={(e) => setTsBlockers(e.target.value)}
                      disabled={
                        selectedItem.status !== "PENDING" || !isEditMode
                      }
                      rows={2}
                      className={`bg-background/50 border-border/50 font-medium resize-none ${selectedItem.status !== "PENDING" || !isEditMode ? "cursor-not-allowed" : ""}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      End of Day Note
                    </Label>
                    <Textarea
                      value={tsEndOfDayNote}
                      onChange={(e) => setTsEndOfDayNote(e.target.value)}
                      disabled={
                        selectedItem.status !== "PENDING" || !isEditMode
                      }
                      rows={3}
                      className="bg-background/50 border-border/50 font-medium resize-none"
                    />
                  </div>

                  {isEditMode && (
                    <div className="space-y-1.5 p-3 rounded-xl border border-warning/30 bg-warning/5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-warning">
                        Edit Reason (Mandatory)
                      </Label>
                      <Input
                        placeholder="e.g. Corrected description and hours"
                        value={tsEditReason}
                        onChange={(e) => setTsEditReason(e.target.value)}
                        className="bg-background/50 border-border/50 font-medium mt-1"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Weekly Review Form Fields */}
              {isWeeklyType && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Hours Committed
                    </Label>
                    <Input
                      type="number"
                      value={wrHours}
                      onChange={(e) => setWrHours(Number(e.target.value))}
                      disabled={
                        selectedItem.status !== "PENDING" || !isEditMode
                      }
                      className="bg-background/50 border-border/50 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Tasks Assigned
                    </Label>
                    <Textarea
                      value={wrTasksAssigned}
                      onChange={(e) => setWrTasksAssigned(e.target.value)}
                      disabled={
                        selectedItem.status !== "PENDING" || !isEditMode
                      }
                      rows={2}
                      className="bg-background/50 border-border/50 font-medium resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Tasks Completed
                    </Label>
                    <Textarea
                      value={wrTasksCompleted}
                      onChange={(e) => setWrTasksCompleted(e.target.value)}
                      disabled={
                        selectedItem.status !== "PENDING" || !isEditMode
                      }
                      rows={2}
                      className="bg-background/50 border-border/50 font-medium resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Weekly Review Summary
                    </Label>
                    <Textarea
                      value={wrWeeklyReview}
                      onChange={(e) => setWrWeeklyReview(e.target.value)}
                      disabled={
                        selectedItem.status !== "PENDING" || !isEditMode
                      }
                      rows={3}
                      className="bg-background/50 border-border/50 font-medium resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Learnings
                    </Label>
                    <Textarea
                      value={wrLearnings}
                      onChange={(e) => setWrLearnings(e.target.value)}
                      disabled={
                        selectedItem.status !== "PENDING" || !isEditMode
                      }
                      rows={2}
                      className="bg-background/50 border-border/50 font-medium resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Challenges Faced
                    </Label>
                    <Textarea
                      value={wrChallenges}
                      onChange={(e) => setWrChallenges(e.target.value)}
                      disabled={
                        selectedItem.status !== "PENDING" || !isEditMode
                      }
                      rows={2}
                      className="bg-background/50 border-border/50 font-medium resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Next Week&apos;s Plan
                    </Label>
                    <Textarea
                      value={wrNextPlan}
                      onChange={(e) => setWrNextPlan(e.target.value)}
                      disabled={
                        selectedItem.status !== "PENDING" || !isEditMode
                      }
                      rows={2}
                      className="bg-background/50 border-border/50 font-medium resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Blockers
                    </Label>
                    <Textarea
                      value={wrBlockers}
                      onChange={(e) => setWrBlockers(e.target.value)}
                      disabled={
                        selectedItem.status !== "PENDING" || !isEditMode
                      }
                      rows={2}
                      className="bg-background/50 border-border/50 font-medium resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Suggestions
                    </Label>
                    <Textarea
                      value={wrSuggestions}
                      onChange={(e) => setWrSuggestions(e.target.value)}
                      disabled={
                        selectedItem.status !== "PENDING" || !isEditMode
                      }
                      rows={2}
                      className="bg-background/50 border-border/50 font-medium resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="border-t border-border/20 pt-4 flex items-center justify-end gap-2">
              {selectedItem.status === "PENDING" &&
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
                      disabled={
                        selectedItem.type === "timesheet" && !tsEditReason
                      }
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
