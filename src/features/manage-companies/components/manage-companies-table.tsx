"use client";

import {
  Building2,
  CheckCircle,
  ChevronDown,
  Eye,
  Filter,
  XCircle,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import Pagination from "@/components/dashboard/table/pagination";
import Table from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCompanyVerificationList } from "../hooks/use-manage-companies";
import type { CompanyStatus, CompanyVerificationItem } from "../schemas";
import { CompanyDetailSheet } from "./company-detail-sheet";
import { VerificationActionDialog } from "./verification-action-dialog";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Pending Verification", value: "pending_verification" },
  { label: "Active", value: "active" },
  { label: "Rejected", value: "rejected" },
  { label: "Inactive", value: "inactive" },
];

const STATUS_CONFIG: Record<
  CompanyStatus | "",
  { label: string; className: string }
> = {
  "": {
    label: "Pending",
    className: "border-warning/50 bg-warning/10 text-warning",
  },
  pending_verification: {
    label: "Pending",
    className: "border-warning/50 bg-warning/10 text-warning",
  },
  pending: {
    label: "Pending",
    className: "border-warning/50 bg-warning/10 text-warning",
  },
  verified: {
    label: "Verified",
    className: "border-success/50 bg-success/10 text-success",
  },
  active: {
    label: "Active",
    className: "border-success/50 bg-success/10 text-success",
  },
  rejected: {
    label: "Rejected",
    className: "border-destructive/50 bg-destructive/10 text-destructive",
  },
  inactive: {
    label: "Inactive",
    className: "border-border bg-muted text-muted-foreground",
  },
};

// ─── Column Builder ───────────────────────────────────────────────────────────

