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
import {
  useInternTasks,
  useTimesheetHistory,
  useWeeklyReviewHistory,
} from "../hooks/use-intern";
import type { TInternTask } from "../types";
import { getTaskBaseKarma, getTaskKarma } from "../utils/intern-helpers";
import {
  ActivityDetailDialog,
  getActivityStatusBadge,
  type UnifiedActivity,
} from "./activity-detail-dialog";

export function QuestLogHistory() {
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

  const [selectedItem, setSelectedItem] = useState<UnifiedActivity | null>(
    null,
  );

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "timesheet" | "task">(
    "all",
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "COMPLETED"
  >("all");

  useEffect(() => {
    setPage(1);
  }, []);

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
        points: ts.score ?? null,
        karma: ts.karma_awarded ?? null,
        raw: ts,
      }),
    ),
    ...reviews.map(
      (wr): UnifiedActivity => ({
        id: wr.id,
        type: "weekly_timesheet",
        title: `Weekly Timesheet - Week ${wr.iso_week}`,
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
        points: wr.score ?? null,
        karma: wr.karma_awarded ?? null,
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
        points: getTaskKarma(task),
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
      (filterType === "timesheet" &&
        (activity.type === "timesheet" ||
          activity.type === "weekly_timesheet")) ||
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
              onValueChange={(val) =>
                setFilterType(val as "all" | "timesheet" | "task")
              }
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
                <SelectItem value="task" className="uppercase text-[9px]">
                  Tasks
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-44">
            <Select
              value={filterStatus}
              onValueChange={(val) =>
                setFilterStatus(
                  val as
                    | "all"
                    | "PENDING"
                    | "APPROVED"
                    | "REJECTED"
                    | "CANCELLED"
                    | "COMPLETED",
                )
              }
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
                          {activity.type === "completed_task" ? (
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center rounded bg-brand-purple/10 px-1 py-0.2 text-[8px] font-black uppercase text-brand-purple">
                                +{activity.points ?? 0} Pts
                              </span>
                              <span className="inline-flex items-center rounded bg-success/10 px-1 py-0.2 text-[8px] font-black uppercase text-success">
                                +{activity.karma ?? 0} Karma
                              </span>
                            </div>
                          ) : activity.status === "APPROVED" ? (
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center rounded bg-brand-purple/10 px-1 py-0.2 text-[8px] font-black uppercase text-brand-purple">
                                +{activity.points ?? 0} Pts
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center rounded bg-muted/40 px-1 py-0.2 text-[8px] font-black uppercase text-muted-foreground">
                                {activity.type === "timesheet" ? 25 : 50} Pts
                                (Est.)
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
              size="default"
              className="rounded-full text-xs font-black uppercase tracking-wider"
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
        weeklyReviewQueryKey={["intern", "reviews"]}
      />
    </div>
  );
}
