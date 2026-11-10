"use client";

import { ArrowUpDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ApiError } from "@/api/client";
import { SearchBar } from "@/components/dashboard/table/SearchBar";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StateDisplay } from "@/components/ui/state-display";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserInfo } from "@/features/auth";
import { ROLES } from "@/lib/auth/roles";
import {
  MANAGE_SORT_DEFAULT,
  MANAGE_SORT_OPTIONS,
  MANAGE_STATUS_PILLS,
} from "../constants/problem-statement.constants";
import { useAdminStatements, useCompanyStatements } from "../hooks";
import type {
  CompanyQueryParams,
  ProblemStatement,
  ProblemStatementStatus,
  ProblemStatementViewMode,
} from "../types/problem-statement.types";
import { ProblemStatementFormDialog } from "./problem-statement-form-dialog";
import {
  ProblemStatementsGrid,
  ProblemStatementsListSkeleton,
} from "./problem-statements-grid";
import { ProblemStatementsPagination } from "./problem-statements-pagination";
import { ProblemStatementsTable } from "./problem-statements-table";
import { ProblemStatementsViewToggle } from "./problem-statements-view-toggle";

const PER_PAGE = 12;

export default function ManageProblemStatementsDashboard() {
  const router = useRouter();
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
  const [viewMode, setViewMode] = useState<ProblemStatementViewMode>("board");
  const [showForm, setShowForm] = useState(false);

  const listParams: CompanyQueryParams = {
    pageIndex: page,
    perPage: PER_PAGE,
    search: search || undefined,
    status: statusFilter,
    sortBy,
  };

  const companyQuery = useCompanyStatements(listParams, {
    enabled: Boolean(userInfo && !isAdmin && isCompany),
  });
  const adminQuery = useAdminStatements(listParams, {
    enabled: Boolean(userInfo && isAdmin),
  });
  const query = isAdmin ? adminQuery : companyQuery;
  const { data, isLoading: isQueryLoading, isError, error, refetch } = query;
  const isLoading = isUserLoading || isQueryLoading;

  const statements = data?.data ?? [];
  const is403 = error instanceof ApiError && error.status === 403;
  const is404 =
    error instanceof ApiError &&
    (error.status === 404 ||
      error.message?.toLowerCase().includes("not found"));

  const handleCreate = useCallback(() => setShowForm(true), []);
  const handleView = useCallback(
    (s: ProblemStatement) =>
      router.push(`/dashboard/manage-problem-statements/${s.id}`),
    [router],
  );
  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const isUnfiltered = statusFilter === "all" && !search;
  const statusLabel = MANAGE_STATUS_PILLS.find(
    (p) => p.value === statusFilter,
  )?.label.toLowerCase();
  const empty = isUnfiltered
    ? {
        title: "No problem statements yet",
        description:
          "Create a problem statement, publish it, and learners can start working on it.",
        action: (
          <Button onClick={handleCreate}>
            <Plus />
            New Problem Statement
          </Button>
        ),
      }
    : {
        title: search
          ? "No matching problem statements"
          : `No ${statusLabel} problem statements`,
        description: search
          ? "Try a different search term or status."
          : "Statements with this status will appear here.",
        action: undefined,
      };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Problem Statements"
        description={
          isAdmin
            ? "Every problem statement on µLearn — company-posted and µLearn-authored."
            : "Create problem statements, publish them to learners, and review submissions."
        }
        action={
          <Button onClick={handleCreate}>
            <Plus />
            New Problem Statement
          </Button>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as ProblemStatementStatus | "all");
            setPage(1);
          }}
        >
          <TabsList>
            {MANAGE_STATUS_PILLS.map((pill) => (
              <TabsTrigger key={pill.value} value={pill.value}>
                {pill.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap items-center gap-2">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search problem statements…"
            size="sm"
            showButton={false}
            className="w-full sm:w-64"
          />
          <Select
            value={sortBy}
            onValueChange={(value) => {
              setSortBy(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-auto min-w-40" aria-label="Sort by">
              <ArrowUpDown />
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {MANAGE_SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ProblemStatementsViewToggle
            value={viewMode}
            onChange={setViewMode}
          />
        </div>
      </div>

      {isLoading ? (
        <ProblemStatementsListSkeleton viewMode={viewMode} />
      ) : is403 ? (
        <StateDisplay
          variant="not-found"
          title="You can't manage problem statements"
          description="Only verified company owners and admins can create and manage problem statements."
        />
      ) : isError && !is404 ? (
        <StateDisplay
          variant="no-results"
          title="Couldn't load problem statements"
          description="Something went wrong while fetching your problem statements."
          action={
            <Button variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          }
        />
      ) : (
        <>
          {viewMode === "board" ? (
            <ProblemStatementsGrid
              statements={statements}
              isManageView
              onView={handleView}
              emptyTitle={empty.title}
              emptyDescription={empty.description}
              emptyAction={empty.action}
            />
          ) : (
            <ProblemStatementsTable
              statements={statements}
              isManageView
              onView={handleView}
              emptyTitle={empty.title}
              emptyDescription={empty.description}
              emptyAction={empty.action}
            />
          )}
          <ProblemStatementsPagination
            pagination={data?.pagination}
            currentPage={page}
            perPage={PER_PAGE}
            onPageChange={setPage}
          />
        </>
      )}

      <ProblemStatementFormDialog
        open={showForm}
        mode={isAdmin ? "admin-create" : "company-create"}
        onClose={() => setShowForm(false)}
        onSuccess={(created) => {
          setShowForm(false);
          router.push(`/dashboard/manage-problem-statements/${created.id}`);
        }}
      />
    </div>
  );
}
