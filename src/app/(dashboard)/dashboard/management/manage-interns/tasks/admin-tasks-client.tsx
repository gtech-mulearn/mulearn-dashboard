"use client";

import {
  CheckCircle2,
  Edit,
  ExternalLink,
  MessageSquareDot,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import Pagination from "@/components/dashboard/table/pagination";
import Table from "@/components/dashboard/table/Table";
import THead from "@/components/dashboard/table/Thead";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  manageInternsApi,
  useCreateTask,
  useDeleteTask,
  useGuilds,
  useManageInternsList,
  useManageTasks,
  useTaskCategories,
  useUpdateTask,
  useVerifyTask,
} from "@/features/intern";
import type { TInternTask, TUpdateTaskPayload } from "@/features/intern/types";
import { getTaskGuild } from "@/features/intern/utils/intern-helpers";
import { useDebounce } from "@/hooks/use-debounce";

// ── Helpers ───────────────────────────────────────────────────

const COMPLEXITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
const _STATUS_OPTIONS = [
  "WAITING_FOR_REVIEW",
  "IN_PROGRESS",
  "COMPLETED",
  "ON_HOLD",
] as const;

const complexityColor = (c: string) => {
  switch (c) {
    case "LOW":
      return "border-success/30 bg-success/5 text-success";
    case "MEDIUM":
      return "border-brand-blue/30 bg-brand-blue/5 text-brand-blue";
    case "HIGH":
      return "border-warning/30 bg-warning/5 text-warning";
    case "CRITICAL":
      return "border-destructive/30 bg-destructive/5 text-destructive";
    default:
      return "border-border/30 bg-muted/20 text-muted-foreground";
  }
};

