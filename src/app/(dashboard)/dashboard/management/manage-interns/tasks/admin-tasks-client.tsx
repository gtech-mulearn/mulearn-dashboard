"use client";

import {
  CalendarDays,
  CheckCircle2,
  Edit,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import Pagination from "@/components/dashboard/table/pagination";
import Table from "@/components/dashboard/table/Table";
import THead from "@/components/dashboard/table/Thead";
import { Badge } from "@/components/ui/badge";
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
  useManageTasks,
  useUpdateTask,
  useVerifyTask,
} from "@/features/intern";
import type { TInternTask } from "@/features/intern/types";
import { getTaskGuild } from "@/features/intern/utils/intern-helpers";
import { useDebounce } from "@/hooks/use-debounce";
import { useSearch } from "@/hooks/use-search";

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
  const [verifyTarget, setVerifyTarget] = useState<TInternTask | null>(null);
  const [verifyKarma, setVerifyKarma] = useState("");
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);

  // Form state
  const [form, setForm] = useState({ ...blankForm });

  // Inline assignee search for create form
  const {
    query: assigneeQuery,
    results: assigneeResults,
    isLoading: isAssigneeLoading,
    handleSearch: handleAssigneeSearch,
    clearResults: clearAssigneeResults,
  } = useSearch();

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

  const apiCategories = Array.from(
    new Set((tasksData?.data ?? []).map((t) => t.category).filter(Boolean)),
  );
  const categories =
    apiCategories.length > 0
      ? apiCategories
      : ["DEVELOPMENT", "DESIGN", "TESTING"];

  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask(editTask?.id ?? "");
  const deleteMutation = useDeleteTask();
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
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 gap-1.5 text-foreground border-border">
                {task.status.replace(/_/g, " ")}
              </div>
              {task.is_verified && (
                <div className="inline-flex items-center rounded-full border py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-success/10 border-success/30 text-success text-[8px] font-black uppercase tracking-wide h-4 px-1">
                  Verified
                </div>
              )}
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
          {task.status === "COMPLETED" && !task.is_verified && (
            <Button
              size="icon"
              variant="ghost"
              onClick={async () => {
                setVerifyTarget(task);
                setVerifyKarma(
                  task.karma_awarded ? String(task.karma_awarded) : "",
                );
                setIsFetchingDetail(true);
                try {
                  const detail = await manageInternsApi.getTaskDetail(task.id);
                  setVerifyTarget(detail);
                } catch (error) {
                  console.error("Failed to fetch task detail", error);
                } finally {
                  setIsFetchingDetail(false);
                }
              }}
              className="rounded-md text-muted-foreground hover:bg-muted hover:text-success size-8"
              title="Verify Task"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </Button>
          )}
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
          clearAssigneeResults();
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
    if (!verifyTarget) return;
    const karmaVal = verifyKarma ? Number(verifyKarma) : 0;
    verifyMutation.mutate(
      {
        id: verifyTarget.id,
        karma_awarded: karmaVal,
      },
      {
        onSuccess: () => {
          setVerifyTarget(null);
        },
      },
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="default"
              className="px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest"
            >
              Admin Console
            </Badge>
          </div>
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
            clearAssigneeResults();
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
              {categories.map((category) => (
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
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-2xl border-border/40 bg-card backdrop-blur-xl">
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
            className="space-y-5 pt-2 w-full min-w-0"
          >
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
                className="h-10 bg-background/50 border-border/50 font-bold"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                required
                placeholder="Detailed description of what needs to be done..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="min-h-[90px] max-h-[160px] overflow-y-auto bg-background/50 border-border/50 font-medium resize-none"
              />
            </div>

            {/* Category + Complexity + Karma */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger className="h-10 bg-background/50 border-border/50 font-bold text-xs uppercase">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="bg-card font-bold border-border/60"
                  >
                    {categories.map((cat) => (
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
                  <SelectTrigger className="h-10 bg-background/50 border-border/50 font-bold text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
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
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Karma
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="e.g. 100"
                  value={form.karma}
                  onChange={(e) => setForm({ ...form, karma: e.target.value })}
                  className="h-10 bg-background/50 border-border/50 font-bold"
                />
              </div>
            </div>

            {/* Assignee search */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Assign To (MUID or Name){" "}
                <span className="text-destructive">*</span>
              </Label>
              {form.assigned_to ? (
                <div className="flex items-center gap-2 p-2 bg-brand-blue/5 border border-brand-blue/20 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-brand-blue" />
                  <span className="text-sm font-bold text-foreground flex-1">
                    {form.assigneeName}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        assigned_to: "",
                        assigneeName: "",
                        assigneeMuid: "",
                      })
                    }
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  <Input
                    placeholder="Search intern by name or MUID..."
                    value={assigneeQuery}
                    onChange={(e) => handleAssigneeSearch(e.target.value)}
                    className="pl-10 h-10 bg-background/50 border-border/50 font-medium"
                  />
                  {isAssigneeLoading && (
                    <Spinner className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" />
                  )}
                  {assigneeResults.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border/40 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                      {assigneeResults.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            setForm({
                              ...form,
                              assigned_to: user.id,
                              assigneeName: user.full_name,
                              assigneeMuid: user.muid,
                            });
                            clearAssigneeResults();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/20 text-left transition-colors border-b border-border/10 last:border-0"
                        >
                          <div className="w-7 h-7 rounded-full bg-brand-blue/10 flex items-center justify-center text-[10px] font-black text-brand-blue">
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

            {/* Team + Deadline */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Team
                </Label>
                <Select
                  value={form.team}
                  onValueChange={(v) => setForm({ ...form, team: v })}
                >
                  <SelectTrigger className="h-10 bg-background/50 border-border/50 font-bold text-xs uppercase">
                    <SelectValue placeholder="Select Team" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="bg-card font-bold border-border/60"
                  >
                    {teams.map((t) => (
                      <SelectItem
                        key={t}
                        value={t}
                        className="font-bold text-xs uppercase"
                      >
                        {t.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" /> Deadline
                </Label>
                <Input
                  type="date"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm({ ...form, deadline: e.target.value })
                  }
                  className="font-bold"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
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
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-2xl border-border/40 bg-card backdrop-blur-xl">
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
            className="space-y-5 pt-2 w-full min-w-0"
          >
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Title
              </Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="h-10 bg-background/50 border-border/50 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Description
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="min-h-[80px] max-h-[160px] overflow-y-auto bg-background/50 border-border/50 font-medium resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Category
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger className="h-10 bg-background/50 border-border/50 font-bold text-xs uppercase">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="bg-card font-bold border-border/60"
                  >
                    {categories.map((cat) => (
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
                  <SelectTrigger className="h-10 bg-background/50 border-border/50 font-bold text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
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
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Karma
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="e.g. 100"
                  value={form.karma}
                  onChange={(e) => setForm({ ...form, karma: e.target.value })}
                  className="h-10 bg-background/50 border-border/50 font-bold"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Team
                </Label>
                <Select
                  value={form.team}
                  onValueChange={(v) => setForm({ ...form, team: v })}
                >
                  <SelectTrigger className="h-10 bg-background/50 border-border/50 font-bold text-xs uppercase">
                    <SelectValue placeholder="Select Team" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="bg-card font-bold border-border/60"
                  >
                    {teams.map((t) => (
                      <SelectItem
                        key={t}
                        value={t}
                        className="font-bold text-xs uppercase"
                      >
                        {t.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" /> Deadline
                </Label>
                <Input
                  type="date"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm({ ...form, deadline: e.target.value })
                  }
                  className="font-bold"
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
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
        <DialogContent className="max-w-md border-border/40 bg-card backdrop-blur-xl">
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

      {/* ── Verify Task Dialog ──────────────────────────────────── */}
      <Dialog
        open={!!verifyTarget}
        onOpenChange={(o) => !o && setVerifyTarget(null)}
      >
        <DialogContent className="max-w-md border-border/40 bg-card backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-widest text-success flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Verify Completed Task
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-muted-foreground mt-2">
              Approve and verify achievements for this task. You can override
              the awarded karma value below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                Task
              </span>
              <span className="font-bold text-foreground text-sm">
                {verifyTarget?.title}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                Assigned To
              </span>
              <span className="font-semibold text-foreground text-xs">
                {verifyTarget?.assigned_to_name || verifyTarget?.assigned_to}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                Submission Link
              </span>
              {verifyTarget?.output_link ? (
                <a
                  href={verifyTarget.output_link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-brand-blue hover:underline break-all"
                >
                  {verifyTarget.output_link}
                </a>
              ) : isFetchingDetail ? (
                <span className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                  <Spinner className="w-3 h-3 text-muted-foreground" /> Loading
                  submission link...
                </span>
              ) : (
                <span className="text-xs text-muted-foreground italic">
                  No submission link provided
                </span>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Karma Points Awarded
              </Label>
              <Input
                type="number"
                min="0"
                value={verifyKarma}
                onChange={(e) => setVerifyKarma(e.target.value)}
                className="h-10 bg-background/50 border-border/50 font-bold"
              />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setVerifyTarget(null)}
              className="font-bold"
            >
              Cancel
            </Button>
            <Button
              disabled={verifyMutation.isPending}
              onClick={handleVerifySubmit}
              className="bg-success hover:bg-success/90 text-white font-bold gap-2"
            >
              {verifyMutation.isPending ? (
                <>
                  <Spinner className="w-4 h-4" /> Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Verify & Award
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
