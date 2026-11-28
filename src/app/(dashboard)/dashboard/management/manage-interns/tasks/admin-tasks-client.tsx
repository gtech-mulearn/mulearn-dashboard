"use client";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Edit,
  MessageSquareDot,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Pagination from "@/components/dashboard/table/pagination";
import Table from "@/components/dashboard/table/Table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import type { TInternTask, TUpdateTaskPayload } from "@/features/intern";
import {
  getComplexityColor,
  TeamBadge,
  TeamFilterSelect,
  useCreateTask,
  useDeleteTask,
  useManageInternsList,
  useManageTaskDetail,
  useManageTasks,
  useUpdateTask,
  useVerifyTask,
} from "@/features/intern";
import { useDebounce } from "@/hooks/use-debounce";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  AssignTaskDialog,
  type COMPLEXITY_OPTIONS,
  type TaskForm,
} from "./components/assign-task-dialog";
import { EditTaskDialog } from "./components/edit-task-dialog";
import {
  type ReviewForm,
  ReviewTaskDialog,
} from "./components/review-task-dialog";

// ── Helpers ───────────────────────────────────────────────────

// ── Blank form ────────────────────────────────────────────────
const blankForm: TaskForm = {
  title: "",
  description: "",
  category: "",
  complexity: "MEDIUM",
  assigned_to: "",
  assigneeName: "",
  assigneeMuid: "",
  team: "",
  deadline: "",
};

