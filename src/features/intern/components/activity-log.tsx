"use client";

import { Activity, Calendar } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

export function QuestLog() {
  const { data: timesheetHistory, isLoading: isTimesheetLoading } =
    useTimesheetHistory({ page: 1, perPage: 20 });
  const { data: weeklyReviews, isLoading: isWeeklyLoading } =
    useWeeklyReviewHistory({ page: 1, perPage: 20 });
  const { data: myTasks, isLoading: isTasksLoading } = useInternTasks({
    page: 1,
    perPage: 100,
  });

  const [selectedItem, setSelectedItem] = useState<UnifiedActivity | null>(
    null,
  );

  const isLoading = isTimesheetLoading || isWeeklyLoading || isTasksLoading;

  if (isLoading) {
    return (
      <Card className="h-full border-border/40 bg-card/40 backdrop-blur-md flex flex-col py-4 px-5">
        <CardHeader className="pt-0 px-0 pb-2 border-b border-border/20">
          <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-5 h-5 text-muted-foreground" />
            Activity Log
          </CardTitle>
          <CardDescription className="text-xs font-bold uppercase text-muted-foreground/60">
            Review activities
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
  const tasks = myTasks?.data || [];
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED");

  const recentActivities: UnifiedActivity[] = [
    ...timesheets.map(
      (ts): UnifiedActivity => ({
        id: ts.id,
        type: "timesheet",
        title: "Daily Timesheet",
        description: ts.description || "",
        dateStr: new Date(ts.created_at).toLocaleDateString(undefined, {
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
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : new Date(task.created_at).toLocaleDateString(undefined, {
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
  ]
    .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime())
    .slice(0, 6);

  return (
    <Card className="@container h-full border-border/40 bg-card/40 backdrop-blur-md flex flex-col py-4 px-5">
      <CardHeader className="pt-0 px-0 pb-2 border-b border-border/20">
        <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
          <Activity className="w-5 h-5 text-muted-foreground" />
          Activity Log
        </CardTitle>
        <CardDescription className="text-xs font-bold uppercase text-muted-foreground/60">
          Recent activites
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-3 px-0 pb-0 flex-1 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/10 border-b border-border/20 hover:bg-transparent">
              <TableHead className="font-black uppercase text-[9px] tracking-[0.2em] text-muted-foreground pl-4 py-2">
                Activity
              </TableHead>
              <TableHead className="font-black uppercase text-[9px] tracking-[0.2em] text-muted-foreground py-2 hidden @md:table-cell w-[140px]">
                Submitted
              </TableHead>
              <TableHead className="font-black uppercase text-[9px] tracking-[0.2em] text-muted-foreground pr-4 py-2 text-right w-[130px]">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentActivities.map((activity) => (
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
                <TableCell className="pl-4 py-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-brand-blue shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-foreground break-words">
                        {activity.title}
                      </span>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                        <span className="text-[9px] text-muted-foreground @md:hidden">
                          {activity.dateStr}
                        </span>
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
                <TableCell className="py-3 text-[11px] font-medium text-muted-foreground whitespace-nowrap hidden @md:table-cell w-[140px]">
                  {activity.dateStr}
                </TableCell>
                <TableCell className="pr-4 py-3 text-right w-[130px]">
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
            {recentActivities.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-8 text-xs font-bold text-muted-foreground uppercase tracking-wider italic"
                >
                  No recent activity
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <div className="pt-4 px-0 pb-0 border-t border-border/20">
        <Link href="/dashboard/intern/quest-log">
          <Button
            size="lg"
            variant="outline"
            className="w-full gap-2 text-xs tracking-widest shadow-lg"
          >
            View History
          </Button>
        </Link>
      </div>

      <ActivityDetailDialog
        selectedItem={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </Card>
  );
}
