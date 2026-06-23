"use client";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  Crown,
  Download,
  ListTodo,
  PauseCircle,
  Pencil,
  Plus,
  Search,
  Shield,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Pagination from "@/components/dashboard/table/pagination";
import Table, { type Data } from "@/components/dashboard/table/Table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SectionErrorFallback } from "@/components/ui/errors/SectionErrorFallback";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useDeactivateIntern,
  useExportInterns,
  useGuilds,
  useManageInternsList,
  useUpdateIntern,
} from "@/features/intern";
import type { TManageInternItem } from "@/features/intern/types";
import { resolveInternStatus } from "@/features/intern/utils/intern-helpers";
import { useDebounce } from "@/hooks/use-debounce";
import { InternsStats } from "../../../../../features/intern/components/interns-stats";
import { OnboardDialog } from "../../../../../features/intern/components/onboard-dialog";
import { UpdateDialog } from "../../../../../features/intern/components/update-dialog";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge
          variant="outline"
          className="gap-1.5 text-success border-success/30"
        >
          <CheckCircle2 className="w-3 h-3" /> Active
        </Badge>
      );
    case "AT_RISK":
      return (
        <Badge
          variant="outline"
          className="gap-1.5 text-warning border-warning/30"
        >
          <AlertTriangle className="w-3 h-3" /> At Risk
        </Badge>
      );
    case "ON_LEAVE":
      return (
        <Badge
          variant="outline"
          className="gap-1.5 text-brand-blue border-brand-blue/30"
        >
          <PauseCircle className="w-3 h-3" /> On Leave
        </Badge>
      );
    case "INACTIVE":
      return (
        <Badge
          variant="outline"
          className="gap-1.5 text-muted-foreground border-border"
        >
          <Shield className="w-3 h-3" /> Inactive
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const statusColorClass: Record<string, string> = {
  ACTIVE: "text-success",
  AT_RISK: "text-warning",
  ON_LEAVE: "text-brand-blue",
  INACTIVE: "text-muted-foreground",
  all: "",
};

const DEFAULT_GUILDS = [
  "DESIGN",
  "FRONTEND",
  "BACKEND",
  "MOBILE",
  "DEVOPS",
  "QA",
  "PM",
];

export function ManageInternsPageClient() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(
    undefined,
  );

  const debouncedSearch = useDebounce(searchText, 300);

  // Dialog & Modal states
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const [updateIntern, setUpdateIntern] = useState<{
    id: string;
    name: string;
    guild: string;
    status: string;
    role?: "INTERN" | "INTERN_LEAD" | "Intern" | "Intern Lead";
  } | null>(null);
  const [deactivateIntern, setDeactivateIntern] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [activateIntern, setActivateIntern] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Queries & Mutations
  const { data: listData, isLoading: isListLoading } = useManageInternsList({
    page,
    perPage,
    search: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    sortBy,
    sortOrder,
  });

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

  const { data: guilds = [] } = useGuilds();
  const guildOptions = useMemo(() => {
    return guilds.length > 0 ? guilds : DEFAULT_GUILDS;
  }, [guilds]);

  const deactivateMutation = useDeactivateIntern();
  const activateMutation = useUpdateIntern(activateIntern?.id || "");
  const { mutateAsync: exportCsv, isPending: isExporting } = useExportInterns();

  const getEditableStatus = (item: TManageInternItem) => {
    return (
      item.current_status ||
      item.base_status ||
      item.previous_status ||
      (item.status !== "ON_LEAVE" ? item.status : undefined) ||
      "ACTIVE"
    );
  };

  const rows = useMemo(() => {
    const data = (listData?.data ?? []) as unknown as TManageInternItem[];
    let resolvedRows = data.map((item) => ({
      ...item,
      resolved_status: resolveInternStatus(item),
    }));

    if (statusFilter !== "all") {
      resolvedRows = resolvedRows.filter(
        (item) =>
          item.resolved_status?.toUpperCase() === statusFilter.toUpperCase(),
      );
    }

    if (roleFilter !== "all") {
      resolvedRows = resolvedRows.filter((item) => {
        const itemRole = item.role ?? "INTERN";
        const normalized =
          itemRole === "Intern Lead" || itemRole === "INTERN_LEAD"
            ? "INTERN_LEAD"
            : "INTERN";
        return normalized === roleFilter;
      });
    }

    return resolvedRows as unknown as Data[];
  }, [listData, statusFilter, roleFilter]);

  const totalPages = listData?.pagination?.totalPages ?? 1;
  const totalCount = listData?.pagination?.count ?? 0;

  const isClientFiltered = statusFilter !== "all" || roleFilter !== "all";
  const displayedTotalCount = isClientFiltered ? rows.length : totalCount;
  const displayedTotalPages = isClientFiltered
    ? Math.ceil(rows.length / perPage) || 1
    : totalPages;

  const tableColumns = useMemo(() => {
    return [
      {
        column: "full_name",
        Label: "Intern Name",
        isSortable: true,
        wrap: (data: string, _id: string, row: Data) => (
          <div className="flex flex-col">
            <span className="font-bold text-foreground uppercase tracking-tight text-sm">
              {data}
            </span>
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mt-1">
              {row.muid as string}
            </span>
          </div>
        ),
      },
      {
        column: "guild",
        Label: "Team",
        isSortable: true,
        wrap: (data: string) => (
          <Badge
            variant="outline"
            className="font-bold uppercase tracking-wider"
          >
            {data}
          </Badge>
        ),
      },
      {
        column: "role",
        Label: "Role",
        isSortable: true,
        wrap: (data: string) =>
          data === "INTERN_LEAD" || data === "Intern Lead" ? (
            <Badge
              variant="outline"
              className="gap-1 font-bold text-amber-500 border-amber-500/30 bg-amber-500/5"
            >
              <Crown className="w-3 h-3" />
              Intern Lead
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="font-bold text-muted-foreground border-border"
            >
              Intern
            </Badge>
          ),
      },
      {
        column: "resolved_status",
        Label: "Status",
        isSortable: true,
        wrap: (data: string) => getStatusBadge(data),
      },
      {
        column: "created_at",
        Label: "Joined Date",
        isSortable: true,
        wrap: (data: string) => (
          <span className="text-xs font-bold text-foreground">
            {new Date(data).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        ),
      },
    ];
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase flex items-center gap-3">
            <Users className="w-10 h-10 text-primary" />
            Manage Interns
          </h2>
          <p className="text-muted-foreground mt-1 font-medium italic">
            Oversee the realm of active learners and contributors.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            onClick={() => setIsOnboardOpen(true)}
            variant="default"
            className="gap-2 text-xs tracking-widest shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Onboard Intern
          </Button>
          <Link href="/dashboard/management/manage-interns/timesheet-reviews">
            <Button
              size="lg"
              variant="default"
              className="gap-2 text-xs tracking-widest shadow-lg"
            >
              <CheckCircle2 className="w-4 h-4" />
              Timesheets
            </Button>
          </Link>
          <Link href="/dashboard/management/manage-interns/leave-reviews">
            <Button
              size="lg"
              variant="default"
              className="gap-2 text-xs tracking-widest shadow-lg"
            >
              <Calendar className="w-4 h-4" />
              Leaves
            </Button>
          </Link>
          <Link href="/dashboard/management/manage-interns/tasks">
            <Button
              size="lg"
              variant="default"
              className="gap-2 text-xs tracking-widest shadow-lg"
            >
              <ListTodo className="w-4 h-4" />
              Tasks
            </Button>
          </Link>
          <Link href="/dashboard/management/manage-interns/intern-report">
            <Button
              size="lg"
              variant="default"
              className="gap-2 text-xs tracking-widest shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              Reports
            </Button>
          </Link>
          <Link href="/dashboard/management/manage-interns/minutes">
            <Button
              size="lg"
              variant="default"
              className="gap-2 text-xs tracking-widest shadow-lg"
            >
              <Crown className="w-4 h-4" />
              Minutes
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Stats */}
      <ErrorBoundary FallbackComponent={SectionErrorFallback}>
        <InternsStats />
      </ErrorBoundary>

      {/* Interns Data Table Section */}
      <ErrorBoundary FallbackComponent={SectionErrorFallback}>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black uppercase tracking-widest">
                Intern Directory
              </h3>
              <p className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-wider mt-0.5">
                Manage profiles and track progress
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card/40 backdrop-blur-md border border-border/40 p-4 rounded-2xl shadow-md">
            {/* Left side: Search & Rows per page */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
              <div className="relative flex-1 sm:max-w-xs shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <Input
                  placeholder="Search heroes..."
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value.replace(/[<>/]/g, ""));
                    setPage(1);
                  }}
                  className="w-full pl-10 h-10 bg-background/50 border-border/50 font-medium rounded-xl"
                />
                {searchText && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchText("");
                      setPage(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* Rows per page: hidden on mobile, flex on tablet/desktop */}
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">
                  Rows per page
                </span>
                <Select
                  value={String(perPage)}
                  onValueChange={(value) => {
                    setPerPage(Number(value));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-10 w-[88px] rounded-xl border-border bg-background/50 font-bold text-xs">
                    <SelectValue placeholder="Rows" />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50].map((option) => (
                      <SelectItem key={option} value={String(option)}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right side: Filters & Export CSV (and Mobile Rows per page) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3 w-full sm:w-auto">
                <Select
                  value={statusFilter}
                  onValueChange={(val) => {
                    setStatusFilter(val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger
                    className={`w-full sm:w-[160px] h-10 font-black uppercase text-[10px] tracking-widest border-border/40 bg-card/40 ${statusColorClass[statusFilter] ?? ""}`}
                  >
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="bg-card/95 backdrop-blur-xl border-border/60"
                  >
                    <SelectItem
                      value="all"
                      className="font-bold uppercase text-[10px]"
                    >
                      All Statuses
                    </SelectItem>
                    <SelectItem
                      value="ACTIVE"
                      className="font-bold uppercase text-[10px]"
                    >
                      Active
                    </SelectItem>
                    <SelectItem
                      value="AT_RISK"
                      className="font-bold uppercase text-[10px]"
                    >
                      At Risk
                    </SelectItem>
                    <SelectItem
                      value="ON_LEAVE"
                      className="font-bold uppercase text-[10px]"
                    >
                      On Leave
                    </SelectItem>
                    <SelectItem
                      value="INACTIVE"
                      className="font-bold uppercase text-[10px]"
                    >
                      Inactive
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={roleFilter}
                  onValueChange={(val) => {
                    setRoleFilter(val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[160px] h-10 font-black uppercase text-[10px] tracking-widest border-border/40 bg-card/40">
                    <SelectValue placeholder="Filter by Role" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="bg-card/95 backdrop-blur-xl border-border/60"
                  >
                    <SelectItem
                      value="all"
                      className="font-bold uppercase text-[10px]"
                    >
                      All Roles
                    </SelectItem>
                    <SelectItem
                      value="INTERN"
                      className="font-bold uppercase text-[10px]"
                    >
                      Intern
                    </SelectItem>
                    <SelectItem
                      value="INTERN_LEAD"
                      className="font-bold uppercase text-[10px] text-amber-500"
                    >
                      ⭐ Intern Lead
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bottom/Right-most Row: Mobile Rows per Page & Export Button */}
              <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-3 w-full sm:w-auto mt-1 sm:mt-0">
                {/* Rows per page: visible only on mobile */}
                <div className="flex sm:hidden items-center gap-2">
                  <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">
                    Rows per page
                  </span>
                  <Select
                    value={String(perPage)}
                    onValueChange={(value) => {
                      setPerPage(Number(value));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-10 w-[88px] rounded-xl border-border bg-background/50 font-bold text-xs">
                      <SelectValue placeholder="Rows" />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 20, 50].map((option) => (
                        <SelectItem key={option} value={String(option)}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  onClick={async () => {
                    await exportCsv();
                  }}
                  disabled={isExporting}
                  className="h-10 px-4 rounded-xl border-2 border-brand-blue text-brand-blue hover:bg-linear-to-r hover:bg-brand-blue hover:text-primary-foreground font-bold cursor-pointer transition-all duration-300 w-auto shrink-0"
                >
                  <Download className="mr-2 size-4" />
                  Export CSV
                </Button>
              </div>
            </div>
          </div>

          <Table
            rows={rows}
            isLoading={isListLoading}
            page={page}
            perPage={perPage}
            columnOrder={tableColumns}
            id={["id"]}
            slNoCellClassName="font-black text-muted-foreground/40 w-16"
            customActionRender={(row) => {
              const isInactive = row.resolved_status === "INACTIVE";
              return (
                <div className="flex items-center gap-1.5 justify-center">
                  {!isInactive && (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => {
                        const intern = row as unknown as TManageInternItem;
                        setUpdateIntern({
                          id: String(intern.id),
                          name: String(intern.full_name),
                          guild: String(intern.guild ?? ""),
                          status: getEditableStatus(intern),
                          role: intern.role ?? "INTERN",
                        });
                      }}
                      className="rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                      title="Edit Intern"
                    >
                      <Pencil className="size-4" />
                    </Button>
                  )}
                  {isInactive ? (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => {
                        setActivateIntern({
                          id: String(row.id),
                          name: String(row.full_name),
                        });
                      }}
                      className="rounded-md text-success hover:bg-success/10 hover:text-success"
                      title="Activate Intern"
                    >
                      <CheckCircle2 className="size-4 text-success" />
                    </Button>
                  ) : (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => {
                        setDeactivateIntern({
                          id: String(row.id),
                          name: String(row.full_name),
                        });
                      }}
                      className="rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive"
                      title="Deactivate Intern"
                    >
                      <Shield className="size-4 text-destructive" />
                    </Button>
                  )}
                </div>
              );
            }}
          >
            <thead>
              <tr>
                <th className="border-b border-border px-3.5 py-3 text-left text-sm font-bold uppercase tracking-wider w-16 bg-muted/20 h-12 font-black text-[9px] tracking-[0.3em]">
                  Sl.no
                </th>
                {tableColumns.map((col) => (
                  <th
                    key={col.column}
                    className={`border-b border-border px-3.5 py-3 text-left text-sm font-bold tracking-wider bg-muted/20 h-12 font-black uppercase text-[9px] tracking-[0.3em] ${
                      col.isSortable
                        ? "cursor-pointer select-none hover:bg-muted/10 transition-colors"
                        : ""
                    }`}
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
            <div className="p-4 border-t border-border/20">
              <Pagination
                currentPage={page}
                totalPages={displayedTotalPages}
                perPage={perPage}
                totalCount={displayedTotalCount}
                handlePreviousClick={() => setPage((p) => Math.max(1, p - 1))}
                handleNextClick={() =>
                  setPage((p) => Math.min(displayedTotalPages, p + 1))
                }
              />
            </div>
          </Table>
        </div>
      </ErrorBoundary>

      {/* Onboard Intern Dialog */}
      <OnboardDialog
        open={isOnboardOpen}
        onOpenChange={setIsOnboardOpen}
        guildOptions={guildOptions}
      />

      {/* Update Intern Dialog */}
      <UpdateDialog
        open={updateIntern !== null}
        onOpenChange={(open) => {
          if (!open) setUpdateIntern(null);
        }}
        intern={updateIntern}
        guildOptions={guildOptions}
      />

      {/* Deactivate Intern Dialog */}
      <ConfirmDialog
        open={deactivateIntern !== null}
        onOpenChange={(open) => {
          if (!open) setDeactivateIntern(null);
        }}
        title="Deactivate Intern"
        description={`Are you sure you want to deactivate ${deactivateIntern?.name}? This will remove their intern status and set their record to INACTIVE.`}
        confirmLabel="Deactivate"
        variant="destructive"
        isPending={deactivateMutation.isPending}
        onConfirm={() => {
          if (!deactivateIntern?.id) return;
          deactivateMutation.mutate(deactivateIntern.id, {
            onSuccess: () => {
              setDeactivateIntern(null);
            },
          });
        }}
      />

      {/* Activate Intern Dialog */}
      <Dialog
        open={activateIntern !== null}
        onOpenChange={(open) => {
          if (!open) setActivateIntern(null);
        }}
      >
        <DialogContent
          className="w-full max-w-[calc(100%-2rem)] sm:max-w-md border-border/40 bg-card backdrop-blur-xl max-h-[calc(100vh-2rem)] flex flex-col p-4 sm:p-6 rounded-2xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <DialogTitle className="text-lg font-black uppercase tracking-widest text-warning">
                Activate Intern
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm font-medium text-muted-foreground mt-2">
              Are you sure you want to activate {activateIntern?.name}? This
              will set their record to ACTIVE.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 gap-2 flex flex-col-reverse sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setActivateIntern(null)}
              disabled={activateMutation.isPending}
              className="font-bold"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => {
                if (!activateIntern?.id) return;
                activateMutation.mutate(
                  { status: "ACTIVE" },
                  {
                    onSuccess: () => {
                      setActivateIntern(null);
                    },
                  },
                );
              }}
              disabled={activateMutation.isPending}
              className="font-bold"
            >
              {activateMutation.isPending ? "Processing..." : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
