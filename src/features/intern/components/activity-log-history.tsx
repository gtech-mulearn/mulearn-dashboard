"use client";

import { Calendar, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useDebounce } from "@/hooks/use-debounce";
import {
  useInternTasks,
  useMonthlyReviewHistory,
  useTimesheetHistory,
} from "../hooks/use-intern";
import type { TInternTask } from "../types";
import { getTaskBaseKarma } from "../utils/intern-helpers";
import {
  ActivityDetailDialog,
  getActivityStatusBadge,
  monthlyReviewToActivity,
  timesheetToActivity,
  type UnifiedActivity,
} from "./activity-detail-dialog";

const LONG_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

type TFilterType = "all" | "timesheet" | "review" | "task";
type TFilterStatus =
  | "all"
  | "SUBMITTED"
  | "MISSING"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED";

const TIMESHEET_STATUSES = [
  { value: "SUBMITTED", label: "Submitted" },
  { value: "MISSING", label: "Missing" },
] as const;
const REVIEW_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
] as const;
const TASK_STATUSES = [{ value: "COMPLETED", label: "Completed" }] as const;

/** Status filter options per type (timesheet mode filters server-side). */
const STATUS_OPTIONS: Record<
  TFilterType,
  ReadonlyArray<{ value: Exclude<TFilterStatus, "all">; label: string }>
> = {
  all: [...TIMESHEET_STATUSES, ...REVIEW_STATUSES, ...TASK_STATUSES],
  timesheet: TIMESHEET_STATUSES,
  review: REVIEW_STATUSES,
  task: TASK_STATUSES,
};

export function QuestLogHistory() {
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [selectedItem, setSelectedItem] = useState<UnifiedActivity | null>(
    null,
  );

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery.trim(), 400);
  const [filterType, setFilterType] = useState<TFilterType>("all");
  const [filterStatus, setFilterStatus] = useState<TFilterStatus>("all");

  // "Timesheets" filter pages through the intern's full history on the
  // server, so entries older than the latest 100 stay reachable.
  const isTimesheetMode = filterType === "timesheet";

  const { data: timesheetHistory, isLoading: isTimesheetLoading } =
    useTimesheetHistory(
      { page: 1, perPage: 100 },
      { enabled: !isTimesheetMode },
    );
  const {
    data: pagedTimesheets,
    isLoading: isPagedLoading,
    isFetching: isPagedFetching,
  } = useTimesheetHistory(
    {
      page,
      perPage,
      search: debouncedSearch || undefined,
      sortBy: "-entry_date",
    },
    { enabled: isTimesheetMode },
  );
  const { data: monthlyReviews, isLoading: isMonthlyLoading } =
    useMonthlyReviewHistory({ page: 1, perPage: 100 });
  const { data: myTasks, isLoading: isTasksLoading } = useInternTasks({
    page: 1,
    perPage: 100,
  });

  // Reset to the first page whenever the view or query changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset on filter/search change only
  useEffect(() => {
    setPage(1);
  }, [filterType, filterStatus, debouncedSearch]);

  const isLoading = isTimesheetMode
    ? isPagedLoading
    : isTimesheetLoading || isMonthlyLoading || isTasksLoading;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  const timesheets = timesheetHistory?.data || [];
  const reviews = monthlyReviews?.data || [];
  const tasks = myTasks?.data || [];
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED");

  const allActivities: UnifiedActivity[] = [
    ...timesheets.map((ts) => timesheetToActivity(ts, LONG_DATE_FORMAT)),
    ...reviews.map((mr) => monthlyReviewToActivity(mr, LONG_DATE_FORMAT)),
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
        karma: getTaskBaseKarma(task),
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
      (filterType === "review" && activity.type === "monthly_review") ||
      (filterType === "task" && activity.type === "completed_task");

    const matchesStatus =
      filterStatus === "all" || activity.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const serverActivities = (pagedTimesheets?.data ?? []).map((ts) =>
    timesheetToActivity(ts, LONG_DATE_FORMAT),
  );

  const totalPages = isTimesheetMode
    ? pagedTimesheets?.pagination.totalPages || 1
    : Math.ceil(filteredActivities.length / perPage) || 1;
  const paginatedActivities = isTimesheetMode
    ? serverActivities
    : filteredActivities.slice((page - 1) * perPage, page * perPage);
  const hasAnyActivity = isTimesheetMode
    ? (pagedTimesheets?.pagination.count ?? 0) > 0 || !!debouncedSearch
    : allActivities.length > 0;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full bg-background/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="default"
              className="px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest"
            >
              Activity Log
            </Badge>
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase">
            Activity Log
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
            placeholder={
              isTimesheetMode
                ? "Search by date (YYYY-MM-DD) or status..."
                : "Search by quest or description..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/40 border-border/40 focus-visible:ring-brand-blue"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-44">
            <Select
              value={filterType}
              onValueChange={(val) => {
                setFilterType(val as TFilterType);
                setFilterStatus("all");
              }}
            >
              <SelectTrigger className="w-full bg-background/40 border-border/40 font-bold uppercase text-[10px] tracking-wider">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="bg-card font-bold border-border/60"
              >
                <SelectItem value="all" className="uppercase text-[9px]">
                  All Types
                </SelectItem>
                <SelectItem value="timesheet" className="uppercase text-[9px]">
                  Timesheets
                </SelectItem>
                <SelectItem value="review" className="uppercase text-[9px]">
                  Monthly Reviews
                </SelectItem>
                <SelectItem value="task" className="uppercase text-[9px]">
                  Tasks
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isTimesheetMode && (
            <div className="w-full sm:w-44">
              <Select
                value={filterStatus}
                onValueChange={(val) => setFilterStatus(val as TFilterStatus)}
              >
                <SelectTrigger className="w-full bg-background/40 border-border/40 font-bold uppercase text-[10px] tracking-wider">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className="bg-card font-bold border-border/60"
                >
                  <SelectItem value="all" className="uppercase text-[9px]">
                    All Statuses
                  </SelectItem>
                  {STATUS_OPTIONS[filterType].map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="uppercase text-[9px]"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {filterType === "all" && (
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
          Showing recent activity. Filter by Timesheets to browse your full
          timesheet history.
        </p>
      )}

      <div className="space-y-4">
        <Card className="border-border/40 bg-card/40 backdrop-blur-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/10 border-b border-border/20 hover:bg-transparent">
                <TableHead className="font-black uppercase text-[9px] tracking-[0.2em] text-muted-foreground pl-6 py-3">
                  Activity
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
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-foreground">
                          {activity.title}
                        </span>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                          {activity.type === "completed_task" && (
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center rounded bg-success/10 px-1 py-0.2 text-[8px] font-black uppercase text-success">
                                +{activity.karma ?? 0} Karma
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
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
                      {getActivityStatusBadge(
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
              {paginatedActivities.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-12 text-sm font-bold text-muted-foreground uppercase tracking-wider italic"
                  >
                    {hasAnyActivity
                      ? "No matching quests found."
                      : "No quests logged yet."}
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
              size="default"
              className="rounded-full text-xs font-black uppercase tracking-wider"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </Button>
            <span className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              Page {page} of {totalPages}
              {isTimesheetMode && isPagedFetching && (
                <Spinner className="w-3 h-3" />
              )}
            </span>
            <Button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              variant="outline"
              size="default"
              className="rounded-full text-xs font-black uppercase tracking-wider"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      <ActivityDetailDialog
        selectedItem={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
