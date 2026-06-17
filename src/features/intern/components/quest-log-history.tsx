"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit2,
  HelpCircle,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { internApi } from "../api/intern.api";
import {
  useInternTasks,
  useTimesheetHistory,
  useUpdateTaskStatus,
  useWeeklyReviewHistory,
} from "../hooks/use-intern";
import type {
  TInternTask,
  TTimesheet,
  TTimesheetUpdatePayload,
  TWeeklyReview,
  TWeeklyReviewUpdatePayload,
} from "../types";
import { getTaskKarma } from "../utils/intern-helpers";

type UnifiedActivity = {
  id: string;
  type: "timesheet" | "weekly_review" | "completed_task";
  title: string;
  description: string;
  dateStr: string;
  rawDate: Date;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "COMPLETED";
  karma: number | null;
  raw: TTimesheet | TWeeklyReview | TInternTask;
};

export function QuestLogHistory() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const perPage = 10;

  const { data: timesheetHistory, isLoading: isTimesheetLoading } =
    useTimesheetHistory({ page: 1, perPage: 100 });
  const { data: weeklyReviews, isLoading: isWeeklyLoading } =
    useWeeklyReviewHistory({ page: 1, perPage: 100 });
  const { data: myTasks, isLoading: isTasksLoading } = useInternTasks({
    page: 1,
    perPage: 100,
  });
  const updateTaskStatusMutation = useUpdateTaskStatus();

  const [selectedItem, setSelectedItem] = useState<UnifiedActivity | null>(
    null,
  );
  const [isEditMode, setIsEditMode] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "timesheet" | "task">(
    "all",
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "COMPLETED"
  >("all");

  const handleTaskStatusChange = (
    taskId: string,
    status: "WAITING_FOR_REVIEW" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD",
  ) => {
    updateTaskStatusMutation.mutate(
      { id: taskId, status },
      {
        onSuccess: () => {
          setSelectedItem(null);
        },
      },
    );
  };

  useEffect(() => {
    setPage(1);
  }, []);

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
      } else {
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

  const isLoading = isTimesheetLoading || isWeeklyLoading || isTasksLoading;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  const timesheets = timesheetHistory?.data || [];
  const reviews = weeklyReviews?.data || [];
  const tasks = myTasks?.data || [];
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED");

  const allActivities: UnifiedActivity[] = [
    ...timesheets.map(
      (ts): UnifiedActivity => ({
        id: ts.id,
        type: "timesheet",
        title: "Daily Timesheet",
        description: ts.description || "",
        dateStr: new Date(ts.created_at).toLocaleDateString(undefined, {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        rawDate: new Date(ts.created_at),
        status: ts.status,
        karma: ts.score ?? ts.karma_awarded,
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
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        rawDate: new Date(wr.created_at),
        status: wr.status,
        karma: wr.score ?? wr.karma_awarded,
        raw: wr,
      }),
    ),
    ...completedTasks.map(
      (task): UnifiedActivity => ({
        id: task.id,
        type: "completed_task",
        title: `Task Completed: ${task.title}`,
        description: task.description || "",
        dateStr: task.updated_at
          ? new Date(task.updated_at).toLocaleDateString(undefined, {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : new Date(task.created_at).toLocaleDateString(undefined, {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
        rawDate: task.updated_at
          ? new Date(task.updated_at)
          : new Date(task.created_at),
        status: "COMPLETED",
        karma: getTaskKarma(task),
        raw: task,
      }),
    ),
  ].sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

  const filteredActivities = allActivities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      filterType === "all" ||
      (filterType === "timesheet" &&
        (activity.type === "timesheet" || activity.type === "weekly_review")) ||
      (filterType === "task" && activity.type === "completed_task");

    const matchesStatus =
      filterStatus === "all" || activity.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredActivities.length / perPage) || 1;
  const paginatedActivities = filteredActivities.slice(
    (page - 1) * perPage,
    page * perPage,
  );

  const getStatusBadge = (
    status: string,
    karma: number | null,
    isVerified?: boolean,
  ) => {
    switch (status) {
      case "APPROVED":
        return (
          <div className="bg-success/15 text-success border border-success/30 font-black text-[9px] rounded-full px-2.5 py-0.5 uppercase tracking-wider flex items-center gap-1 shrink-0">
            Gained {karma ?? 0} pts
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
  };

  const handleSaveChanges = () => {
    if (!selectedItem) return;

    if (selectedItem.type === "timesheet") {
      const payload: TTimesheetUpdatePayload = {
        end_of_day_note: tsEndOfDayNote,
        edit_reason: tsEditReason || "Self correction of details",
      };

      editTimesheetMutation.mutate({
        id: selectedItem.id,
        payload,
      });
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

      editWeeklyReviewMutation.mutate({
        id: selectedItem.id,
        payload,
      });
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full bg-background/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="default"
              className="px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest"
            >
              Quest History
            </Badge>
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase">
            Quest Log History
          </h2>
          <p className="text-muted-foreground mt-1 font-medium italic">
            Review your submissions, check validation remarks, and edit rejected
            ones.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card/20 backdrop-blur-md p-4 rounded-xl border border-border/20">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by quest or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/40 border-border/40 focus-visible:ring-brand-blue"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-44">
            <Select
              value={filterType}
              onValueChange={(val) => setFilterType(val as any)}
            >
              <SelectTrigger className="w-full bg-background/40 border-border/40 font-bold uppercase text-[10px] tracking-wider">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="bg-card font-bold border-border/60">
                <SelectItem value="all" className="uppercase text-[9px]">
                  All Types
                </SelectItem>
                <SelectItem value="timesheet" className="uppercase text-[9px]">
                  Timesheets
                </SelectItem>
                <SelectItem value="task" className="uppercase text-[9px]">
                  Tasks
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-44">
            <Select
              value={filterStatus}
              onValueChange={(val) => setFilterStatus(val as any)}
            >
              <SelectTrigger className="w-full bg-background/40 border-border/40 font-bold uppercase text-[10px] tracking-wider">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-card font-bold border-border/60">
                <SelectItem value="all" className="uppercase text-[9px]">
                  All Statuses
                </SelectItem>
                <SelectItem value="PENDING" className="uppercase text-[9px]">
                  Pending
                </SelectItem>
                <SelectItem value="APPROVED" className="uppercase text-[9px]">
                  Approved
                </SelectItem>
                <SelectItem value="COMPLETED" className="uppercase text-[9px]">
                  Completed
                </SelectItem>
                <SelectItem value="REJECTED" className="uppercase text-[9px]">
                  Rejected
                </SelectItem>
                <SelectItem value="CANCELLED" className="uppercase text-[9px]">
                  Cancelled
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Card className="border-border/40 bg-card/40 backdrop-blur-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/10 border-b border-border/20 hover:bg-transparent">
                <TableHead className="font-black uppercase text-[9px] tracking-[0.2em] text-muted-foreground pl-6 py-3">
                  Quest / Activity
                </TableHead>
                <TableHead className="font-black uppercase text-[9px] tracking-[0.2em] text-muted-foreground py-3">
                  Submitted
                </TableHead>
                <TableHead className="font-black uppercase text-[9px] tracking-[0.2em] text-muted-foreground py-3 hidden md:table-cell">
                  Description
                </TableHead>
                <TableHead className="font-black uppercase text-[9px] tracking-[0.2em] text-muted-foreground pr-6 py-3 text-right">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedActivities.map((activity) => (
                <TableRow
                  key={`${activity.type}-${activity.id}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedItem(activity)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedItem(activity);
                    }
                  }}
                  className="border-b border-border/10 transition-all cursor-pointer hover:bg-muted/20 focus:ring-2 focus:ring-ring focus:outline-none"
                >
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-blue shrink-0" />
                      <span className="text-sm font-bold text-foreground">
                        {activity.title}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {activity.dateStr}
                  </TableCell>
                  <TableCell className="py-4 text-xs font-medium text-muted-foreground hidden md:table-cell max-w-xs truncate">
                    {activity.description || (
                      <span className="italic text-muted-foreground/40">
                        No description provided.
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="pr-6 py-4 text-right">
                    <div className="flex justify-end items-center">
                      {getStatusBadge(
                        activity.status,
                        activity.karma,
                        activity.type === "completed_task"
                          ? (activity.raw as TInternTask).is_verified
                          : undefined,
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredActivities.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-12 text-sm font-bold text-muted-foreground uppercase tracking-wider italic"
                  >
                    {allActivities.length === 0
                      ? "No quests logged yet."
                      : "No matching quests found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              variant="outline"
              className="rounded-full h-9 text-xs font-black uppercase tracking-wider border-border/40 hover:bg-muted/20"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </Button>
            <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">
              Page {page} of {totalPages}
            </span>
            <Button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              variant="outline"
              className="rounded-full h-9 text-xs font-black uppercase tracking-wider border-border/40 hover:bg-muted/20"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
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
                    : selectedItem.type === "weekly_review"
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
                {/* Status and Points Banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-border/40 bg-background/40">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                      Status
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(
                        selectedItem.status,
                        selectedItem.karma,
                        selectedItem.type === "completed_task"
                          ? (selectedItem.raw as TInternTask).is_verified
                          : undefined,
                      )}
                    </div>
                  </div>

                  {selectedItem.type === "completed_task" &&
                    (selectedItem.raw as TInternTask).karma_awarded !==
                      undefined && (
                      <div className="text-center sm:text-right">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                          Base Karma
                        </p>
                        <p className="text-sm font-bold text-foreground mt-0.5">
                          {(selectedItem.raw as TInternTask).karma_awarded} pts
                        </p>
                      </div>
                    )}

                  {(selectedItem.status === "APPROVED" ||
                    (selectedItem.status === "COMPLETED" &&
                      (selectedItem.raw as TInternTask).is_verified)) && (
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                        Points Earned
                      </p>
                      <p className="text-lg font-black text-success mt-0.5">
                        +{selectedItem.karma ?? 0} pts
                      </p>
                    </div>
                  )}
                </div>

                {/* Reviewer Note / Remarks if rejected or remarked */}
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
                    {/* Category */}
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

                    {/* Complexity */}
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Complexity
                      </Label>
                      <Input
                        value={
                          (selectedItem.raw as TInternTask).complexity || ""
                        }
                        disabled={true}
                        className="bg-background/50 border-border/50 font-medium cursor-not-allowed uppercase"
                      />
                    </div>

                    {/* Task Description */}
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

                    {/* Status updater for completed task (card should editing for that) */}
                    <div className="space-y-1.5 p-3 rounded-xl border border-brand-blue/30 bg-brand-blue/5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-brand-blue">
                        Task Status
                      </Label>
                      <Select
                        value={(selectedItem.raw as TInternTask).status}
                        onValueChange={(val) => {
                          handleTaskStatusChange(selectedItem.id, val as any);
                        }}
                      >
                        <SelectTrigger className="w-full bg-background/50 border-border/50 font-bold uppercase text-[10px] tracking-wider mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card font-bold border-border/60">
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
                        disabled={true}
                        className="bg-background/50 border-border/50 font-medium cursor-not-allowed"
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
                        disabled={true}
                        rows={4}
                        className="bg-background/50 border-border/50 font-medium resize-none cursor-not-allowed"
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
                        disabled={true}
                        rows={2}
                        className="bg-background/50 border-border/50 font-medium resize-none cursor-not-allowed"
                      />
                    </div>

                    {/* End of Day Note */}
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
    </div>
  );
}
