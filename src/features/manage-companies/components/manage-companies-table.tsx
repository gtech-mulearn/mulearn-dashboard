"use client";

import { CheckCircle, Eye, XCircle } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import Pagination from "@/components/dashboard/table/pagination";
import Table, { type Data } from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatShortDate } from "@/lib/datetime";
import { useCompanyVerificationList } from "../hooks/use-manage-companies";
import type { CompanyStatus, CompanyVerificationItem } from "../schemas";
import { CompanyDetailSheet } from "./company-detail-sheet";
import { VerificationActionDialog } from "./verification-action-dialog";
import { RowActionButton } from "@/components/dashboard/table/row-action-button";

// ─── Constants ────────────────────────────────────────────────────────────────

// Values must match what the backend stores in company.status
// (enum 'pending','verified','rejected'). "all" sends no status filter.
const STATUS_TABS = [
  { label: "Pending", value: "pending" },
  { label: "Verified", value: "verified" },
  { label: "Rejected", value: "rejected" },
  { label: "All", value: "all" },
] as const;

type StatusTab = (typeof STATUS_TABS)[number]["value"];

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

export function buildColumnOrder(
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
      isSortable: true,
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
      isSortable: true,
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
      // Format from the raw row value: Table passes wrap() an en-US string,
      // and the other verification tabs use formatShortDate.
      wrap: (
        _data: string | React.ReactElement,
        _id: string,
        row: Record<string, unknown>,
      ) => (
        <span className="text-sm text-muted-foreground">
          {formatShortDate(row.verification_requested_at as string | null)}
        </span>
      ),
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
        const isPending = (row.status as CompanyStatus) === "pending";
        return (
          <div className="flex items-center gap-1">
            <RowActionButton
              icon={Eye}
              label="View"
              onClick={() => onView(id)}
            />
            {isPending && (
              <>
                <RowActionButton
                  icon={CheckCircle}
                  label="Approve"
                  tone="success"
                  onClick={() => onApproveRow(id)}
                />
                <RowActionButton
                  icon={XCircle}
                  label="Reject"
                  tone="destructive"
                  onClick={() => onRejectRow(id)}
                />
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
  const [statusFilter, setStatusFilter] = useState<StatusTab>("pending");

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
    status: statusFilter === "all" ? "" : statusFilter,
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

  // asc → desc → off, matching the other verification tables
  const handleSortChange = (column: string) => {
    setCurrentPage(1);
    setSort((prev) =>
      prev === column ? `-${column}` : prev === `-${column}` ? "" : column,
    );
  };

  const handleStatusFilterChange = (value: string) => {
    setCurrentPage(1);
    setStatusFilter(value as StatusTab);
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

  return (
    <>
      <Card className="overflow-visible rounded-none border-0 bg-transparent shadow-none">
        <CardContent className="space-y-6 bg-transparent p-0">
          {/* Status tabs — same pattern as the other verification pages */}
          <Tabs
            value={statusFilter}
            onValueChange={handleStatusFilterChange}
            className="w-full"
          >
            <TabsList className="bg-muted border border-border/60">
              {STATUS_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:bg-background"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <TableTop
            onSearchText={handleSearch}
            onPerPageNumber={handlePerPageNumber}
            perPage={perPage}
            perPageOptions={[10, 20, 50, 100]}
            CSV=""
            searchPlaceholder="Search by name, email, or industry…"
            searchSize="md"
            searchPosition="right"
            searchWrapperClassName="md:max-w-[680px]"
            searchFieldWrapperClassName="lg:max-w-[380px]"
            searchInputClassName="h-10 text-sm"
          />

          <Table
            rows={rows as unknown as Data[]}
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
