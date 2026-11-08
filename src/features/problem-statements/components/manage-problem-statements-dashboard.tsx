"use client";

import { useQueryClient } from "@tanstack/react-query";
import { LayoutGrid, List, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ApiError } from "@/api/client";
import { SearchBar } from "@/components/dashboard/table/SearchBar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StateDisplay } from "@/components/ui/state-display";
import { useUserInfo } from "@/features/auth";
import { ROLES } from "@/lib/auth/roles";
import {
  MANAGE_SORT_DEFAULT,
  MANAGE_SORT_OPTIONS,
  MANAGE_STATUS_PILLS,
} from "../constants/problem-statement.constants";
import {
  problemStatementKeys,
  useAdminStatements,
  useCompanyStatements,
} from "../hooks";
import type {
  CompanyQueryParams,
  ProblemStatement,
  ProblemStatementStatus,
} from "../types/problem-statement.types";
import { ProblemStatementFormDialog } from "./problem-statement-form-dialog";
import { ProblemStatementsGrid } from "./problem-statements-grid";
import { ProblemStatementsPagination } from "./problem-statements-pagination";
import { ProblemStatementsTable } from "./problem-statements-table";

export default function ManageProblemStatementsDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: userInfo, isLoading: isUserLoading } = useUserInfo();
  const userRoles = (userInfo?.roles as string[]) ?? [];
  const isAdmin = userRoles.includes(ROLES.ADMIN);
  const isCompany = userRoles.includes(ROLES.COMPANY);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>(MANAGE_SORT_DEFAULT);
  const [statusFilter, setStatusFilter] = useState<
    ProblemStatementStatus | "all"
  >("all");
  const [viewMode, setViewMode] = useState<"board" | "table">("board");
  const [showForm, setShowForm] = useState(false);

  const listParams: CompanyQueryParams = {
    pageIndex: page,
    search: search || undefined,
    status: statusFilter,
    sortBy,
    perPage: 12,
  };

  const companyQuery = useCompanyStatements(listParams, {
    enabled: Boolean(userInfo && !isAdmin && isCompany),
  });
  const adminQuery = useAdminStatements(listParams, {
    enabled: Boolean(userInfo && isAdmin),
  });

  const query = isAdmin ? adminQuery : companyQuery;
  const { data, isLoading: isQueryLoading, isError, error } = query;
  const isLoading = isUserLoading || isQueryLoading;

  const statements = data?.data ?? [];
  const is403 = error instanceof ApiError && error.status === 403;
  const is404 =
    error instanceof ApiError &&
    (error.status === 404 ||
      error.message?.toLowerCase().includes("not found"));

  // Summary counts from pagination (crude but avoids an extra endpoint)
  const totalCount = data?.pagination.count ?? null;

  const handleCreate = useCallback(() => setShowForm(true), []);
  const handleView = useCallback(
    (s: ProblemStatement) =>
      router.push(`/dashboard/manage-problem-statements/${s.id}`),
    [router],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Problem Statements
          </h1>
          {totalCount !== null && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {totalCount} statement{totalCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <Button onClick={handleCreate} className="rounded-xl gap-2">
          <Plus className="h-4 w-4" />
          New Problem Statement
        </Button>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        {MANAGE_STATUS_PILLS.map((pill) => (
          <button
            key={pill.value}
            type="button"
            onClick={() => {
              setStatusFilter(pill.value);
              setPage(1);
            }}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
              statusFilter === pill.value
                ? "bg-foreground text-background border-foreground"
                : "bg-card text-muted-foreground border-border hover:bg-muted/50"
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Controls row */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={sortBy}
            onValueChange={(value) => {
              setSortBy(value);
              setPage(1);
            }}
          >
            <SelectTrigger
              className="w-full rounded-full md:w-48"
              aria-label="Sort problem statements"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MANAGE_SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode Toggle: Board vs Table */}
          <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1 border border-border/50">
            <Button
              variant="ghost"
              size="sm"
              aria-label="Switch to board view"
              onClick={() => setViewMode("board")}
              className={`h-8 px-2.5 rounded-lg text-xs font-medium gap-1.5 ${
                viewMode === "board"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Board</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Switch to table view"
              onClick={() => setViewMode("table")}
              className={`h-8 px-2.5 rounded-lg text-xs font-medium gap-1.5 ${
                viewMode === "table"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Table</span>
            </Button>
          </div>
        </div>

        <SearchBar
          onSearch={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search problem statements…"
          size="md"
          showButton={false}
          className="w-full md:max-w-md md:ml-auto"
        />
      </div>

      {/* Grid or Table View */}
      {isLoading ? (
        viewMode === "board" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        ) : (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        )
      ) : is403 ? (
        <StateDisplay
          variant="not-found"
          className="rounded-2xl border border-dashed border-border bg-muted/40 py-12"
          title="Access Restricted"
          description="You don't have permission to manage problem statements. Only the verified company owner can access this."
        />
      ) : isError && !is404 ? (
        <StateDisplay
          variant="no-results"
          className="rounded-2xl border border-dashed border-border bg-muted/40 py-12"
          title="Failed to load problem statements"
          description="Something went wrong while fetching your problem statements. Please try again."
          action={
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: problemStatementKeys.all,
                })
              }
            >
              Retry
            </Button>
          }
        />
      ) : (
        <>
          {viewMode === "board" ? (
            <ProblemStatementsGrid
              statements={statements}
              isManageView
              onCreateStatement={handleCreate}
              onView={handleView}
              emptyTitle={
                statusFilter === "all"
                  ? "No problem statements yet"
                  : `No ${statusFilter} statements`
              }
              emptyDescription={
                statusFilter === "all"
                  ? "Create your first problem statement to start connecting with learners."
                  : "No problem statements match the current filter."
              }
            />
          ) : (
            <ProblemStatementsTable
              statements={statements}
              isManageView
              onView={handleView}
              emptyTitle={
                statusFilter === "all"
                  ? "No problem statements yet"
                  : `No ${statusFilter} statements`
              }
              emptyDescription={
                statusFilter === "all"
                  ? "Create your first problem statement to start connecting with learners."
                  : "No problem statements match the current filter."
              }
            />
          )}
          {data?.pagination && data.pagination.count > 0 && (
            <ProblemStatementsPagination
              pagination={data.pagination}
              currentPage={page}
              onPageChange={setPage}
              currentCount={statements.length}
            />
          )}
        </>
      )}

      {/* Form dialog */}
      <ProblemStatementFormDialog
        open={showForm}
        mode={isAdmin ? "admin-create" : "company-create"}
        onClose={() => {
          setShowForm(false);
          queryClient.invalidateQueries({
            queryKey: isAdmin
              ? problemStatementKeys.admin()
              : problemStatementKeys.company(),
          });
        }}
        onSuccess={() => {
          setShowForm(false);
          queryClient.invalidateQueries({
            queryKey: isAdmin
              ? problemStatementKeys.admin()
              : problemStatementKeys.company(),
          });
        }}
      />
    </div>
  );
}
