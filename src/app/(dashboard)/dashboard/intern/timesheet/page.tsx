"use client";
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Flame,
  Gem,
  Loader2,
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
import { Textarea } from "@/components/ui/textarea";
import {
  useInternOverview,
  useInternTasks,
  useSubmitTimesheet,
  useTimesheetHistory,
  useTimesheetToday,
} from "@/features/intern";

export default function TimesheetPage() {
  const submitTimesheetMutation = useSubmitTimesheet();
  const { data: todayTimesheet, isLoading: isTodayLoading } =
    useTimesheetToday();
  const { data: timesheetHistory, isLoading: isHistoryLoading } =
    useTimesheetHistory({ page: 1, perPage: 50 });
  const { data: overview } = useInternOverview();
  const { data: tasksData } = useInternTasks({ page: 1, perPage: 100 });

  const [category, setCategory] = useState<string>("");
  const [hours, setHours] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [blockers, setBlockers] = useState<string>("");
  const [linkedTaskId, setLinkedTaskId] = useState<string>("");
  const [taskStatus, setTaskStatus] = useState<string>("COMPLETED");

  const isSubmitting = submitTimesheetMutation.isPending;

  // Generate calendar days based on actual history
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const isToday = i === 13;
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    // Find timesheet entry for this date (YYYY-MM-DD)
    const dateStr = d.toISOString().split("T")[0];
    const entry = timesheetHistory?.data?.find(
      (ts) => ts.entry_date === dateStr,
    );

    let status = "missing";
    if (entry) {
      if (entry.status === "APPROVED") status = "submitted";
      else if (entry.status === "PENDING") status = "pending";
      else if (entry.status === "REJECTED") status = "missing";
    } else {
      if (isWeekend) status = "exempt";
      else if (isToday) status = "pending";
    }

    return {
      date: d,
      status,
      isToday,
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !hours || !description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const dateStr = new Date().toISOString().split("T")[0];

    submitTimesheetMutation.mutate(
      {
        entry_date: dateStr,
        category,
        hours,
        description,
        blockers: blockers || "None",
        task:
          linkedTaskId && linkedTaskId !== "none" ? linkedTaskId : undefined,
        task_status:
          linkedTaskId && linkedTaskId !== "none" ? taskStatus : undefined,
      },
      {
        onSuccess: () => {
          setCategory("");
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

  if (isTodayLoading || isHistoryLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasSubmittedToday = !!todayTimesheet;

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto w-full bg-background/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-warning/10 text-warning border-warning/20 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">
              Daily Quest
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
            <span className="text-2xl font-black text-warning">
              {multiplier} XP
            </span>
          </div>
          <div className="w-[1px] h-10 bg-border/40" />
          <div className="flex items-center gap-2">
            <Flame className="w-8 h-8 text-warning fill-warning animate-pulse" />
            <div className="flex flex-col">
              <span className="text-2xl font-black tabular-nums">{streak}</span>
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                Day Streak
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Calendar View */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-border/40 bg-card/30 backdrop-blur-md shadow-xl overflow-hidden">
            <CardHeader className="pb-4 border-b border-border/20">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-blue" />
                Quest History
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase mb-4 text-muted-foreground tracking-widest">
                <div>Su</div>
                <div>Mo</div>
                <div>Tu</div>
                <div>We</div>
                <div>Th</div>
                <div>Fr</div>
                <div>Sa</div>
              </div>
              <div className="grid grid-cols-7 gap-2.5">
                {Array.from({ length: days[0].date.getDay() }).map((_, i) => (
                  <div key={String(i)} className="aspect-square opacity-0" />
                ))}
                {days.map((day, i) => {
                  let styles =
                    "bg-muted/30 text-muted-foreground/50 border-transparent";
                  if (day.status === "submitted")
                    styles =
                      "bg-success/20 text-success border-success/30 shadow-[0_0_10px_rgba(76,175,80,0.1)]";
                  if (day.status === "missing")
                    styles =
                      "bg-destructive/10 text-destructive border-destructive/20";
                  if (day.status === "pending" || day.isToday)
                    styles =
                      "bg-warning/20 text-warning border-warning/50 ring-2 ring-warning/20 animate-pulse";
                  if (day.status === "exempt")
                    styles = "bg-muted/10 text-muted-foreground/30";

                  return (
                    <div
                      key={String(i)}
                      className={`aspect-square flex items-center justify-center rounded-lg text-xs font-black border transition-all hover:scale-110 cursor-help ${styles}`}
                      title={`${day.date.toLocaleDateString()} - ${day.status}`}
                    >
                      {day.date.getDate()}
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full bg-success/40 border border-success" />{" "}
                  Submitted
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive/40 border border-destructive" />{" "}
                  Missed
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full bg-warning/40 border-2 border-warning" />{" "}
                  Today
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-gradient-to-br from-warning/10 to-destructive/10 backdrop-blur-md shadow-xl border-t-warning/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-warning" />
                Streak Bonus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black tracking-tighter tabular-nums mb-1">
                {streak} DAYS
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight">
                Submit daily to unlock streak multipliers!
              </p>
              <div className="mt-4 h-2 w-full bg-muted/40 rounded-full overflow-hidden p-[1px]">
                <div
                  className="h-full bg-gradient-to-r from-warning to-destructive rounded-full"
                  style={{ width: `${Math.min(100, (streak / 30) * 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Form */}
        <div className="md:col-span-2">
          {hasSubmittedToday ? (
            <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-2xl relative overflow-hidden p-8">
              <Alert className="bg-success/10 text-success border-success/20 py-8 rounded-2xl flex items-start gap-4">
                <CheckCircle2 className="h-8 w-8 text-success mt-1" />
                <div className="space-y-2">
                  <AlertTitle className="text-2xl font-black uppercase tracking-tight">
                    Chronicle Sealed
                  </AlertTitle>
                  <AlertDescription className="font-bold opacity-80 text-sm">
                    Awesome job! You have already submitted your daily quest
                    timesheet for today. Keep up the consistency and maintain
                    your streak tomorrow!
                  </AlertDescription>
                </div>
              </Alert>
            </Card>
          ) : (
            <form onSubmit={handleSubmit}>
              <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-2xl relative overflow-hidden group h-full">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                  <Zap className="w-32 h-32 text-primary" />
                </div>
                <CardHeader className="border-b border-border/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-black uppercase tracking-tighter">
                        Submit Progress
                      </CardTitle>
                      <CardDescription className="font-bold text-muted-foreground/60 uppercase text-[10px] tracking-[0.1em]">
                        Detail your heroic deeds for today
                      </CardDescription>
                    </div>
                    <Badge className="bg-brand-blue/10 text-brand-blue border-brand-blue/30 px-4 py-1.5 rounded-xl font-black text-xs">
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
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        Quest Category
                      </Label>
                      <Select
                        required
                        onValueChange={setCategory}
                        value={category}
                      >
                        <SelectTrigger className="w-full bg-background/50 border-border/50 h-12 font-bold focus:ring-brand-blue/30">
                          <SelectValue placeholder="Choose your discipline..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value="DEVELOPMENT"
                            className="font-bold uppercase text-xs"
                          >
                            Development / Coding
                          </SelectItem>
                          <SelectItem
                            value="DESIGN"
                            className="font-bold uppercase text-xs"
                          >
                            UI/UX Arts / Design
                          </SelectItem>
                          <SelectItem
                            value="TESTING"
                            className="font-bold uppercase text-xs"
                          >
                            QA / Testing
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

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
                          className="bg-background/50 border-border/50 h-12 font-bold pl-4 focus:ring-brand-blue/30"
                          min="1"
                          max="24"
                          step="0.25"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-muted-foreground/40">
                          HRS
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Task Linker Section */}
                  {activeTasks.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                          Link Active Task
                        </Label>
                        <Select
                          onValueChange={setLinkedTaskId}
                          value={linkedTaskId}
                        >
                          <SelectTrigger className="w-full bg-background/50 border-border/50 h-12 font-bold focus:ring-brand-blue/30">
                            <SelectValue placeholder="Link an assigned task..." />
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

                      {linkedTaskId && linkedTaskId !== "none" && (
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                            Update Task Status
                          </Label>
                          <Select
                            onValueChange={setTaskStatus}
                            value={taskStatus}
                          >
                            <SelectTrigger className="w-full bg-background/50 border-border/50 h-12 font-bold focus:ring-brand-blue/30">
                              <SelectValue placeholder="Update status..." />
                            </SelectTrigger>
                            <SelectContent>
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
                      )}
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

                  <div className="pt-6">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-14 bg-gradient-to-r from-brand-blue to-brand-purple hover:scale-[1.02] transition-transform font-black uppercase tracking-[0.25em] text-sm shadow-[0_10px_20px_rgba(46,133,254,0.3)] rounded-2xl"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-3 h-5 w-5 animate-spin" />
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
      </div>
    </div>
  );
}
