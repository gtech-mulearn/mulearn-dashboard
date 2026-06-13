"use client";

import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  PauseCircle,
  Pencil,
  Plus,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Pagination from "@/components/dashboard/table/pagination";
import Table, { type Data } from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SectionErrorFallback } from "@/components/ui/errors/SectionErrorFallback";
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
} from "@/features/intern";
import type { TManageInternItem } from "@/features/intern/types";
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

const DEFAULT_GUILDS = [
  "DESIGN",
  "FRONTEND",
  "BACKEND",
  "MOBILE",
  "DEVOPS",
  "QA",
  "PM",
];

export default function ManageInternsPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(
    undefined,
  );

  const debouncedSearch = useDebounce(searchText, 500);

  // Dialog & Modal states
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const [updateIntern, setUpdateIntern] = useState<{
    id: string;
    name: string;
    guild: string;
    status: string;
  } | null>(null);
  const [deactivateIntern, setDeactivateIntern] = useState<{
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
  const { mutateAsync: exportCsv, isPending: isExporting } = useExportInterns();

  const rows = useMemo(() => {
    const data = (listData?.data ?? []) as unknown as TManageInternItem[];
    if (statusFilter === "all") return data as unknown as Data[];
    return data.filter(
      (item) => item.status?.toUpperCase() === statusFilter.toUpperCase(),
    ) as unknown as Data[];
  }, [listData, statusFilter]);

  const totalPages = listData?.pagination?.totalPages ?? 1;
  const totalCount = listData?.pagination?.count ?? 0;

  const isBackendFiltered = useMemo(() => {
    if (statusFilter === "all" || !listData?.data) return true;
    return (listData.data as any[]).every(
      (item) => item.status?.toUpperCase() === statusFilter.toUpperCase(),
    );
  }, [listData, statusFilter]);

  const displayedTotalCount = isBackendFiltered ? totalCount : rows.length;
  const displayedTotalPages = isBackendFiltered
    ? totalPages
    : Math.ceil(rows.length / perPage) || 1;

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
            className="font-bold uppercase text-muted-foreground/80 tracking-wider"
          >
            {data}
          </Badge>
        ),
      },
      {
        column: "status",
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
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto w-full bg-background/50">
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
            onClick={() => setIsOnboardOpen(true)}
            variant="default"
            className="gap-2 text-[10px] tracking-widest h-10 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Onboard Intern
          </Button>
          <Link href="/dashboard/management/manage-interns/timesheet-reviews">
            <Button
              variant="default"
              className="gap-2 text-[10px] tracking-widest h-10 shadow-lg"
            >
              <CheckCircle2 className="w-4 h-4" />
              Timesheets
            </Button>
          </Link>
          <Link href="/dashboard/management/manage-interns/leave-reviews">
            <Button
              variant="default"
              className="gap-2 text-[10px] tracking-widest h-10 shadow-lg"
            >
              <Calendar className="w-4 h-4" />
              Leaves
            </Button>
          </Link>
          <Link href="/dashboard/management/manage-interns/intern-report">
            <Button
              variant="default"
              className="gap-2 text-[10px] tracking-widest h-10 shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              Reports
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
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black uppercase tracking-widest">
                Intern Directory
              </h3>
              <p className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-wider">
                Manage profiles and track progress
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[180px] h-10 font-black uppercase text-[10px] tracking-widest border-border/40 bg-card/40">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-xl border-border/60">
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
            </div>
          </div>

          <TableTop
            onSearchText={(val) => {
              setSearchText(val);
              setPage(1);
            }}
            onPerPageNumber={(val) => {
              setPerPage(val);
              setPage(1);
            }}
            CSV="interns.csv"
            perPage={perPage}
            perPageOptions={[10, 20, 50]}
            searchPlaceholder="Search heroes..."
            searchSize="md"
            searchPosition="left"
            searchWrapperClassName="bg-card/40 border-border/40"
            onCsvDownload={async () => {
              await exportCsv();
            }}
            isCsvDownloading={isExporting}
          />

          <Table
            rows={rows}
            isloading={isListLoading}
            page={page}
            perPage={perPage}
            columnOrder={tableColumns}
            id={["id"]}
            slNoCellClassName="font-black text-muted-foreground/40 w-16"
            customActionRender={(row) => (
              <div className="flex items-center gap-1.5 justify-center">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => {
                    setUpdateIntern({
                      id: String(row.id),
                      name: String(row.full_name),
                      guild: String(row.guild ?? ""),
                      status: String(row.status ?? "ACTIVE"),
                    });
                  }}
                  className="rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  title="Edit Intern"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => {
                    setDeactivateIntern({
                      id: String(row.id),
                      name: String(row.full_name),
                    });
                  }}
                  className="rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  title="Deactivate Intern"
                >
                  <Shield className="size-4" />
                </Button>
              </div>
            )}
          >
            <THead
              columnOrder={tableColumns}
              onIconClick={handleSort}
              action={true}
              thClassName="bg-muted/20 border-b border-border/20 h-12 font-black uppercase text-[9px] tracking-[0.3em]"
            />
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
    </div>
  );
}
