"use client";

import { Settings2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StateDisplay } from "@/components/ui/state-display";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserInfo } from "@/features/auth";
import { authStore } from "@/lib/auth";
import { ROLES } from "@/lib/auth/roles";
import {
  FEED_SORT_DEFAULT,
  FEED_TABS,
} from "../constants/problem-statement.constants";
import {
  usePersonalProblemStatementsFeed,
  useProblemStatementFeed,
} from "../hooks";
import type {
  BrowseStatusFilter,
  FeedQueryParams,
  FeedTab,
  ParticipationStatusFilter,
  ProblemStatement,
  ProblemStatementViewMode,
} from "../types/problem-statement.types";
import { ProblemStatementDetailModal } from "./problem-statement-detail-modal";
import { ProblemStatementsFilters } from "./problem-statements-filters";
import {
  ProblemStatementsGrid,
  ProblemStatementsListSkeleton,
} from "./problem-statements-grid";
import { ProblemStatementsPagination } from "./problem-statements-pagination";
import { ProblemStatementsTable } from "./problem-statements-table";

const PER_PAGE = 12;

/** Open statements first; stable otherwise (keeps the server's sort order). */
function openFirst(list: ProblemStatement[]) {
  return [...list].sort((a, b) => Number(b.is_open) - Number(a.is_open));
}

