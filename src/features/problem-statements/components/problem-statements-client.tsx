"use client";

import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Plus } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StateDisplay } from "@/components/ui/state-display";
import { useUserInfo } from "@/features/auth";
import { authStore } from "@/lib/auth";
import { ROLES } from "@/lib/auth/roles";
import {
  CATEGORY_SUGGESTIONS,
  FEED_SORT_DEFAULT,
} from "../constants/problem-statement.constants";
import {
  problemStatementKeys,
  usePersonalProblemStatementsFeed,
  useProblemStatementFeed,
} from "../hooks";
import type {
  FeedQueryParams,
  FeedStatusFilter,
  ProblemStatement,
} from "../types/problem-statement.types";
import { ProblemStatementDetailModal } from "./problem-statement-detail-modal";
import { ProblemStatementFormDialog } from "./problem-statement-form-dialog";
import { ProblemStatementsFilters } from "./problem-statements-filters";
import { ProblemStatementsGrid } from "./problem-statements-grid";
import { ProblemStatementsPagination } from "./problem-statements-pagination";
import { ProblemStatementsTable } from "./problem-statements-table";

export function ProblemStatementsClient() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FeedStatusFilter>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>(FEED_SORT_DEFAULT);
  const [viewMode, setViewMode] = useState<"board" | "table">("board");

  // Dialog states
  const [selectedStatement, setSelectedStatement] =
    useState<ProblemStatement | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Auth & Roles
  const isAuthenticated =
    typeof window !== "undefined" ? authStore.isAuthenticated() : false;
  const { data: userInfo } = useUserInfo();
  const userRoles = (userInfo?.roles as string[]) ?? [];
  const isAdmin = userRoles.includes(ROLES.ADMIN);
  const canManage =
    userRoles.includes(ROLES.COMPANY) || isAdmin || Boolean(userInfo?.company);

  const isPersonalTab =
    statusFilter === "trying" || statusFilter === "submitted";

  // 1. General browsing query params (server-side paging: 12 per page)
  const feedParams: FeedQueryParams = {
    pageIndex: currentPage,
    perPage: 12,
    search: search || undefined,
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    open_only: statusFilter === "open" ? true : undefined,
    sortBy,
  };

  // General browsing query ("All Challenges" & "Open Submissions")
  const {
    data: feedData,
    isLoading: isFeedLoading,
    isError: isFeedError,
    refetch: refetchFeed,
  } = useProblemStatementFeed(feedParams, { enabled: !isPersonalTab });

  // 2. Personal interaction query ("I'm Trying" & "Submitted")
  // Fetches full platform catalog across pages so no joined challenge is ever missed
  const personalParams = useMemo(
    () => ({
      search: search || undefined,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      sortBy,
    }),
    [search, selectedCategory, sortBy],
  );

  const {
    data: personalData,
    isLoading: isPersonalLoading,
    isError: isPersonalError,
    refetch: refetchPersonal,
  } = usePersonalProblemStatementsFeed(personalParams, {
    enabled: isPersonalTab && isAuthenticated,
  });

  const isLoading = isPersonalTab ? isPersonalLoading : isFeedLoading;
  const isError = isPersonalTab ? isPersonalError : isFeedError;
  const refetch = isPersonalTab ? refetchPersonal : refetchFeed;

  // General browsing statements: server returns 12 items.
  // Silently move closed submissions to the back of the current page for "all"
  const generalStatements = useMemo(() => {
    const list = feedData?.data ?? [];
    if (statusFilter !== "all") return list;
    return [...list].sort((a, b) => {
      const aOpen = Boolean(a.is_open);
      const bOpen = Boolean(b.is_open);
      if (aOpen !== bOpen) {
        return aOpen ? -1 : 1;
      }
      return 0;
    });
  }, [feedData?.data, statusFilter]);

  // Personal tabs statements: filter the full set, sort open first, and slice 12 per page
  const personalMatchingStatements = useMemo(() => {
    if (!isPersonalTab) return [];
    const list = personalData ?? [];
    const filtered = list.filter((s) =>
      statusFilter === "trying"
        ? s.my_interaction === "Trying"
        : s.my_interaction === "Submitted",
    );
    return [...filtered].sort((a, b) => {
      const aOpen = Boolean(a.is_open);
      const bOpen = Boolean(b.is_open);
      if (aOpen !== bOpen) {
        return aOpen ? -1 : 1;
      }
      return 0;
    });
  }, [isPersonalTab, personalData, statusFilter]);

  const personalStatements = useMemo(() => {
    const startIndex = (currentPage - 1) * 12;
    return personalMatchingStatements.slice(startIndex, startIndex + 12);
  }, [personalMatchingStatements, currentPage]);

  const statements = isPersonalTab ? personalStatements : generalStatements;

  // Pagination: server pagination for general browsing; computed local pagination for personal tabs
  const pagination = useMemo(() => {
    if (!isPersonalTab) return feedData?.pagination;
    const totalCount = personalMatchingStatements.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / 12));
    return {
      count: totalCount,
      totalPages,
      isNext: currentPage < totalPages,
      isPrev: currentPage > 1,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
    };
  }, [
    isPersonalTab,
    feedData?.pagination,
    personalMatchingStatements.length,
    currentPage,
  ]);

  // Categories list from suggestions
  const categories = useMemo(() => {
    return Array.from(new Set([...CATEGORY_SUGGESTIONS]));
  }, []);

  // Handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    if (currentPage !== 1) setCurrentPage(1);
  };

  const handleStatusChange = (val: FeedStatusFilter) => {
    setStatusFilter(val);
    if (currentPage !== 1) setCurrentPage(1);
  };

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    if (currentPage !== 1) setCurrentPage(1);
  };

  const handleSortChange = (val: string) => {
    setSortBy(val);
    if (currentPage !== 1) setCurrentPage(1);
  };

  const handleViewStatement = useCallback((statement: ProblemStatement) => {
    setSelectedStatement(statement);
    setIsDetailModalOpen(true);
  }, []);

  const handleOpenCreate = () => {
    setIsCreateOpen(true);
  };

  return (
    <main className="flex-1 lc-fade-in space-y-6 pb-12">
      {/* Sticky Top Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border pt-6 pb-4 md:pt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              Problem Statements
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Real-world challenges from industry partners. Collaborate,
              innovate, and showcase your solutions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canManage && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="rounded-xl text-xs gap-1.5"
              >
                <Link href="/dashboard/manage-problem-statements">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>Manage</span>
                </Link>
              </Button>
            )}

            {canManage && (
              <Button
                size="sm"
                onClick={handleOpenCreate}
                className="rounded-xl text-xs gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Statement</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters (Status pills, View mode, Search, Category, Sort) */}
      <div className="px-1">
        <ProblemStatementsFilters
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          search={search}
          onSearch={handleSearch}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          categories={categories}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isAuthenticated={isAuthenticated}
        />
      </div>

      {/* Main Board View: Grid vs Table */}
      {isError ? (
        <StateDisplay
          variant="no-results"
          className="rounded-2xl border border-dashed border-border bg-muted/40 py-12"
          title="Failed to load problem statements"
          description="We couldn't load the problem statements feed. Please check your connection and try again."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="rounded-xl"
            >
              Try Again
            </Button>
          }
        />
      ) : isLoading ? (
        viewMode === "board" ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        ) : (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        )
      ) : viewMode === "board" ? (
        <ProblemStatementsGrid
          statements={statements}
          onView={handleViewStatement}
          emptyTitle={
            statusFilter === "trying"
              ? "You haven't tried any challenges yet"
              : statusFilter === "open"
                ? "No open challenges found"
                : "No problem statements found"
          }
          emptyDescription={
            statusFilter === "trying"
              ? "Explore open challenges and click 'I'm Trying It' to track them here!"
              : "Try adjusting your search query or filters to discover challenges."
          }
        />
      ) : (
        <ProblemStatementsTable
          statements={statements}
          onView={handleViewStatement}
          emptyTitle={
            statusFilter === "trying"
              ? "You haven't tried any challenges yet"
              : statusFilter === "open"
                ? "No open challenges found"
                : "No problem statements found"
          }
          emptyDescription={
            statusFilter === "trying"
              ? "Explore open challenges and click 'I'm Trying It' to track them here!"
              : "Try adjusting your search query or filters to discover challenges."
          }
        />
      )}

      {/* Pagination */}
      {pagination && pagination.count > 0 && (
        <ProblemStatementsPagination
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          currentCount={statements.length}
        />
      )}

      {/* Detail Modal */}
      <ProblemStatementDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        statement={selectedStatement}
      />

      {/* Creation / Edit Form Dialog */}
      <ProblemStatementFormDialog
        open={isCreateOpen}
        mode={isAdmin ? "admin-create" : "company-create"}
        onClose={() => {
          setIsCreateOpen(false);
          queryClient.invalidateQueries({
            queryKey: problemStatementKeys.all,
          });
        }}
        onSuccess={() => setIsCreateOpen(false)}
      />
    </main>
  );
}
