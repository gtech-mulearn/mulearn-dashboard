"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Activity, Clock, Edit2, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { internApi } from "@/features/intern/api/intern.api";
import {
  useTimesheetHistory,
  useWeeklyReviewHistory,
} from "@/features/intern/hooks/use-intern";
import type {
  TTimesheet,
  TTimesheetUpdatePayload,
  TWeeklyReview,
  TWeeklyReviewUpdatePayload,
} from "@/features/intern/types";

type UnifiedActivity = {
  id: string;
  type: "timesheet" | "weekly_review";
  title: string;
  description: string;
  dateStr: string;
  rawDate: Date;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  karma: number | null;
  raw: TTimesheet | TWeeklyReview;
};

export function QuestLog() {
  const queryClient = useQueryClient();
  const { data: timesheetHistory, isLoading: isTimesheetLoading } =
    useTimesheetHistory({ page: 1, perPage: 20 });
  const { data: weeklyReviews, isLoading: isWeeklyLoading } =
    useWeeklyReviewHistory({ page: 1, perPage: 20 });

  const [selectedItem, setSelectedItem] = useState<UnifiedActivity | null>(
    null,
  );
  const [isEditMode, setIsEditMode] = useState(false);

  // Form states for Timesheet
  const [tsCategory, setTsCategory] = useState("");
  const [tsHours, setTsHours] = useState("");
  const [tsDescription, setTsDescription] = useState("");
  const [tsBlockers, setTsBlockers] = useState("");
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
        setTsCategory(ts.category || "DEVELOPMENT");
        setTsHours(ts.hours || "0");
        setTsDescription(ts.description || "");
        setTsBlockers(ts.blockers || "");
        setTsEditReason("");
      } else {
        const wr = selectedItem.raw as TWeeklyReview;
        setWrHours(wr.hours_committed || 0);
        setWrTasksAssigned(wr.tasks_assigned || "");
        setWrTasksCompleted(wr.tasks_completed || "");
        setWrWeeklyReview(wr.weekly_review || "");
        setWrBlockers(wr.blockers || "");
        setWrSuggestions(wr.suggestions || "");
        setWrLearnings(wr.task_remarks?.learnings || "");
        setWrChallenges(wr.task_remarks?.challenges_faced || "");
        setWrNextPlan(wr.task_remarks?.next_week_plan || "");
      }
    }
  }, [selectedItem]);

  const editTimesheetMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: TTimesheetUpdatePayload;
    }) => internApi.updateTimesheet(id, payload),
    onSuccess: async () => {
      toast.success("Timesheet updated successfully!");
      await queryClient.invalidateQueries({
        queryKey: ["intern", "timesheets"],
      });
      setSelectedItem(null);
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error ? error.message : "Failed to update timesheet";
      toast.error(msg);
    },
  });

  const editWeeklyReviewMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: TWeeklyReviewUpdatePayload;
    }) => internApi.updateWeeklyReview(id, payload),
    onSuccess: async () => {
      toast.success("Weekly review updated successfully!");
      await queryClient.invalidateQueries({ queryKey: ["intern", "reviews"] });
      setSelectedItem(null);
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to update weekly review";
      toast.error(msg);
    },
  });

  const isLoading = isTimesheetLoading || isWeeklyLoading;

  if (isLoading) {
    return (
      <Card className="h-full border-border/40 bg-card/40 backdrop-blur-md flex flex-col py-4 px-5">
        <CardHeader className="pt-0 px-0 pb-2 border-b border-border/20">
          <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-5 h-5 text-muted-foreground" />
            Quest Log
          </CardTitle>
          <CardDescription className="text-xs font-bold uppercase text-muted-foreground/60">
            Recent Points Gains
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-3 px-0 pb-0 flex-1 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="space-y-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-12 rounded-lg" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const timesheets = timesheetHistory?.data || [];
  const reviews = weeklyReviews?.data || [];

  const recentActivities: UnifiedActivity[] = [
    ...timesheets.map(
      (ts): UnifiedActivity => ({
        id: ts.id,
        type: "timesheet",
        title: `Daily Timesheet (${ts.category})`,
        description: ts.description || "",
        dateStr: new Date(ts.created_at).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        rawDate: new Date(ts.created_at),
        status: ts.status,
        karma: ts.karma_awarded,
        raw: ts,
      }),
    ),
    ...reviews.map(
      (wr): UnifiedActivity => ({
        id: wr.id,
        type: "weekly_review",
        title: `Weekly Review - Week ${wr.iso_week}`,
        description: wr.weekly_review || "",
        dateStr: new Date(wr.created_at).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        rawDate: new Date(wr.created_at),
        status: wr.status,
        karma: wr.karma_awarded,
        raw: wr,
      }),
    ),
  ]
    .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime())
    .slice(0, 6);

  const getStatusBadge = (status: string, karma: number | null) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="font-black bg-success/15 text-success border-none rounded-lg px-2.5 py-0.5 text-[9px] uppercase tracking-wider shrink-0">
            +{karma ?? 0} Points
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="font-black bg-warning/15 text-warning border-none rounded-lg px-2.5 py-0.5 text-[9px] uppercase tracking-wider shrink-0">
            Pending
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="font-black bg-destructive/15 text-destructive border-none rounded-lg px-2.5 py-0.5 text-[9px] uppercase tracking-wider shrink-0">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="font-black bg-muted text-muted-foreground border-none rounded-lg px-2.5 py-0.5 text-[9px] uppercase tracking-wider shrink-0">
            {status}
          </Badge>
        );
    }
  };

  const handleSaveChanges = () => {
    if (!selectedItem) return;

    if (selectedItem.type === "timesheet") {
      const payload: TTimesheetUpdatePayload = {
        category: tsCategory,
        hours: tsHours,
        description: tsDescription,
        blockers: tsBlockers || "None",
        edit_reason: tsEditReason || "Self correction of details",
      };

      editTimesheetMutation.mutate({
        id: selectedItem.id,
        payload,
      });
    } else {
      const payload: TWeeklyReviewUpdatePayload = {
        hours_committed: Number(wrHours),
        tasks_assigned: wrTasksAssigned,
        tasks_completed: wrTasksCompleted,
        weekly_review: wrWeeklyReview,
        blockers: wrBlockers || "None",
        suggestions: wrSuggestions || "None",
        learnings: wrLearnings,
        challenges_faced: wrChallenges,
        next_week_plan: wrNextPlan,
      };

      editWeeklyReviewMutation.mutate({
        id: selectedItem.id,
        payload,
      });
    }
  };

  return (
    <Card className="h-full border-border/40 bg-card/40 backdrop-blur-md flex flex-col py-4 px-5">
      <CardHeader className="pt-0 px-0 pb-2 border-b border-border/20">
        <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
          <Activity className="w-5 h-5 text-muted-foreground" />
          Quest Log
        </CardTitle>
        <CardDescription className="text-xs font-bold uppercase text-muted-foreground/60">
          Recent Points Gains
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-3 px-0 pb-0 flex-1">
        <div className="divide-y divide-border/20">
          {recentActivities.map((activity) => (
            <button
              type="button"
              key={`${activity.type}-${activity.id}`}
              onClick={() => setSelectedItem(activity)}
              className="w-full text-left py-2.5 px-0 hover:bg-muted/10 transition-all flex items-start justify-between gap-4 group cursor-pointer border-none bg-transparent focus:outline-none"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors break-all">
                  {activity.title}
                </p>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  {activity.dateStr}
                </p>
              </div>
              {getStatusBadge(activity.status, activity.karma)}
            </button>
          ))}
          {recentActivities.length === 0 && (
            <div className="p-8 text-center text-xs text-muted-foreground italic uppercase tracking-wider">
              No recent activity
            </div>
          )}
        </div>
      </CardContent>
      <div className="pt-4 px-0 pb-0 border-t border-border/20">
        <Link href="/dashboard/intern/quest-log">
          <Button
            variant="outline"
            className="w-full gap-2 text-[10px] tracking-widest h-10 shadow-lg"
          >
            View History
          </Button>
        </Link>
      </div>

      {/* View/Edit Submission Dialog */}
      <Dialog
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      >
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-xl border-border/40 bg-card/95 backdrop-blur-2xl shadow-2xl">
          {selectedItem && (
            <>
              <DialogHeader className="pr-8 pb-4 border-b border-border/20">
                <DialogTitle className="text-xl font-black uppercase tracking-tight text-foreground break-all flex items-center gap-2">
                  {selectedItem.type === "timesheet"
                    ? "Daily Timesheet"
                    : "Weekly Review"}
                </DialogTitle>
                <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Submitted on {selectedItem.dateStr}
                </DialogDescription>
              </DialogHeader>

              <div className="max-h-[50vh] overflow-y-auto pr-1 space-y-4 py-4">
                {/* Status and Points Banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-border/40 bg-background/40">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                      Status
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(selectedItem.status, selectedItem.karma)}
                    </div>
                  </div>

                  {selectedItem.status === "APPROVED" && (
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                        Points Awarded
                      </p>
                      <p className="text-lg font-black text-success mt-0.5">
                        +{selectedItem.karma ?? 0} XP
                      </p>
                    </div>
                  )}
                </div>

                {/* Reviewer Note / Remarks if rejected or remarked */}
                {((selectedItem.raw as TTimesheet).review_note ||
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

                {/* Timesheet Form Fields */}
                {selectedItem.type === "timesheet" && (
                  <div className="space-y-4">
                    {/* Category Select */}
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Category
                      </Label>
                      <Select
                        value={tsCategory}
                        onValueChange={setTsCategory}
                        disabled={
                          selectedItem.status !== "PENDING" || !isEditMode
                        }
                      >
                        <SelectTrigger className="w-full bg-background/50 border-border/50 font-bold uppercase text-[10px] tracking-wider">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card font-bold border-border/60">
                          <SelectItem
                            value="DEVELOPMENT"
                            className="uppercase text-[9px]"
                          >
                            Development / Coding
                          </SelectItem>
                          <SelectItem
                            value="DESIGN"
                            className="uppercase text-[9px]"
                          >
                            UI/UX Arts / Design
                          </SelectItem>
                          <SelectItem
                            value="TESTING"
                            className="uppercase text-[9px]"
                          >
                            QA / Testing
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Hours committed */}
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
                        className="bg-background/50 border-border/50 font-medium"
                      />
                    </div>

                    {/* Description */}
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
                        className="bg-background/50 border-border/50 font-medium resize-none"
                      />
                    </div>

                    {/* Blockers */}
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
                        className="bg-background/50 border-border/50 font-medium resize-none"
                      />
                    </div>

                    {/* Edit Reason - MANDATORY if editing */}
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
                {selectedItem.type === "weekly_review" && (
                  <div className="space-y-4">
                    {/* Hours Committed */}
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

                    {/* Tasks Assigned */}
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

                    {/* Tasks Completed */}
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

                    {/* Weekly Review Summary */}
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

                    {/* Learnings */}
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

                    {/* Challenges */}
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

                    {/* Next Week Plan */}
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Next Week's Plan
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

                    {/* Blockers */}
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

                    {/* Suggestions */}
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
                  onClick={() => setSelectedItem(null)}
                  className="font-black text-[10px] uppercase tracking-widest h-9"
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
