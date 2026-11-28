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
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Pagination from "@/components/dashboard/table/pagination";
import Table, { type Data } from "@/components/dashboard/table/Table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { TManageInternItem, TTeamRef } from "@/features/intern";
import {
  formatDateOnly,
  InternDetailDialog,
  InternsStats,
  OnboardDialog,
  ReasonDialog,
  ReassignDialog,
  TeamBadge,
  TeamFilterSelect,
  UpdateDialog,
  useDeactivateIntern,
  useExportInterns,
  useIsInternAdmin,
  useManageInternsList,
  useUpdateIntern,
} from "@/features/intern";
import { useDebounce } from "@/hooks/use-debounce";

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

export function ManageInternsPageClient() {
  const isAdmin = useIsInternAdmin();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(
    undefined,
  );

  const debouncedSearch = useDebounce(searchText, 300);

  // Dialog & Modal states (interns are keyed by user id)
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const [updateIntern, setUpdateIntern] = useState<TManageInternItem | null>(
    null,
  );
  const [deactivateIntern, setDeactivateIntern] =
    useState<TManageInternItem | null>(null);
  const [activateIntern, setActivateIntern] =
    useState<TManageInternItem | null>(null);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [reassignOpen, setReassignOpen] = useState(false);

  const filters = {
    status: statusFilter === "all" ? undefined : statusFilter,
    team_id: teamFilter === "ALL" ? undefined : teamFilter,
  };

  // Queries & Mutations
  const { data: listData, isLoading: isListLoading } = useManageInternsList({
    page,
    perPage,
    search: debouncedSearch || undefined,
    ...filters,
    sortBy,
    sortOrder,
  });

  const toggleSelected = useCallback(
    (userId: string) =>
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(userId)) next.delete(userId);
        else next.add(userId);
        return next;
      }),
    [],
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

  const deactivateMutation = useDeactivateIntern();
  const activateMutation = useUpdateIntern(activateIntern?.user || "");
  const { mutateAsync: exportCsv, isPending: isExporting } = useExportInterns();

  const rows = useMemo(() => {
    let data = listData?.data ?? [];
    // Role has no server filter; filters the current page only.
    if (roleFilter !== "all") {
      data = data.filter(
        (item) => (item.is_lead ? "INTERN_LEAD" : "INTERN") === roleFilter,
      );
    }
    return data as unknown as Data[];
  }, [listData, roleFilter]);

  const totalPages = listData?.pagination?.totalPages ?? 1;
  const totalCount = listData?.pagination?.count ?? 0;

  const isClientFiltered = roleFilter !== "all";
  const displayedTotalCount = isClientFiltered ? rows.length : totalCount;
  const displayedTotalPages = isClientFiltered
    ? Math.ceil(rows.length / perPage) || 1
    : totalPages;

  const tableColumns = useMemo(() => {
    return [
      ...(isAdmin
        ? [
            {
              column: "select",
              Label: "",
              isSortable: false,
              wrap: (_data: string, _id: string, row: Data) => (
                <Checkbox
                  aria-label={`Select ${row.full_name}`}
                  checked={selected.has(String(row.user))}
                  onCheckedChange={() => toggleSelected(String(row.user))}
                />
              ),
            },
          ]
        : []),
      {
        column: "full_name",
        Label: "Intern Name",
        isSortable: true,
        wrap: (data: string, _id: string, row: Data) => (
          <button
            type="button"
            onClick={() => setDetailUserId(String(row.user))}
            className="flex flex-col text-left hover:underline"
          >
            <span className="font-bold text-foreground uppercase tracking-tight text-sm">
              {data}
            </span>
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mt-1">
              {row.muid as string}
            </span>
          </button>
        ),
      },
      {
        column: "team",
        Label: "Team",
        isSortable: false,
        wrap: (_data: string, _id: string, row: Data) => (
          <TeamBadge team={row.team as unknown as TTeamRef | null} />
        ),
      },
      {
        column: "is_lead",
        Label: "Role",
        isSortable: false,
        wrap: (_data: string, _id: string, row: Data) =>
          row.is_lead ? (
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
        column: "status",
        Label: "Status",
        isSortable: true,
        wrap: (data: string, _id: string, row: Data) => (
          <span title={row.status_reason ? String(row.status_reason) : ""}>
            {getStatusBadge(data)}
          </span>
        ),
      },
      {
        column: "join_date",
        Label: "Tenure",
        isSortable: false,
        wrap: (_data: string, _id: string, row: Data) => (
          <div className="flex flex-col text-xs font-bold text-foreground">
            <span>
              {row.join_date ? formatDateOnly(String(row.join_date)) : "—"} –{" "}
              {row.end_date ? formatDateOnly(String(row.end_date)) : "—"}
            </span>
            {row.days_left !== null && row.days_left !== undefined && (
              <span className="text-[10px] text-muted-foreground">
                {String(row.days_left)} days left
              </span>
            )}
          </div>
        ),
      },
    ];
  }, [isAdmin, selected, toggleSelected]);

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
          <Link href="/dashboard/management/manage-interns/timesheets">
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
          <Link href="/dashboard/management/manage-interns/teams">
            <Button
              size="lg"
              variant="default"
              className="gap-2 text-xs tracking-widest shadow-lg"
            >
              <Users className="w-4 h-4" />
              Teams
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

                <TeamFilterSelect
                  value={teamFilter}
                  onChange={(v) => {
                    setTeamFilter(v);
                    setPage(1);
                  }}
                  className="w-full sm:w-[160px] h-10 font-black uppercase text-[10px] tracking-widest border-border/40 bg-card/40"
                />

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

                {isAdmin && selected.size > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setReassignOpen(true)}
                    className="h-10 px-4 rounded-xl font-bold shrink-0"
                  >
                    Reassign ({selected.size})
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={async () => {
                    await exportCsv(filters);
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
            id={["user"]}
            slNoCellClassName="font-black text-muted-foreground/40 w-16"
            customActionRender={(row) => {
              const intern = row as unknown as TManageInternItem;
              // INACTIVE = still a member, marked inactive (reactivate via status).
              const isInactive = intern.status === "INACTIVE";
              return (
                <div className="flex items-center gap-1.5 justify-center">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setUpdateIntern(intern)}
                    className="rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    title="Edit Intern"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  {isInactive && (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => setActivateIntern(intern)}
                      className="rounded-md text-success hover:bg-success/10 hover:text-success"
                      title="Set Active"
                    >
                      <CheckCircle2 className="size-4 text-success" />
                    </Button>
                  )}
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setDeactivateIntern(intern)}
                    className="rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive"
                    title="Remove from program"
                  >
                    <Shield className="size-4 text-destructive" />
                  </Button>
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
      <OnboardDialog open={isOnboardOpen} onOpenChange={setIsOnboardOpen} />

      <UpdateDialog
        open={updateIntern !== null}
        onOpenChange={(open) => {
          if (!open) setUpdateIntern(null);
        }}
        intern={updateIntern}
      />

      <InternDetailDialog
        userId={detailUserId}
        onClose={() => setDetailUserId(null)}
      />

      <ReassignDialog
        userIds={[...selected]}
        open={reassignOpen}
        onOpenChange={setReassignOpen}
        onDone={() => {
          setReassignOpen(false);
          setSelected(new Set());
        }}
      />

      {/* Remove from program (DELETE): ends membership + intern roles */}
      <ReasonDialog
        open={deactivateIntern !== null}
        onOpenChange={(open) => {
          if (!open) setDeactivateIntern(null);
        }}
        title="Remove Intern"
        description={`Remove ${deactivateIntern?.full_name} from the program? Their membership ends and both intern roles are removed. Onboard them again to bring them back.`}
        confirmLabel="Remove"
        destructive
        isPending={deactivateMutation.isPending}
        onConfirm={(reason) => {
          if (!deactivateIntern) return;
          deactivateMutation.mutate(
            { userId: deactivateIntern.user, reason },
            { onSuccess: () => setDeactivateIntern(null) },
          );
        }}
      />

      <ReasonDialog
        open={activateIntern !== null}
        onOpenChange={(open) => {
          if (!open) setActivateIntern(null);
        }}
        title="Set Active"
        description={`Set ${activateIntern?.full_name} back to ACTIVE.`}
        confirmLabel="Set Active"
        isPending={activateMutation.isPending}
        onConfirm={(reason) => {
          activateMutation.mutate(
            { status: "ACTIVE", reason },
            { onSuccess: () => setActivateIntern(null) },
          );
        }}
      />
    </div>
  );
}
