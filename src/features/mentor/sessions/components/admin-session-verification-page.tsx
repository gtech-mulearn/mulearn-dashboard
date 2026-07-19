"use client";

import {
  Ban,
  CalendarClock,
  CheckCircle,
  Clock,
  Filter,
  Search,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Blank } from "@/components/dashboard/table/Blank";
import Pagination from "@/components/dashboard/table/pagination";
import ReusableTable, { type Data } from "@/components/dashboard/table/Table";
import THead from "@/components/dashboard/table/Thead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAdminSessions } from "../hooks/use-sessions";
import type { Session } from "../schemas";
import { ApproveSessionDialog } from "./approve-session-dialog";

// ─── Status badge helper ───────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/50",
  PENDING_APPROVAL:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-950/50",
  COMPLETED:
    "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/50",
  CANCELLED:
    "bg-stone-100 text-stone-700 dark:bg-stone-900/50 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-900/50",
  REJECTED:
    "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-950/50",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={
        STATUS_STYLES[status] ||
        "bg-muted text-muted-foreground border-border hover:bg-muted"
      }
    >
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

// ─── Stats card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  count,
  icon: Icon,
  colorClass,
}: {
  label: string;
  count: number;
  icon: React.ElementType;
  colorClass: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-lg ${colorClass}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">{count}</p>
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  );
}

// ─── Session table ─────────────────────────────────────────────────────────────

const COLUMN_ORDER = [
  { column: "title", Label: "Title", isSortable: false },
  { column: "created_by_name", Label: "Mentor", isSortable: false },
  { column: "ig_name", Label: "Interest Group", isSortable: false },
  { column: "mode", Label: "Mode", isSortable: false },
  { column: "starts_at", Label: "Starts At", isSortable: false },
  { column: "status", Label: "Status", isSortable: false },
];

const PER_PAGE = 10;

function SessionVerificationTable({
  sessions = [],
  isLoading,
  onApprove,
  page,
  totalPages,
  totalCount,
  onPageChange,
}: {
  sessions: Session[] | undefined;
  isLoading: boolean;
  onApprove: (s: Session, action: "approve" | "reject" | "cancel") => void;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}) {
  const customCellRender = (column: string, rawRow: Data) => {
    const row = rawRow as unknown as Session;
    if (column === "title") {
      return (
        <div className="flex flex-col gap-1">
          <span className="truncate font-medium">{row.title}</span>
          {row.is_recurring && (
            <Badge
              variant="outline"
              className="w-fit text-[10px] h-4 px-1 py-0 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
            >
              🔄 Recurring
            </Badge>
          )}
        </div>
      );
    }
    if (column === "created_by_name") {
      return (
        <span className="text-foreground font-medium">
          {row.created_by_name ?? row.created_by ?? "—"}
        </span>
      );
    }
    if (column === "ig_name") {
      return (
        <Badge variant="outline">
          {row.ig_name ?? row.entity_name ?? "Global"}
        </Badge>
      );
    }
    if (column === "mode") {
      return row.mode ? (
        <span className="text-sm capitalize">{row.mode.toLowerCase()}</span>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      );
    }
    if (column === "starts_at") {
      return (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {row.starts_at
            ? new Date(row.starts_at).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Not scheduled"}
        </span>
      );
    }
    if (column === "status") {
      return <StatusBadge status={row.status ?? "PENDING_APPROVAL"} />;
    }
    return null;
  };

  const customActionRender = (rawRow: Data) => {
    const row = rawRow as unknown as Session;
    const status = row.status ?? "PENDING_APPROVAL";
    const isPending = status === "PENDING_APPROVAL";
    const isScheduled = status === "SCHEDULED";

    return (
      <div className="flex items-center justify-end gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 disabled:opacity-40"
              onClick={() => onApprove(row, "approve")}
              disabled={!isPending}
              aria-label="Approve session"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isPending ? "Approve Session" : "Already processed"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 disabled:opacity-40"
              onClick={() => onApprove(row, "reject")}
              disabled={!isPending}
              aria-label="Reject session"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isPending ? "Reject Session" : "Already processed"}
          </TooltipContent>
        </Tooltip>

        {/* Cancel / unpublish a live (scheduled) session — post-moderation. */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 disabled:opacity-40"
              onClick={() => onApprove(row, "cancel")}
              disabled={!isScheduled}
              aria-label="Cancel or unpublish session"
            >
              <Ban className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isScheduled ? "Cancel / Unpublish" : "Only scheduled sessions"}
          </TooltipContent>
        </Tooltip>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed text-muted-foreground">
        <CalendarClock className="h-10 w-10 opacity-40" />
        <p className="text-sm font-medium">No sessions found.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px] w-full">
        <ReusableTable
          rows={sessions as unknown as Data[]}
          isLoading={isLoading}
          page={page}
          perPage={PER_PAGE}
          columnOrder={COLUMN_ORDER}
          id={["id"]}
          customCellRender={customCellRender}
          customActionRender={customActionRender}
        >
          <THead columnOrder={COLUMN_ORDER} onIconClick={() => {}} action />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            perPage={PER_PAGE}
            totalCount={totalCount}
            handlePreviousClick={() => onPageChange(Math.max(1, page - 1))}
            handleNextClick={() => onPageChange(page + 1)}
          />
          <Blank />
        </ReusableTable>
      </div>
    </div>
  );
}

// ─── Page component ────────────────────────────────────────────────────────────

