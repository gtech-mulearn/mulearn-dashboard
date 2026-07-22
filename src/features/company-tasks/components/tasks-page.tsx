"use client";

import { Edit2, MoreVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { StateDisplay } from "@/components/ui/state-display";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCompanyTasks,
  useDeleteCompanyTask,
} from "../hooks/use-company-tasks";
import type { CompanyTask } from "../types/tasks.types";
import { CreateTaskModal } from "./create-task-modal";
import { TaskDetailModal } from "./task-detail-modal";

export function CompanyTasksPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<CompanyTask | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const { mutate: deleteTask, isPending: isDeleting } = useDeleteCompanyTask();

  // Queries for tab counts (using per_page: 1 to get exact backend pagination count)
  const { data: allCountData } = useCompanyTasks({
    page: 1,
    per_page: 1,
  });
  const { data: approvedCountData } = useCompanyTasks({
    approval_status: "approved",
    page: 1,
    per_page: 1,
  });
  const { data: pendingCountData } = useCompanyTasks({
    approval_status: "pending",
    page: 1,
    per_page: 1,
  });
  const { data: rejectedCountData } = useCompanyTasks({
    approval_status: "rejected",
    page: 1,
    per_page: 1,
  });

  // Active query for currently selected status tab & page
  const {
    data: displayData,
    isLoading,
    error,
  } = useCompanyTasks({
    approval_status:
      statusFilter === "all"
        ? undefined
        : (statusFilter as "approved" | "pending" | "rejected"),
    page: page,
    per_page: 10,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-destructive bg-destructive/10 text-destructive">
        Failed to load tasks.
      </div>
    );
  }

  // biome-ignore lint/suspicious/noExplicitAny: API helper
  const getTasksArray = (res: any): CompanyTask[] => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    return res.data || res.results || [];
  };

  const tasks = getTasksArray(displayData);
  const pagination = displayData?.pagination;

  const normalizeStatus = (
    status?: string,
  ): "pending" | "approved" | "rejected" => {
    if (!status) return "pending";
    const lower = status.toLowerCase();
    if (lower === "approved") return "approved";
    if (lower === "rejected") return "rejected";
    return "pending";
  };

  // Tab counts directly from backend pagination.count
  const allCount = allCountData?.pagination?.count ?? 0;
  const approvedCount = approvedCountData?.pagination?.count ?? 0;
  const pendingCount = pendingCountData?.pagination?.count ?? 0;
  const rejectedCount = rejectedCountData?.pagination?.count ?? 0;

  const currentTabCount =
    statusFilter === "all"
      ? allCount
      : statusFilter === "approved"
        ? approvedCount
        : statusFilter === "pending"
          ? pendingCount
          : rejectedCount;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Company Tasks
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your community tasks and track admin approval.
          </p>
        </div>
        <Button
          className="shrink-0 gap-2"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
      </div>

      <Tabs
        defaultValue="all"
        value={statusFilter}
        onValueChange={(val) => {
          setStatusFilter(val);
          setPage(1);
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 lg:w-[480px]">
          <TabsTrigger value="all">All Tasks ({allCount})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
        </TabsList>
      </Tabs>

      {tasks.length === 0 || currentTabCount === 0 ? (
        statusFilter === "all" ? (
          <StateDisplay
            variant="no-tasks"
            className="rounded-2xl border border-dashed"
            title="No company tasks created yet"
            description="You haven't submitted any community tasks yet. Use the 'Create Task' button above to submit a task for admin review."
          />
        ) : (
          <StateDisplay
            variant="no-results"
            size="sm"
            className="rounded-2xl border border-dashed"
            description={`No ${statusFilter} tasks right now. Try a different path and keep exploring.`}
          />
        )
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tasks.map((task: CompanyTask) => (
              <Card key={task.id} className="flex flex-col h-full">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <CardTitle
                        className="text-base line-clamp-1"
                        title={task.title}
                      >
                        {task.title}
                      </CardTitle>
                      <CardDescription className="text-xs font-medium text-primary">
                        {task.hashtag}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={
                          normalizeStatus(task.approval_status) === "approved"
                            ? "default"
                            : normalizeStatus(task.approval_status) ===
                                "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                        className="capitalize"
                      >
                        {task.approval_status.toLowerCase()}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-8 w-8 p-0 shrink-0"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setTaskToEdit(task);
                              setIsCreateModalOpen(true);
                            }}
                          >
                            <Edit2 className="mr-2 h-4 w-4" />
                            <span>Edit Task</span>
                          </DropdownMenuItem>
                          {normalizeStatus(task.approval_status) ===
                            "pending" && (
                            <DropdownMenuItem
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "Are you sure you want to delete this task?",
                                  )
                                ) {
                                  deleteTask(task.id);
                                }
                              }}
                              disabled={isDeleting}
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete Task</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {task.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-auto pt-4 border-t border-border/50">
                    <Badge variant="outline" className="text-xs">
                      Karma: {task.karma}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {task.type}
                    </Badge>
                    {task.active && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-green-500/10 text-green-600 border-green-500/20"
                      >
                        Active
                      </Badge>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      className="ml-auto h-7 text-xs"
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 text-xs"
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page} of {pagination.total_pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= pagination.total_pages || !pagination.next}
                className="h-8 text-xs"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <CreateTaskModal
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
      />
      <TaskDetailModal
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  );
}