export function ProblemStatementsClient() {
  const [tab, setTab] = useState<FeedTab>("browse");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [browseStatus, setBrowseStatus] = useState<BrowseStatusFilter>("all");
  const [participationStatus, setParticipationStatus] =
    useState<ParticipationStatusFilter>("all");
  const [sortBy, setSortBy] = useState<string>(FEED_SORT_DEFAULT);
  const [viewMode, setViewMode] = useState<ProblemStatementViewMode>("board");
  const [selectedStatement, setSelectedStatement] =
    useState<ProblemStatement | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const isAuthenticated =
    typeof window !== "undefined" ? authStore.isAuthenticated() : false;
  const { data: userInfo } = useUserInfo();
  const userRoles = (userInfo?.roles as string[]) ?? [];
  // Mirrors the route guard on /dashboard/manage-problem-statements.
  const canManage =
    userRoles.includes(ROLES.ADMIN) || userRoles.includes(ROLES.COMPANY);

  const isParticipating = tab === "participating" && isAuthenticated;

  // Browse: server-side paging.
  const feedParams: FeedQueryParams = {
    pageIndex: currentPage,
    perPage: PER_PAGE,
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    open_only: browseStatus === "open" ? true : undefined,
    sortBy,
  };
  const feedQuery = useProblemStatementFeed(feedParams, {
    enabled: !isParticipating,
  });

  // Participating: the API has no "mine" filter, so the hook walks the
  // catalogue and we filter + page locally.
  const personalParams = useMemo(
    () => ({
      search: search || undefined,
      category: category !== "all" ? category : undefined,
      sortBy,
    }),
    [search, category, sortBy],
  );
  const personalQuery = usePersonalProblemStatementsFeed(personalParams, {
    enabled: isParticipating,
  });

  const activeQuery = isParticipating ? personalQuery : feedQuery;

  const personalMatches = useMemo(() => {
    if (!isParticipating) return [];
    const mine = (personalQuery.data ?? []).filter((s) => {
      if (participationStatus === "trying")
        return s.my_interaction === "Trying";
      if (participationStatus === "submitted") {
        return s.my_interaction === "Submitted";
      }
      return Boolean(s.my_interaction);
    });
    return openFirst(mine);
  }, [isParticipating, personalQuery.data, participationStatus]);

  const statements = useMemo(() => {
    if (isParticipating) {
      const start = (currentPage - 1) * PER_PAGE;
      return personalMatches.slice(start, start + PER_PAGE);
    }
    const list = feedQuery.data?.data ?? [];
    return browseStatus === "all" ? openFirst(list) : list;
  }, [
    isParticipating,
    personalMatches,
    currentPage,
    feedQuery.data?.data,
    browseStatus,
  ]);

  const pagination = useMemo(() => {
    if (!isParticipating) return feedQuery.data?.pagination;
    const count = personalMatches.length;
    const totalPages = Math.max(1, Math.ceil(count / PER_PAGE));
    return {
      count,
      totalPages,
      isNext: currentPage < totalPages,
      isPrev: currentPage > 1,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
    };
  }, [
    isParticipating,
    feedQuery.data?.pagination,
    personalMatches.length,
    currentPage,
  ]);

  const resetPage = () => setCurrentPage(1);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1);
  }, []);

  const handleView = useCallback((statement: ProblemStatement) => {
    setSelectedStatement(statement);
    setIsDetailOpen(true);
  }, []);

  const hasFilters =
    Boolean(search) ||
    category !== "all" ||
    (isParticipating ? participationStatus !== "all" : browseStatus !== "all");

  const empty = isParticipating
    ? hasFilters
      ? {
          title: "No matching problem statements",
          description:
            "None of the problem statements you're participating in match these filters.",
        }
      : {
          title: "You're not participating in any problem statements yet",
          description:
            "Open a problem statement from Browse and choose “I'm trying this” to track it here.",
        }
    : hasFilters
      ? {
          title: "No matching problem statements",
          description: "Try a different search term or clear the filters.",
        }
      : {
          title: "No problem statements yet",
          description:
            "New problem statements from industry partners will appear here.",
        };

  return (
    <div className="space-y-6">
      <div data-tour-id="page:problem-statements:header">
        <PageHeader
          title="Problem Statements"
          description="Real-world problems from industry partners. Pick one, build a solution, and submit it."
          action={
            canManage ? (
              <Button variant="outline" asChild>
                <Link href="/dashboard/manage-problem-statements">
                  <Settings2 />
                  Manage statements
                </Link>
              </Button>
            ) : null
          }
        />
      </div>

      {isAuthenticated && (
        <Tabs
          value={tab}
          onValueChange={(v) => {
            setTab(v as FeedTab);
            resetPage();
          }}
        >
          <TabsList data-tour-id="page:problem-statements:tabs">
            {FEED_TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <div data-tour-id="page:problem-statements:filters">
        <ProblemStatementsFilters
          tab={isParticipating ? "participating" : "browse"}
          onSearch={handleSearch}
          category={category}
          onCategoryChange={(v) => {
            setCategory(v);
            resetPage();
          }}
          status={isParticipating ? participationStatus : browseStatus}
          onStatusChange={(v) => {
            if (isParticipating) {
              setParticipationStatus(v as ParticipationStatusFilter);
            } else {
              setBrowseStatus(v as BrowseStatusFilter);
            }
            resetPage();
          }}
          sortBy={sortBy}
          onSortChange={(v) => {
            setSortBy(v);
            resetPage();
          }}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      <div data-tour-id="page:problem-statements:results">
        {activeQuery.isError ? (
          <StateDisplay
            variant="no-results"
            title="Couldn't load problem statements"
            description="Check your connection and try again."
            action={
              <Button variant="outline" onClick={() => activeQuery.refetch()}>
                Try again
              </Button>
            }
          />
        ) : activeQuery.isLoading ? (
          <ProblemStatementsListSkeleton viewMode={viewMode} />
        ) : viewMode === "board" ? (
          <ProblemStatementsGrid
            statements={statements}
            onView={handleView}
            emptyTitle={empty.title}
            emptyDescription={empty.description}
          />
        ) : (
          <ProblemStatementsTable
            statements={statements}
            onView={handleView}
            emptyTitle={empty.title}
            emptyDescription={empty.description}
          />
        )}
      </div>

      {!activeQuery.isLoading && !activeQuery.isError && (
        <ProblemStatementsPagination
          pagination={pagination}
          currentPage={currentPage}
          perPage={PER_PAGE}
          onPageChange={handlePageChange}
        />
      )}

      <ProblemStatementDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        statement={selectedStatement}
      />
    </div>
  );
}