export function AdminSessionVerificationPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [approveState, setApproveState] = useState<{
    session: Session;
    action: "approve" | "reject" | "cancel";
  } | null>(null);

  const [pendingPage, setPendingPage] = useState(1);
  const [scheduledPage, setScheduledPage] = useState(1);
  const [rejectedPage, setRejectedPage] = useState(1);
  const [allPage, setAllPage] = useState(1);

  const { data: pendingResult, isLoading: pendingLoading } = useAdminSessions({
    status: "PENDING_APPROVAL",
    search: search || undefined,
    page: pendingPage,
    perPage: PER_PAGE,
  });

  const { data: scheduledResult, isLoading: scheduledLoading } =
    useAdminSessions({
      status: "SCHEDULED",
      search: search || undefined,
      page: scheduledPage,
      perPage: PER_PAGE,
    });

  const { data: rejectedResult, isLoading: rejectedLoading } = useAdminSessions(
    {
      status: "REJECTED",
      search: search || undefined,
      page: rejectedPage,
      perPage: PER_PAGE,
    },
  );

  const { data: allResult, isLoading: allLoading } = useAdminSessions({
    search: search || undefined,
    page: allPage,
    perPage: PER_PAGE,
  });

  const pendingSessions = pendingResult?.data ?? [];
  const scheduledSessions = scheduledResult?.data ?? [];
  const rejectedSessions = rejectedResult?.data ?? [];
  const allSessions = allResult?.data ?? [];

  const pendingPagination = pendingResult?.pagination ?? {
    count: 0,
    totalPages: 1,
    isNext: false,
    isPrev: false,
  };
  const scheduledPagination = scheduledResult?.pagination ?? {
    count: 0,
    totalPages: 1,
    isNext: false,
    isPrev: false,
  };
  const rejectedPagination = rejectedResult?.pagination ?? {
    count: 0,
    totalPages: 1,
    isNext: false,
    isPrev: false,
  };
  const allPagination = allResult?.pagination ?? {
    count: 0,
    totalPages: 1,
    isNext: false,
    isPrev: false,
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6 p-6">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <CalendarClock className="h-6 w-6 text-primary" />
              Session Verification
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review, approve, or reject mentor-submitted sessions.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="session-search"
              placeholder="Search by title or mentor…"
              className="pl-8"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPendingPage(1);
                setScheduledPage(1);
                setRejectedPage(1);
                setAllPage(1);
              }}
            />
          </div>
        </div>

        {/* ── Stats row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Pending Approval"
            count={pendingPagination.count}
            icon={Clock}
            colorClass="bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
          />
          <StatCard
            label="Scheduled (Approved)"
            count={scheduledPagination.count}
            icon={CheckCircle}
            colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
          />
          <StatCard
            label="Rejected"
            count={rejectedPagination.count}
            icon={XCircle}
            colorClass="bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
          />
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────────── */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Mobile Tab Select Dropdown */}
          <div className="md:hidden pb-4">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger
                id="session-verification-tab-select"
                className="w-full"
              >
                <SelectValue placeholder="Select Tab" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">
                  Pending ({pendingPagination.count})
                </SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="all">All Sessions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <TabsList>
              <TabsTrigger value="pending" id="tab-pending">
                Pending
                {pendingPagination.count > 0 && (
                  <Badge
                    variant="outline"
                    className="ml-2 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800"
                  >
                    {pendingPagination.count}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="scheduled" id="tab-scheduled">
                Scheduled
              </TabsTrigger>
              <TabsTrigger value="rejected" id="tab-rejected">
                Rejected
              </TabsTrigger>
              <TabsTrigger value="all" id="tab-all">
                All Sessions
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Pending */}
          <TabsContent value="pending" className="mt-4">
            <SessionVerificationTable
              sessions={pendingSessions}
              isLoading={pendingLoading}
              onApprove={(s, action) => setApproveState({ session: s, action })}
              page={pendingPage}
              totalPages={pendingPagination.totalPages}
              totalCount={pendingPagination.count}
              onPageChange={setPendingPage}
            />
          </TabsContent>

          {/* Scheduled */}
          <TabsContent value="scheduled" className="mt-4">
            <SessionVerificationTable
              sessions={scheduledSessions}
              isLoading={scheduledLoading}
              onApprove={(s, action) => setApproveState({ session: s, action })}
              page={scheduledPage}
              totalPages={scheduledPagination.totalPages}
              totalCount={scheduledPagination.count}
              onPageChange={setScheduledPage}
            />
          </TabsContent>

          {/* Rejected */}
          <TabsContent value="rejected" className="mt-4">
            <SessionVerificationTable
              sessions={rejectedSessions}
              isLoading={rejectedLoading}
              onApprove={(s, action) => setApproveState({ session: s, action })}
              page={rejectedPage}
              totalPages={rejectedPagination.totalPages}
              totalCount={rejectedPagination.count}
              onPageChange={setRejectedPage}
            />
          </TabsContent>

          {/* All */}
          <TabsContent value="all" className="mt-4">
            <SessionVerificationTable
              sessions={allSessions}
              isLoading={allLoading}
              onApprove={(s, action) => setApproveState({ session: s, action })}
              page={allPage}
              totalPages={allPagination.totalPages}
              totalCount={allPagination.count}
              onPageChange={setAllPage}
            />
          </TabsContent>
        </Tabs>

        {/* ── Approve / Reject dialog ────────────────────────────────────── */}
        <ApproveSessionDialog
          session={approveState?.session ?? null}
          action={approveState?.action ?? "approve"}
          open={!!approveState}
          onOpenChange={(v) => !v && setApproveState(null)}
        />
      </div>
    </TooltipProvider>
  );
}
