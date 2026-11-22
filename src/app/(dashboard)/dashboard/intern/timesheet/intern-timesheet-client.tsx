"use client";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Plus,
  Trash2,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUserProfile } from "@/features/auth";
import {
  ActivityDetailDialog,
  getISTDateString,
  isTimesheetCounted,
  TIMESHEET_TASK_STATUS_OPTIONS,
  type TInternTaskStatus,
  type TTimesheet,
  timesheetToActivity,
  type UnifiedActivity,
  useInternOverview,
  useSubmitTimesheet,
  useTimesheetHistory,
  useTimesheetsPrefill,
} from "@/features/intern";

const DESCRIPTION_MIN = 30;
const DESCRIPTION_MAX = 2000;
const NOTE_MAX = 1000;

type TTaskRow = {
  key: number;
  task_id: string;
  status: TInternTaskStatus;
  remark: string;
};

function formatEntryDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function TimesheetPageClient() {
  const submitTimesheetMutation = useSubmitTimesheet();
  // Covers about a year of entries so older calendar months stay accurate.
  const {
    data: timesheetHistory,
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = useTimesheetHistory({ page: 1, perPage: 366, sortBy: "-entry_date" });
  const { data: prefill, isLoading: isPrefillLoading } = useTimesheetsPrefill();
  const { data: overview } = useInternOverview();
  const { data: profile } = useUserProfile();

  const todayStr = getISTDateString();
  const yesterdayStr = getISTDateString(-1);

  const entriesByDate = new Map<string, TTimesheet>();
  for (const ts of timesheetHistory?.data ?? []) {
    if (isTimesheetCounted(ts)) entriesByDate.set(ts.entry_date, ts);
  }
  const availableDates = [todayStr, yesterdayStr].filter(
    (d) => !entriesByDate.has(d),
  );

  const [entryDate, setEntryDate] = useState<string>("");
  const [hours, setHours] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [blockers, setBlockers] = useState<string>("");
  const [endOfDayNote, setEndOfDayNote] = useState<string>("");
  const [taskRows, setTaskRows] = useState<TTaskRow[]>([]);
  const [nextRowKey, setNextRowKey] = useState(0);
  const [selectedActivity, setSelectedActivity] =
    useState<UnifiedActivity | null>(null);

  const effectiveEntryDate = availableDates.includes(entryDate)
    ? entryDate
    : (availableDates[0] ?? "");

  // Month navigation state — default to current month
  const todayForNav = new Date();
  const [currentDate, setCurrentDate] = useState<Date>(
    new Date(todayForNav.getFullYear(), todayForNav.getMonth(), 1),
  );

  const navigateMonth = (dir: -1 | 1) => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + dir, 1),
    );
  };

  const isSubmitting = submitTimesheetMutation.isPending;
  const prefillTasks = prefill?.tasks ?? [];
  const isOnLeave = prefill?.on_leave ?? false;

  // Parse the user's onboarding date (strip time so comparisons are date-only)
  const dateVal = overview?.join_date || profile?.joined;
  const onboardingDate = dateVal
    ? (() => {
        const d = new Date(dateVal.replace(" ", "T"));
        d.setHours(0, 0, 0, 0);
        return d;
      })()
    : null;

  // First day of the onboarding month — used to restrict calendar navigation
  const onboardingMonthStart = onboardingDate
    ? new Date(onboardingDate.getFullYear(), onboardingDate.getMonth(), 1)
    : null;

  // Generate calendar based on currentDate (navigable)
  const today = new Date(`${todayStr}T00:00:00`);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const toDateStr = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month, i + 1);
    const isToday = d.getTime() === today.getTime();
    const isFuture = d.getTime() > today.getTime();
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const isBeforeOnboarding =
      onboardingDate !== null && d.getTime() < onboardingDate.getTime();

    const entry = entriesByDate.get(toDateStr(year, month, i + 1));

    let status = "missing";
    if (isBeforeOnboarding) {
      status = "disabled";
    } else if (entry) {
      status = "submitted";
    } else if (isToday) {
      status = "pending";
    } else if (isFuture || isWeekend) {
      status = "exempt";
    }

    return { date: d, status, isToday, entry };
  });

  // First weekday offset for the month grid
  const firstDayOffset = new Date(year, month, 1).getDay();

  // Previous month trailing days to fill offset cells
  const prevMonthDaysCount = new Date(year, month, 0).getDate();
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonth = month === 0 ? 11 : month - 1;
  // Check if the previous month itself is before the onboarding month
  const prevMonthStart = new Date(prevYear, prevMonth, 1);
  const isPrevMonthBeforeOnboarding =
    onboardingMonthStart !== null && prevMonthStart < onboardingMonthStart;

  const prevMonthTrailingDays = Array.from(
    { length: firstDayOffset },
    (_, i) => {
      const dayNum = prevMonthDaysCount - firstDayOffset + 1 + i;
      const d = new Date(prevYear, prevMonth, dayNum);
      const entry = entriesByDate.get(toDateStr(prevYear, prevMonth, dayNum));
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const isBeforeOnboarding =
        onboardingDate !== null && d.getTime() < onboardingDate.getTime();

      let status = "exempt";
      if (isPrevMonthBeforeOnboarding || isBeforeOnboarding) {
        status = "blank"; // hide entirely
      } else if (entry) {
        status = "submitted";
      } else if (!isWeekend) {
        status = "missing";
      }
      return { date: d, dayNum, status, entry };
    },
  );

  const openEntry = (entry: TTimesheet | undefined) => {
    if (entry) setSelectedActivity(timesheetToActivity(entry));
  };

  // ── Task rows ──────────────────────────────────────────────
  const usedTaskIds = new Set(taskRows.map((r) => r.task_id).filter(Boolean));
  const canAddTaskRow =
    prefillTasks.length > 0 && taskRows.length < prefillTasks.length;

  const addTaskRow = () => {
    setTaskRows((rows) => [
      ...rows,
      { key: nextRowKey, task_id: "", status: "IN_PROGRESS", remark: "" },
    ]);
    setNextRowKey((k) => k + 1);
  };

  const updateTaskRow = (key: number, patch: Partial<TTaskRow>) => {
    setTaskRows((rows) =>
      rows.map((r) => (r.key === key ? { ...r, ...patch } : r)),
    );
  };

  const removeTaskRow = (key: number) => {
    setTaskRows((rows) => rows.filter((r) => r.key !== key));
  };

  // ── Validation ─────────────────────────────────────────────
  const hoursNum = Number(hours);
  const trimmedDescription = description.trim();
  const validationError = !effectiveEntryDate
    ? "You've already submitted for today and yesterday."
    : !(hoursNum > 0 && hoursNum <= 24)
      ? "Hours must be greater than 0 and at most 24."
      : trimmedDescription.length < DESCRIPTION_MIN
        ? `Description must be at least ${DESCRIPTION_MIN} characters.`
        : taskRows.some((r) => !r.task_id)
          ? "Pick a task for every task row, or remove the empty row."
          : null;

  const resetForm = () => {
    setHours("");
    setDescription("");
    setBlockers("");
    setEndOfDayNote("");
    setTaskRows([]);
    setEntryDate("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    submitTimesheetMutation.mutate(
      {
        entry_date: effectiveEntryDate,
        hours: hoursNum,
        description: trimmedDescription,
        blockers: blockers.trim() || null,
        end_of_day_note: endOfDayNote.trim() || null,
        task:
          taskRows.length > 0
            ? taskRows.map((r) => ({
                task_id: r.task_id,
                status: r.status,
                ...(r.remark.trim() ? { remark: r.remark.trim() } : {}),
              }))
            : undefined,
      },
      {
        onSuccess: resetForm,
        onError: (error) => {
          if (error instanceof ApiError && error.status === 409) {
            toast.error(
              `A timesheet for ${formatEntryDate(effectiveEntryDate)} already exists.`,
            );
            void refetchHistory();
          }
        },
      },
    );
  };

  if (isHistoryLoading || isPrefillLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  const isAllSubmitted = availableDates.length === 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      <div
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        data-tour-id="page:intern-timesheet:header"
      >
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase">
            Daily Timesheet
          </h2>
          <p className="text-muted-foreground mt-1 font-medium italic">
            Log what you worked on today. Missed yesterday? You can still log
            it.
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3 items-start">
        {/* Submit Form */}
        <div className="md:col-span-2">
          {isAllSubmitted ? (
            <Card
              className="border-border/40 bg-card/40 backdrop-blur-md shadow-2xl relative overflow-hidden"
              data-tour-id="page:intern-timesheet:submit-form"
            >
              <CardContent className="p-6">
                <Alert className="bg-success/10 text-success border-success/20 py-6 px-6 rounded-xl flex items-start gap-4">
                  <CheckCircle2 className="h-8 w-8 text-success mt-1" />
                  <div className="space-y-2">
                    <AlertTitle className="text-2xl font-black uppercase tracking-tight">
                      Daily timesheet committed
                    </AlertTitle>
                    <AlertDescription className="font-bold opacity-80 text-sm">
                      You have already submitted your timesheet for today. You
                      can still edit it from the calendar until the end of
                      tomorrow.
                    </AlertDescription>
                  </div>
                </Alert>
              </CardContent>
            </Card>
          ) : (
            <form onSubmit={handleSubmit}>
              <Card
                className="border-border/40 bg-card/40 backdrop-blur-md shadow-2xl relative overflow-hidden group"
                data-tour-id="page:intern-timesheet:submit-form"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                  <Zap className="w-32 h-32 text-primary" />
                </div>
                <CardHeader className="border-b border-border/20">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl font-black uppercase tracking-tighter">
                        Submit Progress
                      </CardTitle>
                      <CardDescription className="font-bold text-muted-foreground/60 uppercase text-[10px] tracking-[0.1em]">
                        Detail your heroic deeds
                      </CardDescription>
                    </div>
                    {availableDates.length > 1 ? (
                      <Select
                        value={effectiveEntryDate}
                        onValueChange={setEntryDate}
                        disabled={isOnLeave}
                      >
                        <SelectTrigger className="w-full sm:w-56 bg-background/50 border-border/50 !h-9 font-bold">
                          <SelectValue placeholder="Pick a date" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {availableDates.map((d) => (
                            <SelectItem
                              key={d}
                              value={d}
                              className="font-bold text-xs"
                            >
                              {d === todayStr ? "Today" : "Yesterday"} ·{" "}
                              {formatEntryDate(d)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge
                        variant="default"
                        className="px-4 py-1.5 font-black text-xs"
                      >
                        {effectiveEntryDate === yesterdayStr
                          ? "Yesterday · "
                          : ""}
                        {formatEntryDate(effectiveEntryDate)}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-8">
                  {isOnLeave && (
                    <Alert className="bg-warning/10 text-warning border-warning/30">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="font-black uppercase tracking-tight">
                        You're on approved leave
                      </AlertTitle>
                      <AlertDescription className="font-bold opacity-80 text-xs">
                        Timesheets can't be submitted while you're on leave.
                      </AlertDescription>
                    </Alert>
                  )}

                  <fieldset disabled={isOnLeave} className="space-y-6">
                    <div className="space-y-2 md:w-1/2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        Time Channelled
                      </Label>
                      <Input
                        type="number"
                        placeholder="Hours..."
                        required
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                        className="bg-background/50 border-border/50 h-10 font-bold pl-4 focus:ring-brand-blue/30"
                        min="0.25"
                        max="24"
                        step="0.25"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                          Task Updates (Optional)
                        </Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={addTaskRow}
                          disabled={!canAddTaskRow}
                          className="h-7 text-[10px] font-black uppercase tracking-wider"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Task
                        </Button>
                      </div>
                      {prefillTasks.length === 0 && (
                        <p className="text-[11px] font-bold text-muted-foreground/70">
                          No open tasks assigned to you.
                        </p>
                      )}
                      {taskRows.map((row) => {
                        const selectedTask = prefillTasks.find(
                          (t) => t.task_id === row.task_id,
                        );
                        return (
                          <div
                            key={row.key}
                            className="rounded-xl border border-border/40 bg-background/30 p-3 space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row gap-3">
                              <Select
                                value={row.task_id}
                                onValueChange={(val) =>
                                  updateTaskRow(row.key, {
                                    task_id: val,
                                    status:
                                      row.status === "COMPLETED" &&
                                      !prefillTasks.find(
                                        (t) => t.task_id === val,
                                      )?.output_link
                                        ? "IN_PROGRESS"
                                        : row.status,
                                  })
                                }
                              >
                                <SelectTrigger className="w-full sm:flex-1 bg-background/50 border-border/50 !h-10 font-bold">
                                  <SelectValue placeholder="Pick a task..." />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                  {prefillTasks.map((task) => (
                                    <SelectItem
                                      key={task.task_id}
                                      value={task.task_id}
                                      disabled={
                                        task.task_id !== row.task_id &&
                                        usedTaskIds.has(task.task_id)
                                      }
                                      className="font-bold text-xs"
                                    >
                                      {task.title}
                                      {task.is_overdue && (
                                        <span className="ml-2 text-[9px] font-black uppercase text-destructive">
                                          Overdue
                                        </span>
                                      )}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select
                                value={row.status}
                                onValueChange={(val) =>
                                  updateTaskRow(row.key, {
                                    status: val as TInternTaskStatus,
                                  })
                                }
                              >
                                <SelectTrigger className="w-full sm:w-48 bg-background/50 border-border/50 !h-10 font-bold">
                                  <SelectValue placeholder="Status..." />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                  {TIMESHEET_TASK_STATUS_OPTIONS.map((opt) => (
                                    <SelectItem
                                      key={opt.value}
                                      value={opt.value}
                                      disabled={
                                        opt.value === "COMPLETED" &&
                                        !selectedTask?.output_link
                                      }
                                      className="font-bold uppercase text-xs"
                                    >
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeTaskRow(row.key)}
                                aria-label="Remove task"
                                className="shrink-0 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            {selectedTask && !selectedTask.output_link && (
                              <p className="text-[10px] font-bold text-muted-foreground/70">
                                Add an output link on the Tasks page to mark
                                this task completed.
                              </p>
                            )}
                            <Input
                              placeholder="Remark (optional)"
                              value={row.remark}
                              onChange={(e) =>
                                updateTaskRow(row.key, {
                                  remark: e.target.value,
                                })
                              }
                              className="bg-background/50 border-border/50 h-9 text-xs font-medium"
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2">
                          <FileText className="w-3 h-3" />
                          Daily Achievement Log
                        </span>
                        <span
                          className={
                            trimmedDescription.length > 0 &&
                            trimmedDescription.length < DESCRIPTION_MIN
                              ? "text-destructive"
                              : ""
                          }
                        >
                          {trimmedDescription.length}/{DESCRIPTION_MAX}
                        </span>
                      </Label>
                      <Textarea
                        placeholder={`Describe your progress (at least ${DESCRIPTION_MIN} characters)...`}
                        required
                        value={description}
                        maxLength={DESCRIPTION_MAX}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-[180px] bg-background/50 border-border/50 font-bold focus:ring-brand-blue/30 resize-none p-4"
                      />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                          Blockers Encountered (Optional)
                        </Label>
                        <Textarea
                          placeholder="Any shadows holding you back?"
                          value={blockers}
                          maxLength={NOTE_MAX}
                          onChange={(e) => setBlockers(e.target.value)}
                          className="min-h-[100px] bg-background/50 border-border/50 font-bold focus:ring-brand-blue/30 resize-none p-4"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                          End of Day Note (Optional)
                        </Label>
                        <Textarea
                          placeholder="Plans for tomorrow, wins, anything else..."
                          value={endOfDayNote}
                          maxLength={NOTE_MAX}
                          onChange={(e) => setEndOfDayNote(e.target.value)}
                          className="min-h-[100px] bg-background/50 border-border/50 font-bold focus:ring-brand-blue/30 resize-none p-4"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting || isOnLeave}
                        className="w-full text-sm shadow-[0_8px_16px_rgba(46,133,254,0.25)] font-bold rounded-full"
                      >
                        {isSubmitting ? (
                          <>
                            <Spinner className="mr-3 h-5 w-5" />
                            Channeling Progress...
                          </>
                        ) : (
                          "Commit Daily Timesheet"
                        )}
                      </Button>
                    </div>
                  </fieldset>
                </CardContent>
              </Card>
            </form>
          )}
        </div>

        {/* Calendar View */}
        <div className="md:col-span-1 space-y-4">
          <Card
            className="border-border/40 bg-card/30 backdrop-blur-md shadow-xl overflow-hidden gap-1.5 py-4"
            data-tour-id="page:intern-timesheet:calendar"
          >
            <CardHeader className="pb-2 border-b border-border/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-blue" />
                    Daily History
                  </CardTitle>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1 pl-6">
                    {new Date(year, month).toLocaleDateString(undefined, {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigateMonth(-1)}
                    disabled={
                      onboardingMonthStart !== null &&
                      new Date(year, month, 1).getTime() <=
                        onboardingMonthStart.getTime()
                    }
                    className="p-1.5 rounded-lg transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigateMonth(1)}
                    disabled={new Date(year, month + 1, 1) > today}
                    className="p-1.5 rounded-lg transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Next month"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-1.5">
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-[10px] font-black uppercase mb-2 text-muted-foreground tracking-widest">
                <div>Su</div>
                <div>Mo</div>
                <div>Tu</div>
                <div>We</div>
                <div>Th</div>
                <div>Fr</div>
                <div>Sa</div>
              </div>
              <TooltipProvider>
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
                  {prevMonthTrailingDays.map((prev) => {
                    const keyStr = prev.date.toISOString();
                    // Blank out days before onboarding
                    if (prev.status === "blank") {
                      return (
                        <div key={keyStr} className="aspect-square opacity-0" />
                      );
                    }
                    let prevStyles =
                      "bg-muted/10 text-muted-foreground/20 border-transparent";
                    if (prev.status === "submitted") {
                      prevStyles =
                        "bg-success/10 text-success/50 border-success/20";
                    } else if (prev.status === "missing") {
                      prevStyles =
                        "bg-destructive/10 text-destructive/50 border-destructive/20";
                    }
                    return (
                      <Tooltip key={keyStr}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => openEntry(prev.entry)}
                            disabled={!prev.entry}
                            className={`aspect-square flex items-center justify-center rounded-lg text-xs font-black border transition-all opacity-50 ${prev.entry ? "cursor-pointer" : "cursor-help"} ${prevStyles}`}
                          >
                            {prev.dayNum}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-bold text-xs uppercase tracking-wider">
                            {prev.date.toLocaleDateString()} &bull;{" "}
                            {prev.status}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                  {days.map((day) => {
                    const keyStr = day.date.toISOString();

                    const isCalendarDisabled = day.status === "disabled";

                    let styles =
                      "bg-muted/30 text-muted-foreground/50 border-transparent";
                    if (day.status === "submitted") {
                      styles =
                        "bg-success/20 text-success border-success/30 shadow-[0_0_10px_rgba(76,175,80,0.1)]";
                    } else if (day.status === "missing") {
                      styles =
                        "bg-destructive/10 text-destructive border-destructive/20";
                    } else if (day.status === "pending" || day.isToday) {
                      styles =
                        "bg-brand-blue/20 text-brand-blue border-brand-blue/50 ring-2 ring-brand-blue/20 animate-pulse";
                    } else if (day.status === "exempt") {
                      styles = "bg-muted/10 text-muted-foreground/30";
                    } else if (day.status === "disabled") {
                      styles =
                        "bg-muted/5 text-muted-foreground/20 border-transparent";
                    }

                    return (
                      <Tooltip key={keyStr}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => openEntry(day.entry)}
                            className={`aspect-square flex items-center justify-center rounded-lg text-xs font-black border transition-all ${
                              isCalendarDisabled
                                ? "cursor-not-allowed opacity-40"
                                : day.entry
                                  ? "hover:scale-110 cursor-pointer"
                                  : "hover:scale-110 cursor-help"
                            } ${styles}`}
                          >
                            {day.date.getDate()}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-bold text-xs uppercase tracking-wider">
                            {day.date.toLocaleDateString()} &bull; {day.status}
                            {day.entry ? " · click to view" : ""}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </TooltipProvider>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-success/40 border border-success" />{" "}
                  Submitted
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-destructive/40 border border-destructive" />{" "}
                  Missed
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-brand-blue/40 border-2 border-brand-blue" />{" "}
                  Today
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ActivityDetailDialog
        selectedItem={selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />
    </div>
  );
}
