"use client";
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Flame,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
  useInternOverview,
  useInternTasks,
  useSubmitTimesheet,
  useTimesheetHistory,
  useTimesheets,
  useTimesheetToday,
} from "@/features/intern";

export function TimesheetPageClient() {
  const submitTimesheetMutation = useSubmitTimesheet();
  const { data: todayTimesheet, isLoading: isTodayLoading } =
    useTimesheetToday();
  const { data: timesheetHistory, isLoading: isHistoryLoading } =
    useTimesheetHistory({ page: 1, perPage: 50 });
  const { data: _timesheetsData, isLoading: isTimesheetsLoading } =
    useTimesheets({ page: 1, perPage: 100 });
  const { data: overview } = useInternOverview();
  const { data: tasksData } = useInternTasks({ page: 1, perPage: 100 });
  const { data: profile } = useUserProfile();

  const [hours, setHours] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [blockers, setBlockers] = useState<string>("");
  const [linkedTaskId, setLinkedTaskId] = useState<string>("");
  const [taskStatus, setTaskStatus] = useState<string>("COMPLETED");

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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month, i + 1);
    const isToday = d.getTime() === today.getTime();
    const isFuture = d.getTime() > today.getTime();
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const isBeforeOnboarding =
      onboardingDate !== null && d.getTime() < onboardingDate.getTime();

    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
    const entry = timesheetHistory?.data?.find(
      (ts) => ts.entry_date === dateStr,
    );

    let status = "missing";
    if (isBeforeOnboarding) {
      status = "disabled";
    } else if (entry) {
      if (entry.status === "APPROVED") status = "submitted";
      else if (entry.status === "PENDING") status = "pending";
      else if (entry.status === "REJECTED") status = "missing";
    } else if (isToday) {
      status = "pending";
    } else if (isFuture || isWeekend) {
      status = "exempt";
    }

    return { date: d, status, isToday };
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
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      const entry = timesheetHistory?.data?.find(
        (ts) => ts.entry_date === dateStr,
      );
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const isBeforeOnboarding =
        onboardingDate !== null && d.getTime() < onboardingDate.getTime();

      let status = "exempt";
      if (isPrevMonthBeforeOnboarding || isBeforeOnboarding) {
        status = "blank"; // hide entirely
      } else if (entry) {
        if (entry.status === "APPROVED") status = "submitted";
        else if (entry.status === "PENDING") status = "pending";
        else if (entry.status === "REJECTED") status = "missing";
      } else if (!isWeekend) {
        status = "missing";
      }
      return { date: d, dayNum, status };
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hours || !description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const dateStr = new Date().toISOString().split("T")[0];

    submitTimesheetMutation.mutate(
      {
        entry_date: dateStr,
        hours: parseFloat(hours),
        description,
        blockers: blockers || "None",
        task:
          linkedTaskId && linkedTaskId !== "none"
            ? [
                {
                  task_id: linkedTaskId,
                  status: taskStatus,
                  remark: "",
                },
              ]
            : undefined,
      },
      {
        onSuccess: () => {
          setHours("");
          setDescription("");
          setBlockers("");
          setLinkedTaskId("");
        },
      },
    );
  };

  const streak = overview?.daily_streak ?? 0;
  let multiplier = "1.0×";
  if (streak >= 30) multiplier = "2.0×";
  else if (streak >= 14) multiplier = "1.5×";
  else if (streak >= 7) multiplier = "1.2×";

  const activeTasks =
    tasksData?.data?.filter((t) => t.status !== "COMPLETED") || [];

  if (isTodayLoading || isHistoryLoading || isTimesheetsLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  const hasSubmittedToday = !!todayTimesheet;

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="default"
              className="px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest"
            >
              Daily Submissions
            </Badge>
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase">
            Daily Timesheet
          </h2>
          <p className="text-muted-foreground mt-1 font-medium italic">
            Log your daily activities to maintain your legendary streak.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-card/40 backdrop-blur-md border border-border/40 p-4 rounded-2xl shadow-xl">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
              Multiplier
            </span>
            <span className="text-2xl font-black text-brand-blue">
              {multiplier} XP
            </span>
          </div>
          <div className="w-[1px] h-10 bg-border/40" />
          <div className="flex items-center gap-2">
            <Flame className="w-8 h-8 text-brand-blue fill-brand-blue animate-pulse" />
            <div className="flex flex-col">
              <span className="text-2xl font-black tabular-nums">{streak}</span>
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                Day Streak
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3 items-start">
        {/* Today's Form */}
        <div className="md:col-span-2">
          {hasSubmittedToday ? (
            <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-2xl relative overflow-hidden">
              <CardContent className="p-6">
                <Alert className="bg-success/10 text-success border-success/20 py-6 px-6 rounded-xl flex items-start gap-4">
                  <CheckCircle2 className="h-8 w-8 text-success mt-1" />
                  <div className="space-y-2">
                    <AlertTitle className="text-2xl font-black uppercase tracking-tight">
                      Daily quest commited
                    </AlertTitle>
                    <AlertDescription className="font-bold opacity-80 text-sm">
                      Awesome job! You have already submitted your daily quest
                      timesheet for today. Keep up the consistency and maintain
                      your streak tomorrow!
                    </AlertDescription>
                  </div>
                </Alert>
              </CardContent>
            </Card>
          ) : (
            <form onSubmit={handleSubmit}>
              <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-2xl relative overflow-hidden group">
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
                        Detail your heroic deeds for today
                      </CardDescription>
                    </div>
                    <Badge
                      variant="default"
                      className="px-4 py-1.5 font-black text-xs"
                    >
                      {new Date().toLocaleDateString(undefined, {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-8">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        Time Channelled
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="Hours..."
                          required
                          value={hours}
                          onChange={(e) => setHours(e.target.value)}
                          className="bg-background/50 border-border/50 h-10 font-bold pl-4 focus:ring-brand-blue/30"
                          min="1"
                          max="24"
                          step="0.25"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        Link to Assigned Task
                      </Label>
                      <Select
                        onValueChange={setLinkedTaskId}
                        value={linkedTaskId}
                        disabled={activeTasks.length === 0}
                      >
                        <SelectTrigger className="w-full bg-background/50 border-border/50 !h-10 font-bold focus:ring-brand-blue/30">
                          <SelectValue
                            placeholder={
                              activeTasks.length > 0
                                ? "Link an assigned task..."
                                : "No active tasks assigned"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value="none"
                            className="font-bold uppercase text-xs text-muted-foreground"
                          >
                            None
                          </SelectItem>
                          {activeTasks.map((task) => (
                            <SelectItem
                              key={task.id}
                              value={task.id}
                              className="font-bold uppercase text-xs"
                            >
                              {task.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {linkedTaskId && linkedTaskId !== "none" && (
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                          Update Task Status
                        </Label>
                        <Select
                          onValueChange={setTaskStatus}
                          value={taskStatus}
                        >
                          <SelectTrigger className="w-full bg-background/50 border-border/50 !h-10 font-bold focus:ring-brand-blue/30">
                            <SelectValue placeholder="Update status..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="WAITING_FOR_REVIEW"
                              className="font-bold uppercase text-xs"
                            >
                              Waiting for Review
                            </SelectItem>
                            <SelectItem
                              value="IN_PROGRESS"
                              className="font-bold uppercase text-xs"
                            >
                              In Progress
                            </SelectItem>
                            <SelectItem
                              value="COMPLETED"
                              className="font-bold uppercase text-xs"
                            >
                              Completed
                            </SelectItem>
                            <SelectItem
                              value="ON_HOLD"
                              className="font-bold uppercase text-xs"
                            >
                              On Hold
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      Daily Achievement Log
                    </Label>
                    <Textarea
                      placeholder="Describe your progress, conquered bugs, and legendary PRs..."
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[180px] bg-background/50 border-border/50 font-bold focus:ring-brand-blue/30 resize-none p-4"
                    />
                    <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest text-right italic">
                      Quality logs earn streak multipliers
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      Blockers Encountered (Optional)
                    </Label>
                    <Textarea
                      placeholder="Any shadows holding you back?"
                      value={blockers}
                      onChange={(e) => setBlockers(e.target.value)}
                      className="min-h-[100px] bg-background/50 border-border/50 font-bold focus:ring-brand-blue/30 resize-none p-4"
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 text-sm shadow-[0_8px_16px_rgba(46,133,254,0.25)] font-bold rounded-full"
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner className="mr-3 h-5 w-5" />
                          Channeling Progress...
                        </>
                      ) : (
                        "Commit Daily Quest"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          )}
        </div>

        {/* Calendar View */}
        <div className="md:col-span-1 space-y-4">
          <Card className="border-border/40 bg-card/30 backdrop-blur-md shadow-xl overflow-hidden gap-1.5 py-4">
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
                  {prevMonthTrailingDays.map((prev, _i) => {
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
                          <div
                            className={`aspect-square flex items-center justify-center rounded-lg text-xs font-black border transition-all cursor-help opacity-50 ${prevStyles}`}
                          >
                            {prev.dayNum}
                          </div>
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
                  {days.map((day, _i) => {
                    const keyStr = day.date.toISOString();
                    // Blank out days before onboarding (if any are marked blank)
                    if (day.status === "blank") {
                      return (
                        <div key={keyStr} className="aspect-square opacity-0" />
                      );
                    }

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
                          <div
                            className={`aspect-square flex items-center justify-center rounded-lg text-xs font-black border transition-all ${
                              isCalendarDisabled
                                ? "cursor-not-allowed opacity-40"
                                : "hover:scale-110 cursor-help"
                            } ${styles}`}
                          >
                            {day.date.getDate()}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-bold text-xs uppercase tracking-wider">
                            {day.date.toLocaleDateString()} &bull; {day.status}
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

          <Card className="border-border/40 bg-card/30 backdrop-blur-md shadow-xl overflow-hidden gap-1.5 py-4">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-blue" />
                Streak Bonus
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1.5 space-y-3">
              {/* Current streak big number */}
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-4xl font-black tracking-tighter tabular-nums bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
                    {streak}
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    Day Streak
                  </div>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <Badge
                    variant="secondary"
                    className="font-black text-[10px] px-2 py-0.5"
                  >
                    {multiplier} Point Boost
                  </Badge>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    Active multiplier
                  </span>
                </div>
              </div>

              {/* Milestone progress */}
              <div className="space-y-1.5">
                {[
                  { label: "1.2× at 7 days", target: 7 },
                  { label: "1.5× at 14 days", target: 14 },
                  { label: "2.0× at 30 days", target: 30 },
                ].map(({ label, target }) => {
                  const pct = Math.min(
                    100,
                    Math.round((streak / target) * 100),
                  );
                  const reached = streak >= target;
                  return (
                    <div key={target}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span
                          className={`text-[9px] font-black uppercase tracking-widest ${
                            reached
                              ? "text-brand-blue"
                              : "text-muted-foreground/60"
                          }`}
                        >
                          {label}
                        </span>
                        <span
                          className={`text-[9px] font-black tabular-nums ${
                            reached
                              ? "text-brand-blue"
                              : "text-muted-foreground/40"
                          }`}
                        >
                          {Math.min(streak, target)}/{target}d
                        </span>
                      </div>
                      <div className="h-1 w-full bg-muted/40 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            reached
                              ? "bg-gradient-to-r from-brand-blue to-brand-purple"
                              : "bg-brand-blue/40"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">
                Submit daily to unlock higher multipliers!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
