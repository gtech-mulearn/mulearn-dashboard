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
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import Pagination from "@/components/dashboard/table/pagination";
import Table from "@/components/dashboard/table/Table";
import { Button } from "@/components/ui/button";
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
import {
  AssignTaskDialog,
  COMPLEXITY_OPTIONS,
  type TaskForm,
} from "./components/assign-task-dialog";
import { EditTaskDialog } from "./components/edit-task-dialog";
import {
  type ReviewForm,
  ReviewTaskDialog,
} from "./components/review-task-dialog";

// ── Helpers ───────────────────────────────────────────────────

const STATUS_OPTIONS = [
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
const blankForm: TaskForm = {
  title: "",
  description: "",
  category: "",
  complexity: "MEDIUM",
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
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [reviewForm, setReviewForm] = useState<ReviewForm>({
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
      guild: item.guild,
      role: item.role,
    }));
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
    sortBy,
    sortOrder,
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
    const key = Object.keys(taskCategories || {}).find(
      (k) => k.toUpperCase() === guildFilter.toUpperCase(),
    );
    return key ? (taskCategories[key] || []).slice().sort() : [];
  }, [taskCategories, guildFilter]);

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

    if (sortBy) {
      list = [...list].sort((a, b) => {
        let valA = a[sortBy as keyof TInternTask];
        let valB = b[sortBy as keyof TInternTask];

        if (sortBy === "guild") {
          valA = getTaskGuild(a);
          valB = getTaskGuild(b);
        }

        if (valA === undefined || valA === null) valA = "";
        if (valB === undefined || valB === null) valB = "";

        if (sortBy === "deadline" || sortBy === "created_at") {
          const timeA = valA ? new Date(valA as string).getTime() : 0;
          const timeB = valB ? new Date(valB as string).getTime() : 0;
          const isInvalidA = Number.isNaN(timeA);
          const isInvalidB = Number.isNaN(timeB);
          if (isInvalidA && isInvalidB) return 0;
          if (isInvalidA) return sortOrder === "asc" ? 1 : -1;
          if (isInvalidB) return sortOrder === "asc" ? -1 : 1;
          return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
        }

        const isNumA = typeof valA === "number";
        const isNumB = typeof valB === "number";
        if (isNumA && isNumB) {
          return sortOrder === "asc"
            ? (valA as unknown as number) - (valB as unknown as number)
            : (valB as unknown as number) - (valA as unknown as number);
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return sortOrder === "asc" ? -1 : 1;
        if (strA > strB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [
    tasksData?.data,
    statusFilter,
    guildFilter,
    complexityFilter,
    categoryFilter,
    sortBy,
    sortOrder,
  ]);

  const columnOrder = useMemo(
    () => [
      {
        column: "title",
        Label: "Title",
        isSortable: true,
        width: "min-w-[150px]",
      },
      {
        column: "assigned_to_name",
        Label: "Assigned To",
        isSortable: true,
        width: "min-w-[200px]",
      },
      { column: "guild", Label: "Guild", isSortable: true, width: "w-36" },
      {
        column: "complexity",
        Label: "Complexity",
        isSortable: true,
        width: "w-28",
      },
      {
        column: "karma_awarded",
        Label: "Karma",
        isSortable: true,
        width: "w-20",
      },
      { column: "status", Label: "Status", isSortable: true, width: "w-40" },
      {
        column: "deadline",
        Label: "Deadline",
        isSortable: true,
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
          size="lg"
          onClick={() => {
            setForm({ ...blankForm });
            setAssigneeQuery("");
            setSelectedUserGuild(null);
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
              setCategoryFilter("ALL");
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
              {STATUS_OPTIONS.map((status) => (
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
        createFormCategories={createFormCategories}
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
            category: "",
            team: user.guild || "",
          });
          setAssigneeQuery("");
          setIsAssigneeFocused(false);
          setSelectedUserGuild(user.guild || null);
        }}
        onClearAssignee={() => {
          setForm({
            ...form,
            assigned_to: "",
            assigneeName: "",
            assigneeMuid: "",
            category: "",
          });
          setSelectedUserGuild(null);
        }}
        onSubmit={handleCreate}
      />

      <EditTaskDialog
        editTask={editTask}
        form={form}
        editFormCategories={editFormCategories}
        createFormCategories={createFormCategories}
        selectedUserGuild={selectedUserGuild}
        isPending={updateMutation.isPending}
        onClose={() => setEditTask(null)}
        onFormChange={setForm}
        onSubmit={handleUpdate}
      />

      <ReviewTaskDialog
        reviewTarget={reviewTarget}
        reviewForm={reviewForm}
        isFetchingDetail={isFetchingDetail}
        isReviewPending={reviewMutation.isPending}
        isVerifyPending={verifyMutation.isPending}
        deleteTarget={deleteTarget}
        isDeletePending={deleteMutation.isPending}
        onClose={() => setReviewTarget(null)}
        onReviewFormChange={setReviewForm}
        onVerifySubmit={handleVerifySubmit}
        onVerifyAndAward={() => {
          if (!reviewTarget) return;
          verifyMutation.mutate(
            {
              id: reviewTarget.id,
              karma_awarded: reviewForm.karma ? Number(reviewForm.karma) : 0,
            },
            { onSuccess: () => setReviewTarget(null) },
          );
        }}
        onDeleteClose={() => setDeleteTarget(null)}
        onDelete={handleDelete}
      />
    </div>
  );
}