// ── Page Component ────────────────────────────────────────────
export function AdminTasksPageClient() {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 15;
  const [teamFilter, setTeamFilter] = useState("ALL");
  const [includeFormer, setIncludeFormer] = useState(false);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(
    undefined,
  );

  const handleSort = (column: string) => {
    if (sortBy === column) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else {
        setSortBy(undefined);
        setSortOrder(undefined);
      }
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setPage(1);
  };

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<TInternTask | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<TInternTask | null>(null);
  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    status: "",
    karma: "",
    remark: "",
  });

  const [reviewTaskId, setReviewTaskId] = useState<string | null>(null);
  const [initializedTaskId, setInitializedTaskId] = useState<string | null>(
    null,
  );
  const {
    data: taskDetail,
    isFetching: isFetchingDetail,
    error: fetchDetailError,
  } = useManageTaskDetail(reviewTaskId || "");

  useEffect(() => {
    if (taskDetail && reviewTaskId && initializedTaskId !== reviewTaskId) {
      setReviewForm({
        status: taskDetail.status,
        karma: taskDetail.karma_awarded ? String(taskDetail.karma_awarded) : "",
        remark: taskDetail.remark ?? "",
      });
      setInitializedTaskId(reviewTaskId);
    }
  }, [taskDetail, reviewTaskId, initializedTaskId]);

  useEffect(() => {
    if (fetchDetailError) {
      toast.error(
        getApiResponseError(fetchDetailError, {
          fallback: "Failed to fetch task details",
        }),
      );
      setReviewTarget(null);
      setReviewTaskId(null);
      setInitializedTaskId(null);
    }
  }, [fetchDetailError]);

  // Form state
  const [form, setForm] = useState({ ...blankForm });

  // Fetch onboarded interns for local search
  const { data: internsData, isLoading: isInternsLoading } =
    useManageInternsList({ page: 1, perPage: 1000 });
  const [assigneeQuery, setAssigneeQuery] = useState("");
  const [isAssigneeFocused, setIsAssigneeFocused] = useState(false);

  const internsList = useMemo(() => {
    return (internsData?.data ?? []).filter((item) => !item.is_lead);
  }, [internsData]);

  // Map to InternOption shape — use `user` (user UUID) as `id` for assigned_to
  const filteredAssignees = useMemo(() => {
    const q = assigneeQuery.trim().toLowerCase();
    const list = internsList.filter(
      (item) =>
        !q ||
        item.full_name.toLowerCase().includes(q) ||
        item.muid.toLowerCase().includes(q),
    );
    return list.map((item) => ({
      id: item.user, // user UUID — what the API expects for assigned_to
      full_name: item.full_name,
      muid: item.muid,
      team: item.team?.name,
    }));
  }, [internsList, assigneeQuery]);

  const debouncedSearch = useDebounce(searchText, 300);

  const { data: tasksData, isLoading } = useManageTasks({
    page,
    perPage,
    search: debouncedSearch || undefined,
    // Backend: search covers title/status/category/assignee; sorts by created_at/status.
    team_id: teamFilter === "ALL" ? undefined : teamFilter,
    include_former: includeFormer || undefined,
    sortBy,
    sortOrder,
  });

  // Category is free text now; suggest ones already used on this page.
  const categorySuggestions = useMemo(
    () =>
      [...new Set((tasksData?.data ?? []).map((t) => t.category))]
        .filter(Boolean)
        .sort(),
    [tasksData?.data],
  );

  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask(editTask?.id ?? "");
  const deleteMutation = useDeleteTask();
  const reviewMutation = useUpdateTask(reviewTarget?.id ?? "");
  const verifyMutation = useVerifyTask();

  const tasks = tasksData?.data ?? [];

  // Only `status` is a backend sort field among these columns.
  const columnOrder = useMemo(
    () => [
      {
        column: "title",
        Label: "Title",
        isSortable: false,
        width: "min-w-[150px]",
      },
      {
        column: "assigned_to_name",
        Label: "Assigned To",
        isSortable: false,
        width: "min-w-[200px]",
      },
      { column: "team", Label: "Team", isSortable: false, width: "w-28" },
      {
        column: "complexity",
        Label: "Complexity",
        isSortable: false,
        width: "w-28",
      },
      {
        column: "karma_awarded",
        Label: "Karma",
        isSortable: false,
        width: "w-20",
      },
      { column: "status", Label: "Status", isSortable: true, width: "w-40" },
      {
        column: "deadline",
        Label: "Deadline",
        isSortable: false,
        width: "w-32",
      },
    ],
    [],
  );

  const tableRows = useMemo(() => {
    return tasks.map((task) => ({
      ...task,
      full_name: task.title,
    })) as unknown as import("@/components/dashboard/table/Table").Data[];
  }, [tasks]);

  const customCellRender = useCallback(
    (
      column: string,
      row: import("@/components/dashboard/table/Table").Data,
    ) => {
      const task = row as unknown as TInternTask;
      switch (column) {
        case "title":
          return (
            <div className="flex flex-col">
              <span
                className="font-bold text-foreground uppercase tracking-tight text-sm truncate max-w-[150px]"
                title={task.title}
              >
                {task.title}
              </span>
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mt-1 line-clamp-1">
                {task.description}
              </span>
            </div>
          );
        case "assigned_to_name":
          return (
            <div className="flex flex-col">
              <span
                className="font-bold text-foreground uppercase tracking-tight text-sm truncate max-w-[200px]"
                title={task.assigned_to_name ?? task.assigned_to}
              >
                {task.assigned_to_name ?? task.assigned_to}
              </span>
              {task.assigned_to_muid && (
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mt-1">
                  {task.assigned_to_muid}
                </span>
              )}
            </div>
          );
        case "team":
          return <TeamBadge team={task.team} />;
        case "complexity":
          return (
            <div
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-bold uppercase tracking-wider ${getComplexityColor(task.complexity)}`}
            >
              {task.complexity}
            </div>
          );
        case "karma_awarded":
          return (
            <span className="text-xs font-bold text-foreground">
              {task.karma_awarded ?? 0}
            </span>
          );
        case "status":
          return (
            <div className="flex items-center gap-1.5">
              <div
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 gap-1.5 ${
                  task.status === "COMPLETED" && task.is_verified
                    ? "bg-success/10 border-success/30 text-success"
                    : task.status === "WAITING_FOR_REVIEW"
                      ? "bg-warning/10 border-warning/30 text-warning"
                      : task.status === "IN_PROGRESS"
                        ? "bg-brand-blue/10 border-brand-blue/30 text-brand-blue"
                        : "text-foreground border-border"
                }`}
              >
                {task.status.replace(/_/g, " ")}
              </div>
            </div>
          );
        case "deadline":
          return (
            <span className="text-xs font-bold text-foreground">
              {task.deadline
                ? new Date(task.deadline).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—"}
            </span>
          );
        default:
          return null;
      }
    },
    [],
  );

  // ── Open edit dialog with pre-filled values ───────────────
  const openEdit = useCallback((task: TInternTask) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description,
      category: task.category,
      complexity: task.complexity as (typeof COMPLEXITY_OPTIONS)[number],
      assigned_to: task.assigned_to,
      assigneeName: task.assigned_to_name ?? "",
      assigneeMuid: "",
      team: task.team?.name ?? "",
      deadline: task.deadline?.slice(0, 10) ?? "",
    });
  }, []);

  const customActionRender = useCallback(
    (row: import("@/components/dashboard/table/Table").Data) => {
      const task = row as unknown as TInternTask;
      return (
        <div className="flex items-center justify-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={async () => {
              setReviewForm({
                status: task.status,
                karma: task.karma_awarded ? String(task.karma_awarded) : "",
                remark: "",
              });
              setReviewTarget(task);
              setReviewTaskId(task.id);
            }}
            className="rounded-md text-muted-foreground hover:bg-muted hover:text-brand-blue size-8"
            title="Review Task"
          >
            <MessageSquareDot className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => openEdit(task)}
            className="rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Edit Task"
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => setDeleteTarget(task.id)}
            className="rounded-md text-muted-foreground hover:bg-muted hover:text-destructive"
            title="Delete Task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      );
    },
    [openEdit],
  );

  // ── Create task ───────────────────────────────────────────
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.title ||
      !form.description ||
      !form.category ||
      !form.assigned_to
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }
    createMutation.mutate(
      {
        title: form.title,
        description: form.description,
        category: form.category,
        complexity: form.complexity,
        assigned_to: form.assigned_to,
        deadline: form.deadline || undefined,
      },
      {
        onSuccess: () => {
          setCreateOpen(false);
          setForm({ ...blankForm });
          setAssigneeQuery("");
        },
      },
    );
  };

  // ── Update task ───────────────────────────────────────────
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTask) return;
    updateMutation.mutate(
      {
        title: form.title || undefined,
        description: form.description || undefined,
        category: form.category || undefined,
        complexity: form.complexity || undefined,
        deadline: form.deadline || undefined,
      },
      {
        onSuccess: () => {
          setEditTask(null);
          setForm({ ...blankForm });
        },
      },
    );
  };

  // ── Delete task ───────────────────────────────────────────
  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const handleVerifySubmit = () => {
    if (!reviewTarget) return;
    const payload: TUpdateTaskPayload = {
      // karma_awarded is set only by the verify endpoint.
      status: reviewForm.status || undefined,
      remark: reviewForm.remark || undefined,
    };
    reviewMutation.mutate(payload, {
      onSuccess: () => {
        setReviewTarget(null);
        setReviewTaskId(null);
        setInitializedTaskId(null);
      },
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase">
            Task Management
          </h2>
          <p className="text-muted-foreground mt-1 font-medium italic">
            Create, assign, and manage tasks for your intern cohort.
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => {
            setForm({ ...blankForm });
            setAssigneeQuery("");
            setCreateOpen(true);
          }}
          className="gap-2 text-xs tracking-widest shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Assign New Task
        </Button>
      </div>

      {/* Search bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-card/40 backdrop-blur-md border border-border/40 p-4 rounded-2xl shadow-md">
        <div className="relative w-full md:w-48 focus-within:md:w-80 transition-all duration-300 ease-in-out shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <Input
            placeholder="Search title, status, category, intern..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 h-10 bg-background/50 border-border/50 font-medium"
          />
        </div>
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <TeamFilterSelect
            value={teamFilter}
            onChange={(value) => {
              setTeamFilter(value);
              setPage(1);
            }}
            className="w-48 h-10 bg-background/50 border-border/50 font-bold text-xs uppercase"
          />
          <div className="flex items-center gap-2">
            <Checkbox
              id="tasks-include-former"
              checked={includeFormer}
              onCheckedChange={(c) => {
                setIncludeFormer(c === true);
                setPage(1);
              }}
            />
            <Label
              htmlFor="tasks-include-former"
              className="text-xs font-bold text-muted-foreground"
            >
              Include former
            </Label>
          </div>
        </div>
      </div>

      {/* Task table */}
      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Spinner className="w-8 h-8 text-primary" />
        </div>
      ) : (
        <Table
          rows={tableRows}
          isLoading={isLoading}
          page={page}
          perPage={perPage}
          columnOrder={columnOrder}
          id={["id"]}
          slNoCellClassName="font-black text-muted-foreground/40"
          customCellRender={customCellRender}
          customActionRender={customActionRender}
        >
          <thead>
            <tr>
              <th className="border-b border-border px-3.5 py-3 text-left text-sm font-bold uppercase tracking-wider w-16 bg-muted/20 h-12 font-black text-[9px] tracking-[0.3em]">
                Sl.no
              </th>
              {columnOrder.map((col) => (
                <th
                  key={col.column}
                  className={`border-b border-border px-3.5 py-3 text-left text-sm font-bold tracking-wider bg-muted/20 h-12 font-black uppercase text-[9px] tracking-[0.3em] ${
                    col.isSortable
                      ? "cursor-pointer select-none hover:bg-muted/10 transition-colors"
                      : ""
                  } ${col.width || ""}`}
                  onClick={() => col.isSortable && handleSort(col.column)}
                >
                  <div className="flex items-center gap-2">
                    <span>{col.Label}</span>
                    {col.isSortable && (
                      <span className="inline-flex shrink-0">
                        {sortBy === col.column ? (
                          sortOrder === "asc" ? (
                            <ArrowUp className="size-3 text-brand-blue font-bold" />
                          ) : (
                            <ArrowDown className="size-3 text-brand-blue font-bold" />
                          )
                        ) : (
                          <ArrowUpDown className="size-3 text-muted-foreground/40" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              <th className="border-b border-border px-3.5 py-3 text-center text-sm font-bold tracking-wider w-32 bg-muted/20 h-12 font-black uppercase text-[9px] tracking-[0.3em]">
                Action
              </th>
            </tr>
          </thead>
          <div>
            {tasksData?.pagination && tasksData.pagination.totalPages > 1 && (
              <div className="p-4 border-t border-border/20">
                <Pagination
                  currentPage={page}
                  totalPages={tasksData.pagination.totalPages}
                  perPage={perPage}
                  totalCount={tasksData.pagination.count}
                  handlePreviousClick={() => setPage((p) => Math.max(1, p - 1))}
                  handleNextClick={() =>
                    setPage((p) =>
                      Math.min(tasksData.pagination.totalPages, p + 1),
                    )
                  }
                />
              </div>
            )}
          </div>
          <div />
        </Table>
      )}

      {/* Dialogs */}
      <AssignTaskDialog
        open={createOpen}
        form={form}
        assigneeQuery={assigneeQuery}
        isAssigneeFocused={isAssigneeFocused}
        isInternsLoading={isInternsLoading}
        filteredAssignees={filteredAssignees}
        categorySuggestions={categorySuggestions}
        isPending={createMutation.isPending}
        onOpenChange={setCreateOpen}
        onFormChange={setForm}
        onAssigneeQueryChange={setAssigneeQuery}
        onAssigneeFocusChange={setIsAssigneeFocused}
        onAssigneeSelect={(user) => {
          setForm({
            ...form,
            assigned_to: user.id,
            assigneeName: user.full_name,
            assigneeMuid: user.muid,
            team: user.team || "",
          });
          setAssigneeQuery("");
          setIsAssigneeFocused(false);
        }}
        onClearAssignee={() => {
          setForm({
            ...form,
            assigned_to: "",
            assigneeName: "",
            assigneeMuid: "",
            team: "",
          });
        }}
        onSubmit={handleCreate}
      />

      <EditTaskDialog
        editTask={editTask}
        form={form}
        categorySuggestions={categorySuggestions}
        isPending={updateMutation.isPending}
        onClose={() => setEditTask(null)}
        onFormChange={setForm}
        onSubmit={handleUpdate}
      />

      <ReviewTaskDialog
        reviewTarget={taskDetail || reviewTarget}
        reviewForm={reviewForm}
        isFetchingDetail={
          isFetchingDetail && (!taskDetail || taskDetail.id !== reviewTaskId)
        }
        isReviewPending={reviewMutation.isPending}
        isVerifyPending={verifyMutation.isPending}
        deleteTarget={deleteTarget}
        isDeletePending={deleteMutation.isPending}
        onClose={() => {
          setReviewTarget(null);
          setReviewTaskId(null);
          setInitializedTaskId(null);
        }}
        onReviewFormChange={setReviewForm}
        onVerifySubmit={handleVerifySubmit}
        onVerifyAndAward={() => {
          if (!reviewTarget) return;
          verifyMutation.mutate(
            {
              id: reviewTarget.id,
              karma_awarded: reviewForm.karma ? Number(reviewForm.karma) : 0,
            },
            {
              onSuccess: () => {
                setReviewTarget(null);
                setReviewTaskId(null);
                setInitializedTaskId(null);
              },
            },
          );
        }}
        onDeleteClose={() => setDeleteTarget(null)}
        onDelete={handleDelete}
      />
    </div>
  );
}