function buildColumnOrder(
  onView: (id: string | number | boolean) => void,
  onApproveRow: (id: string | number | boolean) => void,
  onRejectRow: (id: string | number | boolean) => void,
) {
  return [
    {
      column: "name",
      Label: "Company",
      isSortable: true,
      width: "min-w-[180px]",
    },
    {
      column: "company_user_name",
      Label: "POC",
      isSortable: false,
      width: "min-w-[140px] hidden md:table-cell",
      wrap: (data: string | React.ReactElement) => (
        <span className="text-sm text-muted-foreground">{data || "—"}</span>
      ),
    },
    {
      column: "industry_sector",
      Label: "Industry",
      isSortable: false,
      width: "min-w-[130px] hidden lg:table-cell",
      wrap: (data: string | React.ReactElement) => (
        <span className="text-sm text-muted-foreground">{data || "—"}</span>
      ),
    },
    {
      column: "location",
      Label: "Location",
      isSortable: false,
      width: "min-w-[140px] hidden xl:table-cell",
      wrap: (data: string | React.ReactElement) => (
        <span className="text-sm text-muted-foreground">{data || "—"}</span>
      ),
    },
    {
      column: "status",
      Label: "Status",
      isSortable: false,
      width: "min-w-[140px]",
      wrap: (data: string | React.ReactElement) => {
        const status = data as CompanyStatus;
        const config = STATUS_CONFIG[status];
        if (!config) return <span className="text-sm">{data}</span>;
        return (
          <Badge variant="outline" className={config.className}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      column: "verification_requested_at",
      Label: "Requested",
      isSortable: true,
      width: "min-w-[140px] hidden lg:table-cell",
    },
    {
      column: "id",
      Label: "Actions",
      isSortable: false,
      width: "w-36 min-w-[144px]",
      wrap: (
        _data: string | React.ReactElement,
        id: string,
        row: Record<string, unknown>,
      ) => {
        const status = row.status as CompanyStatus;
        const isPending =
          status === "pending_verification" ||
          (status as string) === "pending" ||
          !status;
        return (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onView(id)}
              className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 h-7"
              title="View details"
              aria-label="View company details"
            >
              <Eye className="h-3 w-3" />
              <span className="hidden sm:inline">View</span>
            </Button>
            {isPending && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onApproveRow(id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-success/40 bg-success/10 px-2 py-1 text-xs font-semibold text-success transition-colors hover:bg-success/20 h-7"
                  title="Verify"
                  aria-label="Verify company"
                >
                  <CheckCircle className="h-3 w-3" />
                  <span className="hidden sm:inline">Verify</span>
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onRejectRow(id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 bg-destructive/10 px-2 py-1 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20 h-7"
                  title="Reject"
                  aria-label="Reject company"
                >
                  <XCircle className="h-3 w-3" />
                  <span className="hidden sm:inline">Reject</span>
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ManageCompaniesTable() {
  // ── Table state ──────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sort, setSort] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // ── Dialog / Sheet state ──────────────────────────────────────
  const [detailOpen, setDetailOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] =
    useState<CompanyVerificationItem | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");

  // ── Data ──────────────────────────────────────────────────────
  const { data, isLoading } = useCompanyVerificationList({
    pageIndex: currentPage,
    perPage,
    search,
    sortBy: sort,
    status: statusFilter,
  });

  const rows = (data?.data ?? []) as CompanyVerificationItem[];
  const totalPages = data?.pagination?.totalPages ?? 0;
  const totalCount = data?.pagination?.count;

  // ── Handlers ──────────────────────────────────────────────────

  const handleSearch = (value: string) => {
    setCurrentPage(1);
    setSearch(value);
  };

  const handlePerPageNumber = (value: number) => {
    setCurrentPage(1);
    setPerPage(value);
  };

  const handleSortChange = (column: string) => {
    setCurrentPage(1);
    setSort((prev) => (prev === column ? `-${column}` : column));
  };

  const handleStatusFilterChange = (value: string) => {
    setCurrentPage(1);
    setStatusFilter(value);
  };

  const handleViewRow = useCallback(
    (id: string | number | boolean) => {
      const company = rows.find((r) => r.id === String(id)) ?? null;
      setSelectedCompany(company);
      setDetailOpen(true);
    },
    [rows],
  );

  const handleApproveRow = useCallback(
    (id: string | number | boolean) => {
      const company = rows.find((r) => r.id === String(id)) ?? null;
      setSelectedCompany(company);
      setActionType("approve");
      setActionDialogOpen(true);
    },
    [rows],
  );

  const handleRejectRow = useCallback(
    (id: string | number | boolean) => {
      const company = rows.find((r) => r.id === String(id)) ?? null;
      setSelectedCompany(company);
      setActionType("reject");
      setActionDialogOpen(true);
    },
    [rows],
  );

  const handleApproveFromSheet = (company: CompanyVerificationItem) => {
    setSelectedCompany(company);
    setActionType("approve");
    setActionDialogOpen(true);
  };

  const handleRejectFromSheet = (company: CompanyVerificationItem) => {
    setSelectedCompany(company);
    setActionType("reject");
    setActionDialogOpen(true);
  };

  const columnOrder = useMemo(
    () => buildColumnOrder(handleViewRow, handleApproveRow, handleRejectRow),
    [handleViewRow, handleApproveRow, handleRejectRow],
  );

  // ── Active filter label ───────────────────────────────────────
  const activeFilterLabel =
    STATUS_FILTER_OPTIONS.find((o) => o.value === statusFilter)?.label ?? "All";

  return (
    <>
      <Card className="overflow-visible rounded-none border-0 bg-transparent shadow-none">
        <CardHeader className="px-0 py-0 sm:px-0 sm:py-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/6 px-3 py-1 text-xs font-semibold text-primary">
                <Building2 className="size-3.5" />
                Management
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Manage Companies
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 bg-transparent p-0 pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <TableTop
                onSearchText={handleSearch}
                onPerPageNumber={handlePerPageNumber}
                perPage={perPage}
                perPageOptions={[10, 20, 50, 100]}
                CSV=""
                searchPlaceholder="Search by name, email, location…"
                searchSize="md"
                searchPosition="right"
                searchWrapperClassName="md:max-w-[680px]"
                searchFieldWrapperClassName="lg:max-w-[380px]"
                searchInputClassName="h-10 text-sm"
              />
            </div>

            {/* Status filter dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-xl whitespace-nowrap"
                >
                  <Filter className="h-3.5 w-3.5" />
                  {activeFilterLabel}
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {STATUS_FILTER_OPTIONS.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    onClick={() => handleStatusFilterChange(opt.value)}
                    className={
                      statusFilter === opt.value ? "font-semibold" : ""
                    }
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Responsive table wrapper */}
          <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <div className="min-w-200">
              <Table
                rows={rows as any}
                isLoading={isLoading}
                page={currentPage}
                perPage={perPage}
                columnOrder={columnOrder}
                id={["id"]}
              >
                <THead
                  columnOrder={columnOrder}
                  onIconClick={handleSortChange}
                  action={false}
                />
                <div>
                  {!isLoading && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      handleNextClick={() =>
                        setCurrentPage((p) => Math.min(p + 1, totalPages || 1))
                      }
                      handlePreviousClick={() =>
                        setCurrentPage((p) => Math.max(p - 1, 1))
                      }
                      perPage={perPage}
                      totalCount={totalCount}
                    />
                  )}
                </div>
                <div />
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company detail sheet */}
      <CompanyDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        company={selectedCompany}
        onApprove={handleApproveFromSheet}
        onReject={handleRejectFromSheet}
      />

      {/* Approve / Reject confirmation dialog */}
      <VerificationActionDialog
        open={actionDialogOpen}
        onOpenChange={setActionDialogOpen}
        company={selectedCompany}
        action={actionType}
      />
    </>
  );
}