// ── Blank form ────────────────────────────────────────────────
const blankForm = {
  title: "",
  description: "",
  category: "",
  complexity: "MEDIUM" as (typeof COMPLEXITY_OPTIONS)[number],
  karma: "",
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
  const [guildFilter, setGuildFilter] = useState("ALL");
  const [complexityFilter, setComplexityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<TInternTask | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<TInternTask | null>(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [reviewForm, setReviewForm] = useState<{
    status: string;
    karma: string;
    remark: string;
  }>({
    status: "",
    karma: "",
    remark: "",
  });

  // Form state
  const [form, setForm] = useState({ ...blankForm });

  // Fetch onboarded interns for local search
  const { data: internsData, isLoading: isInternsLoading } =
    useManageInternsList({ page: 1, perPage: 1000 });
  const [assigneeQuery, setAssigneeQuery] = useState("");
  const [isAssigneeFocused, setIsAssigneeFocused] = useState(false);

  const internsList = useMemo(() => {
    return (internsData?.data ?? []).filter(
      (item) => item.role?.toLowerCase() === "intern",
    );
  }, [internsData]);

  const filteredAssignees = useMemo(() => {
    const q = assigneeQuery.trim().toLowerCase();
    if (!q) return internsList;
    return internsList.filter(
      (item) =>
        item.full_name.toLowerCase().includes(q) ||
        item.muid.toLowerCase().includes(q),
    );
  }, [internsList, assigneeQuery]);

  const debouncedSearch = useDebounce(searchText, 300);

  const { data: tasksData, isLoading } = useManageTasks({
    page,
    perPage,
    search: debouncedSearch || undefined,
    guild: guildFilter === "ALL" ? undefined : guildFilter,
    complexity: complexityFilter === "ALL" ? undefined : complexityFilter,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    category: categoryFilter === "ALL" ? undefined : categoryFilter,
  });

  const { data: guilds = [] } = useGuilds();
  const DEFAULT_TEAMS = [
    "DEVELOPMENT",
    "DESIGN",
    "TESTING",
    "QA",
    "PM",
    "BACKEND",
    "FRONTEND",
  ];
  const teams = guilds.length > 0 ? guilds : DEFAULT_TEAMS;

  const { data: taskCategories = {} } = useTaskCategories();
  const [selectedUserGuild, setSelectedUserGuild] = useState<string | null>(
    null,
  );

  // Categories list for the table filter dropdown based on selected guild
  const tableFilterCategories = useMemo(() => {
    if (!guildFilter || guildFilter === "ALL") {
      const set = new Set<string>();
      Object.values(taskCategories || {}).forEach((cats) => {
        if (Array.isArray(cats)) {
          cats.forEach((cat) => {
            set.add(cat);
          });
        }
      });
      return Array.from(set).sort();
    }
    // Search case-insensitively for the selected guild's categories
    const key = Object.keys(taskCategories || {}).find(
      (k) => k.toUpperCase() === guildFilter.toUpperCase(),
    );
    return key ? (taskCategories[key] || []).slice().sort() : [];
  }, [taskCategories, guildFilter]);

  // Categories for the Create Task form based on the selected user's guild
  const createFormCategories = useMemo(() => {
    if (selectedUserGuild) {
      const key = Object.keys(taskCategories || {}).find(
        (k) => k.toUpperCase() === selectedUserGuild.toUpperCase(),
      );
      if (key && taskCategories[key]) {
        return taskCategories[key].slice().sort();
      }
    }
    return [];
  }, [taskCategories, selectedUserGuild]);

  // Categories for the Edit Task form based on the task's guild
  const editFormCategories = useMemo(() => {
    if (editTask) {
      const taskGuild = getTaskGuild(editTask);
      const key = Object.keys(taskCategories || {}).find(
        (k) => k.toUpperCase() === taskGuild.toUpperCase(),
      );
      if (key && taskCategories[key]) {
        return taskCategories[key].slice().sort();
      }
    }
    return [];
  }, [taskCategories, editTask]);

  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask(editTask?.id ?? "");
  const deleteMutation = useDeleteTask();
  const reviewMutation = useUpdateTask(reviewTarget?.id ?? "");
  const verifyMutation = useVerifyTask();

  const tasks = useMemo(() => {
    let list = tasksData?.data ?? [];
    if (statusFilter !== "ALL") {
      list = list.filter((task) => task.status === statusFilter);
    }
    if (guildFilter !== "ALL") {
      list = list.filter((task) => {
        const guild = getTaskGuild(task);
        return (
          guild.toUpperCase().includes(guildFilter.toUpperCase()) ||
          guildFilter.toUpperCase().includes(guild.toUpperCase())
        );
      });
    }
    if (complexityFilter !== "ALL") {
      list = list.filter((task) => task.complexity === complexityFilter);
    }
    if (categoryFilter !== "ALL") {
      list = list.filter((task) => task.category === categoryFilter);
    }
    return list;
  }, [
    tasksData?.data,
    statusFilter,
    guildFilter,
    complexityFilter,
    categoryFilter,
  ]);

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
      { column: "guild", Label: "Guild", isSortable: false, width: "w-36" },
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
      { column: "status", Label: "Status", isSortable: false, width: "w-40" },
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
      full_name: task.title, // Map to full_name for mobile card header
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
        case "guild":
          return (
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground font-bold uppercase tracking-wider">
              {getTaskGuild(task).replace(/_/g, " ")}
            </div>
          );
        case "complexity":
          return (
            <div
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-bold uppercase tracking-wider ${complexityColor(task.complexity)}`}
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
    const taskGuild = getTaskGuild(task);
    setSelectedUserGuild(task.team || taskGuild || null);
    setForm({
      title: task.title,
      description: task.description,
      category: task.category,
      complexity: task.complexity as (typeof COMPLEXITY_OPTIONS)[number],
      karma:
        task.karma_awarded !== undefined && task.karma_awarded !== null
          ? String(task.karma_awarded)
          : "",
      assigned_to: task.assigned_to,
      assigneeName: task.assigned_to_name ?? "",
      assigneeMuid: "",
      team: task.team ?? "",
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
              setIsFetchingDetail(true);
              setReviewTarget(task);
              try {
                const detail = await manageInternsApi.getTaskDetail(task.id);
                setReviewTarget(detail);
                setReviewForm((prev) => ({
                  ...prev,
                  status: detail.status,
                  karma: detail.karma_awarded
                    ? String(detail.karma_awarded)
                    : prev.karma,
                  remark: detail.remark ?? "",
                }));
              } catch (error) {
                console.error("Failed to fetch task detail", error);
              } finally {
                setIsFetchingDetail(false);
              }
            }}
            className="rounded-md text-muted-foreground hover:bg-muted hover:text-brand-blue size-8"
            title="Review Task"
          >
            <MessageSquareDot className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => openEdit(task)}
            className="rounded-md text-muted-foreground hover:bg-muted hover:text-foreground size-8"
            title="Edit Task"
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setDeleteTarget(task.id)}
            className="rounded-md text-muted-foreground hover:bg-muted hover:text-destructive size-8"
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
        karma_awarded: form.karma ? Number(form.karma) : undefined,
        assigned_to: form.assigned_to,
        team: form.team || undefined,
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
        karma_awarded: form.karma ? Number(form.karma) : undefined,
        team: form.team || undefined,
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
      status: reviewForm.status || undefined,
      karma_awarded: reviewForm.karma ? Number(reviewForm.karma) : undefined,
      remark: reviewForm.remark || undefined,
    };
    reviewMutation.mutate(payload, {
      onSuccess: () => {
        setReviewTarget(null);
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
          onClick={() => {
            setForm({ ...blankForm });
            setAssigneeQuery("");
            setSelectedUserGuild(null);
            setCreateOpen(true);
          }}
          className="gap-2 text-[10px] tracking-widest h-10 shadow-lg bg-brand-blue hover:bg-brand-blue/90"
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
            placeholder="Search tasks by title..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 h-10 bg-background/50 border-border/50 font-medium"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
          <Select
            value={guildFilter}
            onValueChange={(value) => {
              setGuildFilter(value);
              setCategoryFilter("ALL"); // Reset category filter when guild changes
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full h-10 bg-background/50 border-border/50 font-bold text-xs uppercase">
              <SelectValue placeholder="Filter by Guild" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              className="bg-card font-bold border-border/60"
            >
              <SelectItem value="ALL" className="font-bold text-xs uppercase">
                All Guilds
              </SelectItem>
              {teams.map((team) => (
                <SelectItem
                  key={team}
                  value={team}
                  className="font-bold text-xs uppercase"
                >
                  {team.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={complexityFilter}
            onValueChange={(value) => {
              setComplexityFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full h-10 bg-background/50 border-border/50 font-bold text-xs uppercase">
              <SelectValue placeholder="Filter by Complexity" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              className="bg-card font-bold border-border/60"
            >
              <SelectItem value="ALL" className="font-bold text-xs uppercase">
                All Complexities
              </SelectItem>
              {COMPLEXITY_OPTIONS.map((complexity) => (
                <SelectItem
                  key={complexity}
                  value={complexity}
                  className="font-bold text-xs uppercase"
                >
                  {complexity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full h-10 bg-background/50 border-border/50 font-bold text-xs uppercase">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              className="bg-card font-bold border-border/60"
            >
              <SelectItem value="ALL" className="font-bold text-xs uppercase">
                All Statuses
              </SelectItem>
              {_STATUS_OPTIONS.map((status) => (
                <SelectItem
                  key={status}
                  value={status}
                  className="font-bold text-xs uppercase"
                >
                  {status.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={categoryFilter}
            onValueChange={(value) => {
              setCategoryFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full h-10 bg-background/50 border-border/50 font-bold text-xs uppercase">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              className="bg-card font-bold border-border/60"
            >
              <SelectItem value="ALL" className="font-bold text-xs uppercase">
                All Categories
              </SelectItem>
              {tableFilterCategories.map((category) => (
                <SelectItem
                  key={category}
                  value={category}
                  className="font-bold text-xs uppercase"
                >
                  {category.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <THead
            columnOrder={columnOrder}
            onIconClick={() => {}}
            action
            thClassName="bg-muted/20 border-b border-border/20 h-12 font-black uppercase text-[9px] tracking-[0.3em]"
          />
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

      {/* ── Create Task Dialog ──────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent
          className="w-full max-w-[calc(100%-2rem)] sm:max-w-2xl border-border/40 bg-card backdrop-blur-xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader className="pr-8">
            <DialogTitle className="text-xl font-black uppercase tracking-widest">
              Assign New Task
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Fill in the task details and assign it to an intern.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleCreate}
            className="flex flex-col min-h-0 w-full"
          >
            <div className="space-y-5 pt-2 my-2 pr-1 max-h-[60vh] overflow-y-auto w-full min-w-0">
              {/* Assign To (MUID or Name) */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Assign To (MUID or Name){" "}
                  <span className="text-destructive">*</span>
                </Label>
                {form.assigned_to ? (
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-brand-blue/10 to-brand-blue/5 border border-brand-blue/20 rounded-2xl shadow-sm transition-all duration-300">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-brand-blue/20 flex items-center justify-center text-base font-black text-brand-blue shrink-0 shadow-inner">
                        {form.assigneeName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-foreground truncate">
                          {form.assigneeName}
                        </p>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate flex items-center gap-1.5 mt-0.5">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-blue/60" />
                          @{form.assigneeMuid}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setForm({
                          ...form,
                          assigned_to: "",
                          assigneeName: "",
                          assigneeMuid: "",
                          category: "",
                        });
                        setSelectedUserGuild(null);
                      }}
                      className="text-xs font-bold text-muted-foreground hover:text-destructive hover:border-destructive/30 shrink-0 px-3.5 h-9 rounded-xl transition-all duration-200"
                    >
                      Change Intern
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <Input
                      placeholder="Search intern by name or MUID..."
                      value={assigneeQuery}
                      onChange={(e) => setAssigneeQuery(e.target.value)}
                      onFocus={() => setIsAssigneeFocused(true)}
                      onBlur={() => {
                        setTimeout(() => setIsAssigneeFocused(false), 200);
                      }}
                      className="pl-11 h-11 bg-background/50 border-border/50 font-medium rounded-xl focus-visible:ring-brand-blue transition-all duration-200"
                    />
                    {isInternsLoading && (
                      <Spinner className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-blue" />
                    )}
                    {isAssigneeFocused && filteredAssignees.length > 0 && (
                      <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-card/95 backdrop-blur-md border border-border/40 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto animate-in fade-in-50 slide-in-from-top-2 duration-200">
                        {filteredAssignees.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setForm({
                                ...form,
                                assigned_to: user.id,
                                assigneeName: user.full_name,
                                assigneeMuid: user.muid,
                                category: "",
                                team: user.guild || "",
                              });
                              setAssigneeQuery("");
                              setIsAssigneeFocused(false);
                              setSelectedUserGuild(user.guild || null);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-brand-blue/5 text-left transition-colors border-b border-border/10 last:border-0"
                          >
                            <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-xs font-black text-brand-blue">
                              {user.full_name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">
                                {user.full_name}
                              </p>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                @{user.muid}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  required
                  placeholder="e.g. Build authentication module"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="h-10 bg-background/50 border-border/50 font-bold rounded-xl focus-visible:ring-brand-blue"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  required
                  placeholder="Detailed description of what needs to be done"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="min-h-[140px] max-h-[220px] overflow-y-auto bg-background/50 border-border/50 font-medium resize-none rounded-xl focus-visible:ring-brand-blue"
                />
              </div>

              {/* Guild & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Guild (Unchangeable) */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Guild
                  </Label>
                  <Input
                    value={form.team ? form.team.replace(/_/g, " ") : ""}
                    placeholder="Select intern to populate Guild"
                    readOnly
                    disabled
                    className="h-10 bg-muted/40 border-border/40 font-bold text-xs uppercase cursor-not-allowed select-none rounded-xl"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm({ ...form, category: v })}
                    disabled={!form.team}
                  >
                    <SelectTrigger className="w-full h-10 bg-background/50 border-border/50 font-bold text-xs uppercase rounded-xl">
                      <SelectValue
                        placeholder={
                          form.team ? "Select Category" : "Select Intern First"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      className="bg-card font-bold border-border/60 rounded-xl"
                    >
                      {createFormCategories.map((cat) => (
                        <SelectItem
                          key={cat}
                          value={cat}
                          className="font-bold text-xs uppercase"
                        >
                          {cat.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Complexity, Karma & Deadline Row */}
              <div className="grid grid-cols-3 gap-4">
                {/* Complexity */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Complexity
                  </Label>
                  <Select
                    value={form.complexity}
                    onValueChange={(v) =>
                      setForm({
                        ...form,
                        complexity: v as (typeof COMPLEXITY_OPTIONS)[number],
                      })
                    }
                  >
                    <SelectTrigger className="w-full h-10 bg-background/50 border-border/50 font-bold text-xs rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" className="rounded-xl">
                      {COMPLEXITY_OPTIONS.map((c) => (
                        <SelectItem
                          key={c}
                          value={c}
                          className="font-bold text-xs uppercase"
                        >
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Karma */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Karma
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g. 100"
                    value={form.karma}
                    onChange={(e) =>
                      setForm({ ...form, karma: e.target.value })
                    }
                    className="h-10 bg-background/50 border-border/50 font-bold rounded-xl"
                  />
                </div>

                {/* Deadline */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Deadline
                  </Label>
                  <Input
                    type="date"
                    value={form.deadline}
                    onChange={(e) =>
                      setForm({ ...form, deadline: e.target.value })
                    }
                    className="h-10 bg-background/50 border-border/50 font-bold rounded-xl"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border/20">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                className="font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-brand-blue hover:bg-brand-blue/90 text-white font-bold gap-2"
              >
                {createMutation.isPending ? (
                  <>
                    <Spinner className="w-4 h-4" /> Assigning...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Create Task
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Task Dialog ────────────────────────────────────── */}
      <Dialog open={!!editTask} onOpenChange={(o) => !o && setEditTask(null)}>
        <DialogContent
          className="w-full max-w-[calc(100%-2rem)] sm:max-w-2xl border-border/40 bg-card backdrop-blur-xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader className="pr-8">
            <DialogTitle className="text-xl font-black uppercase tracking-widest">
              Edit Task
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Update task details. Assignee changes are not supported via edit.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleUpdate}
            className="flex flex-col min-h-0 w-full"
          >
            <div className="space-y-5 pt-2 my-2 pr-1 max-h-[60vh] overflow-y-auto w-full min-w-0">
              {/* Title */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Title
                </Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="h-10 bg-background/50 border-border/50 font-bold rounded-xl focus-visible:ring-brand-blue"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Description
                </Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="min-h-[140px] max-h-[220px] overflow-y-auto bg-background/50 border-border/50 font-medium resize-none rounded-xl focus-visible:ring-brand-blue"
                />
              </div>

              {/* Guild & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Guild (Unchangeable) */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Guild
                  </Label>
                  <Input
                    value={form.team ? form.team.replace(/_/g, " ") : ""}
                    readOnly
                    disabled
                    className="h-10 bg-muted/40 border-border/40 font-bold text-xs uppercase cursor-not-allowed select-none rounded-xl"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Category
                  </Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm({ ...form, category: v })}
                  >
                    <SelectTrigger className="w-full h-10 bg-background/50 border-border/50 font-bold text-xs uppercase rounded-xl">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      className="bg-card font-bold border-border/60 rounded-xl"
                    >
                      {(selectedUserGuild
                        ? createFormCategories
                        : editFormCategories
                      ).map((cat) => (
                        <SelectItem
                          key={cat}
                          value={cat}
                          className="font-bold text-xs uppercase"
                        >
                          {cat.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Complexity, Karma & Deadline Row */}
              <div className="grid grid-cols-3 gap-4">
                {/* Complexity */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Complexity
                  </Label>
                  <Select
                    value={form.complexity}
                    onValueChange={(v) =>
                      setForm({
                        ...form,
                        complexity: v as (typeof COMPLEXITY_OPTIONS)[number],
                      })
                    }
                  >
                    <SelectTrigger className="w-full h-10 bg-background/50 border-border/50 font-bold text-xs rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" className="rounded-xl">
                      {COMPLEXITY_OPTIONS.map((c) => (
                        <SelectItem
                          key={c}
                          value={c}
                          className="font-bold text-xs uppercase"
                        >
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Karma */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Karma
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g. 100"
                    value={form.karma}
                    onChange={(e) =>
                      setForm({ ...form, karma: e.target.value })
                    }
                    className="h-10 bg-background/50 border-border/50 font-bold rounded-xl"
                  />
                </div>

                {/* Deadline */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Deadline
                  </Label>
                  <Input
                    type="date"
                    value={form.deadline}
                    onChange={(e) =>
                      setForm({ ...form, deadline: e.target.value })
                    }
                    className="h-10 bg-background/50 border-border/50 font-bold rounded-xl"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="pt-4 border-t border-border/20">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditTask(null)}
                className="font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-brand-blue hover:bg-brand-blue/90 text-white font-bold gap-2"
              >
                {updateMutation.isPending ? (
                  <>
                    <Spinner className="w-4 h-4" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ──────────────────────────── */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent
          className="w-full max-w-[calc(100%-2rem)] sm:max-w-md border-border/40 bg-card backdrop-blur-xl max-h-[calc(100vh-2rem)] flex flex-col p-4 sm:p-6 rounded-2xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-widest text-destructive">
              Delete Task
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-muted-foreground mt-2">
              This action is permanent and cannot be undone. Are you sure you
              want to delete this task?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="font-bold"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={handleDelete}
              className="font-bold gap-2"
            >
              {deleteMutation.isPending ? (
                <>
                  <Spinner className="w-4 h-4" /> Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" /> Delete Task
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Review & Status Update Dialog ──────────────────────────────────── */}
      <Dialog
        open={!!reviewTarget}
        onOpenChange={(o) => !o && setReviewTarget(null)}
      >
        <DialogContent
          className="max-w-md border-border/40 bg-card backdrop-blur-xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-widest text-brand-blue flex items-center gap-2">
              <MessageSquareDot className="w-5 h-5" /> Review & Update Status
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-muted-foreground mt-2">
              Update the task status and provide review feedback to the intern.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3 my-2 pr-1 max-h-[60vh] overflow-y-auto w-full min-w-0">
            {/* Read-only metadata */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-border/40 bg-background/40">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">
                  Task
                </span>
                <span
                  className="font-bold text-foreground text-xs truncate block"
                  title={reviewTarget?.title}
                >
                  {reviewTarget?.title}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">
                  Assigned To
                </span>
                <span className="font-semibold text-foreground text-xs truncate block">
                  {reviewTarget?.assigned_to_name || reviewTarget?.assigned_to}
                </span>
              </div>
            </div>

            {/* Submission link */}
            <div className="space-y-1">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                Submission Link
              </span>
              {reviewTarget?.output_link ? (
                <a
                  href={reviewTarget.output_link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-brand-blue hover:underline break-all flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  {reviewTarget.output_link}
                </a>
              ) : isFetchingDetail ? (
                <span className="text-xs text-muted-foreground italic">
                  Loading submission link...
                </span>
              ) : (
                <span className="text-xs text-muted-foreground italic">
                  No submission link provided
                </span>
              )}
            </div>

            {/* Status selector */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                value={reviewForm.status}
                onValueChange={(v) =>
                  setReviewForm((prev) => ({ ...prev, status: v }))
                }
              >
                <SelectTrigger className="h-10 bg-background/50 border-border/50 font-bold text-xs uppercase">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className="bg-card font-bold border-border/60"
                >
                  {_STATUS_OPTIONS.map((s) => (
                    <SelectItem
                      key={s}
                      value={s}
                      className="font-bold text-xs uppercase"
                    >
                      {s.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Karma — visible only when status is COMPLETED */}
            {reviewForm.status === "COMPLETED" && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Karma Points Awarded
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={reviewForm.karma}
                  onChange={(e) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      karma: e.target.value,
                    }))
                  }
                  className="h-10 bg-background/50 border-border/50 font-bold"
                  placeholder="e.g. 200"
                />
              </div>
            )}

            {/* Review Remark */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Review Remark
                {(reviewForm.status === "IN_PROGRESS" ||
                  reviewForm.status === "ON_HOLD") && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              <Textarea
                placeholder={
                  reviewForm.status === "COMPLETED"
                    ? "Optional — e.g. Great work, well done!"
                    : reviewForm.status === "IN_PROGRESS" ||
                        reviewForm.status === "ON_HOLD"
                      ? "Required — e.g. Failing test cases, please fix..."
                      : "Optional remark..."
                }
                value={reviewForm.remark}
                onChange={(e) =>
                  setReviewForm((prev) => ({ ...prev, remark: e.target.value }))
                }
                className="min-h-[80px] max-h-[150px] overflow-y-auto bg-background/50 border-border/50 font-medium resize-none"
              />
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-border/20 flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setReviewTarget(null)}
              className="font-bold"
            >
              Cancel
            </Button>
            {reviewForm.status === "COMPLETED" && (
              <Button
                disabled={verifyMutation.isPending || reviewMutation.isPending}
                onClick={() => {
                  if (!reviewTarget) return;
                  verifyMutation.mutate(
                    {
                      id: reviewTarget.id,
                      karma_awarded: reviewForm.karma
                        ? Number(reviewForm.karma)
                        : 0,
                    },
                    {
                      onSuccess: () => setReviewTarget(null),
                    },
                  );
                }}
                className="bg-success hover:bg-success/90 text-white font-bold gap-2"
              >
                {verifyMutation.isPending ? (
                  <>
                    <Spinner className="w-4 h-4" /> Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Verify &amp; Award
                    Karma
                  </>
                )}
              </Button>
            )}
            <Button
              disabled={
                reviewMutation.isPending ||
                verifyMutation.isPending ||
                !reviewForm.status ||
                ((reviewForm.status === "IN_PROGRESS" ||
                  reviewForm.status === "ON_HOLD") &&
                  !reviewForm.remark.trim())
              }
              onClick={handleVerifySubmit}
              className="bg-brand-blue hover:bg-brand-blue/90 text-white font-bold gap-2"
            >
              {reviewMutation.isPending ? (
                <>
                  <Spinner className="w-4 h-4" /> Saving...
                </>
              ) : (
                <>
                  <MessageSquareDot className="w-4 h-4" /> Save Review
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
