"use client";

import {
  CalendarClock,
  CheckCircle,
  Clock,
  Filter,
  Search,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

function SessionVerificationTable({
  sessions,
  isLoading,
  onApprove,
}: {
  sessions: Session[] | undefined;
  isLoading: boolean;
  onApprove: (s: Session, action: "approve" | "reject") => void;
}) {
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
    <div className="rounded-xl border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="font-semibold">Title</TableHead>
            <TableHead className="font-semibold">Mentor</TableHead>
            <TableHead className="font-semibold">Interest Group</TableHead>
            <TableHead className="font-semibold">Mode</TableHead>
            <TableHead className="font-semibold">Starts At</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => {
            const status = session.status ?? "PENDING_APPROVAL";
            const isPending = status === "PENDING_APPROVAL";
            const isTerminal = ["COMPLETED", "CANCELLED", "REJECTED"].includes(
              status,
            );

            return (
              <TableRow
                key={session.id}
                className="hover:bg-muted/30 transition-colors"
              >
                {/* Title */}
                <TableCell className="font-medium max-w-[200px]">
                  <div className="flex flex-col gap-1">
                    <span className="truncate">{session.title}</span>
                    {session.is_recurring && (
                      <Badge
                        variant="outline"
                        className="w-fit text-[10px] h-4 px-1 py-0 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                      >
                        🔄 Recurring
                      </Badge>
                    )}
                  </div>
                </TableCell>

                {/* Mentor */}
                <TableCell className="text-sm">
                  <span className="text-foreground font-medium">
                    {session.created_by_name ?? session.created_by ?? "—"}
                  </span>
                </TableCell>

                {/* Interest Group */}
                <TableCell>
                  {(session.ig_name ?? session.entity_name) ? (
                    <Badge variant="outline">
                      {session.ig_name ?? session.entity_name}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Global</Badge>
                  )}
                </TableCell>

                {/* Mode */}
                <TableCell>
                  {session.mode ? (
                    <span className="text-sm capitalize">
                      {session.mode.toLowerCase()}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>

                {/* Starts At */}
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {session.starts_at
                    ? new Date(session.starts_at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Not scheduled"}
                </TableCell>

                {/* Status */}
                <TableCell>
                  <StatusBadge status={status} />
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 disabled:opacity-40"
                          onClick={() => onApprove(session, "approve")}
                          disabled={!isPending || isTerminal}
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
                          onClick={() => onApprove(session, "reject")}
                          disabled={!isPending || isTerminal}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isPending ? "Reject Session" : "Already processed"}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Page component ────────────────────────────────────────────────────────────

export function AdminSessionVerificationPage() {
  const [search, setSearch] = useState("");
  const [approveState, setApproveState] = useState<{
    session: Session;
    action: "approve" | "reject";
  } | null>(null);

  // Fetch all sessions for this admin view
  const { data: allResult, isLoading: allLoading } = useAdminSessions({
    search: search || undefined,
  });

  const { data: pendingResult, isLoading: pendingLoading } = useAdminSessions({
    status: "PENDING_APPROVAL",
    search: search || undefined,
  });

  const { data: scheduledResult, isLoading: scheduledLoading } =
    useAdminSessions({
      status: "SCHEDULED",
      search: search || undefined,
    });

  const { data: rejectedResult, isLoading: rejectedLoading } = useAdminSessions(
    {
      status: "REJECTED",
      search: search || undefined,
    },
  );

  const allSessions = allResult?.data ?? [];
  const pendingSessions = pendingResult?.data ?? [];
  const scheduledSessions = scheduledResult?.data ?? [];
  const rejectedSessions = rejectedResult?.data ?? [];

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
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ── Stats row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Pending Approval"
            count={pendingSessions.length}
            icon={Clock}
            colorClass="bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
          />
          <StatCard
            label="Scheduled (Approved)"
            count={scheduledSessions.length}
            icon={CheckCircle}
            colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
          />
          <StatCard
            label="Rejected"
            count={rejectedSessions.length}
            icon={XCircle}
            colorClass="bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
          />
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────────── */}
        <Tabs defaultValue="pending">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <TabsList>
              <TabsTrigger value="pending" id="tab-pending">
                Pending
                {pendingSessions.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {pendingSessions.length}
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
            />
          </TabsContent>

          {/* Scheduled */}
          <TabsContent value="scheduled" className="mt-4">
            <SessionVerificationTable
              sessions={scheduledSessions}
              isLoading={scheduledLoading}
              onApprove={(s, action) => setApproveState({ session: s, action })}
            />
          </TabsContent>

          {/* Rejected */}
          <TabsContent value="rejected" className="mt-4">
            <SessionVerificationTable
              sessions={rejectedSessions}
              isLoading={rejectedLoading}
              onApprove={(s, action) => setApproveState({ session: s, action })}
            />
          </TabsContent>

          {/* All */}
          <TabsContent value="all" className="mt-4">
            <SessionVerificationTable
              sessions={allSessions}
              isLoading={allLoading}
              onApprove={(s, action) => setApproveState({ session: s, action })}
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
