"use client";

import {
  CheckCircle,
  Eye,
  GitPullRequestArrow,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldOff,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { DataTableErrorBoundary } from "@/components/dashboard/DataTableErrorBoundary";
import Pagination from "@/components/dashboard/table/pagination";
import { RowActionButton } from "@/components/dashboard/table/row-action-button";
import { nextSortState } from "@/components/dashboard/table/sort-cycle";
import type { Data } from "@/components/dashboard/table/Table";
import Table from "@/components/dashboard/table/Table";
import THead from "@/components/dashboard/table/Thead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { formatShortDate } from "@/lib/datetime";
import {
  useMentorChangeRequests,
  useMentorList,
  useReactivateMentor,
  useRevokeMentorAssignment,
} from "../hooks/use-mentor-verify";
import { isActionable, resolveStatus, statusBadge } from "../lib/status";
import type { MentorApplicationListItem } from "../schemas";
import { AssignMentorsDialog } from "./assign-mentors-dialog";
import { MentorApplicationSheet } from "./mentor-application-sheet";
import { MentorGrantsSheet } from "./mentor-grants-sheet";
import { MentorRosterTab } from "./mentor-roster-tab";
import { MentorVerifyDialog } from "./mentor-verify-dialog";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDisplayName(m: MentorApplicationListItem): string {
  return m.user_full_name ?? m.full_name ?? "—";
}

function getStatusBadge(m: MentorApplicationListItem) {
  const { label, variant } = statusBadge(resolveStatus(m));
  return <Badge variant={variant}>{label}</Badge>;
}

// ─── Table Component ──────────────────────────────────────────────────────────

// Sortable keys must exist in MentorListAPI / MentorChangeRequestListAPI
// sort_fields (mulearnbackend/api/dashboard/mentor/mentor_views.py) — pinned
// by features/role-verification/lib/sort-contract.test.ts.
export const APPLICATION_COLUMNS = [
  { column: "user_full_name", Label: "Name", isSortable: true },
  { column: "email", Label: "Email", isSortable: false },
  { column: "status", Label: "Status", isSortable: true },
  { column: "mentor_tier", Label: "Tier", isSortable: false },
  { column: "created_at", Label: "Applied", isSortable: true },
];

// Change requests can't sort by status (that view only allows created_at
// and user_full_name), and every change request is PENDING anyway.
export const CHANGE_REQUEST_COLUMNS = APPLICATION_COLUMNS.map((c) =>
  c.column === "status" ? { ...c, isSortable: false } : c,
);

function MentorTable({
  items,
  isLoading,
  showActions,
  columns,
  onSort,
  onView,
  onVerify,
  onScopes,
  onRevokeTier,
  onReactivate,
  page,
  totalPages,
  totalCount,
  onPageChange,
}: {
  items: MentorApplicationListItem[] | undefined;
  isLoading: boolean;
  showActions: boolean;
  columns: typeof APPLICATION_COLUMNS;
  onSort: (column: string) => void;
  onView: (m: MentorApplicationListItem) => void;
  onVerify: (
    m: MentorApplicationListItem,
    action: "approve" | "reject",
  ) => void;
  onScopes: (m: MentorApplicationListItem) => void;
  onRevokeTier: (m: MentorApplicationListItem) => void;
  onReactivate: (m: MentorApplicationListItem) => void;
  page: number;
  totalPages: number;
  totalCount: number | undefined;
  onPageChange: (page: number) => void;
}) {
  const rows: Data[] = (items ?? []).map((m) => ({
    id: m.id,
    user_full_name: getDisplayName(m),
    muid: m.muid ?? "",
    email: m.user_email ?? m.email ?? "—",
    status: resolveStatus(m),
    mentor_tier: m.mentor_tier ?? "",
    created_at: formatShortDate(m.created_at),
  }));

  const customCellRender = (column: string, row: Data) => {
    const m = items?.find((item) => item.id === row.id);
    if (!m) return null;
    if (column === "user_full_name") {
      return (
        <div>
          <p className="font-medium">{getDisplayName(m)}</p>
          {m.muid && <p className="text-xs text-muted-foreground">{m.muid}</p>}
        </div>
      );
    }
    if (column === "status") return getStatusBadge(m);
    if (column === "mentor_tier") {
      return m.mentor_tier ? (
        <Badge variant="outline">{m.mentor_tier}</Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    }
    return null;
  };

  if (!isLoading && (!items || items.length === 0)) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-muted-foreground">
        <CheckCircle className="h-8 w-8" />
        <p className="text-sm">No applications found.</p>
      </div>
    );
  }

  return (
    <DataTableErrorBoundary>
      <Table
        rows={rows}
        isLoading={isLoading}
        page={page}
        perPage={PER_PAGE}
        columnOrder={columns}
        id={showActions ? ["id"] : undefined}
        customCellRender={customCellRender}
        customActionRender={
          showActions
            ? (row) => {
                const m = items?.find((item) => item.id === row.id);
                if (!m) return null;
                return (
                  <>
                    <RowActionButton
                      icon={Eye}
                      label="View"
                      onClick={() => onView(m)}
                    />
                    {isActionable(m) && (
                      <>
                        <RowActionButton
                          icon={CheckCircle}
                          label="Approve"
                          tone="success"
                          onClick={() => onVerify(m, "approve")}
                        />
                        <RowActionButton
                          icon={XCircle}
                          label="Reject"
                          tone="destructive"
                          onClick={() => onVerify(m, "reject")}
                        />
                      </>
                    )}
                    <RowActionButton
                      icon={ShieldCheck}
                      label="Scopes"
                      onClick={() => onScopes(m)}
                    />
                    {resolveStatus(m) === "APPROVED" && m.muid && (
                      <RowActionButton
                        icon={ShieldOff}
                        label="Revoke tier"
                        tone="destructive"
                        onClick={() => onRevokeTier(m)}
                      />
                    )}
                    {/* Reactivate — only shown when the mentor is suspended */}
                    {resolveStatus(m) === "APPROVED" &&
                      m.is_active === false && (
                        <RowActionButton
                          icon={RefreshCw}
                          label="Reactivate mentor"
                          tone="success"
                          onClick={() => onReactivate(m)}
                          id={`reactivate-btn-${m.id}`}
                        />
                      )}
                  </>
                );
              }
            : undefined
        }
      >
        <THead
          columnOrder={columns}
          onIconClick={onSort}
          action={Boolean(showActions)}
        />
        <div className="p-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            perPage={PER_PAGE}
            totalCount={totalCount}
            currentPageCount={items?.length}
            handlePreviousClick={() => onPageChange(Math.max(1, page - 1))}
            handleNextClick={() => onPageChange(page + 1)}
          />
        </div>
      </Table>
    </DataTableErrorBoundary>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

const PER_PAGE = 10;

export function MentorVerificationPanel() {
  const [search, setSearch] = useState("");
  const [pendingPage, setPendingPage] = useState(1);
  const [allPage, setAllPage] = useState(1);
  const [changeRequestsPage, setChangeRequestsPage] = useState(1);
  const [verifyState, setVerifyState] = useState<{
    mentor: MentorApplicationListItem;
    action: "approve" | "reject";
  } | null>(null);
  const [grantsFor, setGrantsFor] = useState<MentorApplicationListItem | null>(
    null,
  );
  const [assignOpen, setAssignOpen] = useState(false);
  const [revokeFor, setRevokeFor] = useState<MentorApplicationListItem | null>(
    null,
  );
  const [reactivateFor, setReactivateFor] =
    useState<MentorApplicationListItem | null>(null);
  const [pendingSort, setPendingSort] = useState("");
  const [allSort, setAllSort] = useState("");
  const [changeRequestsSort, setChangeRequestsSort] = useState("");
  const [viewFor, setViewFor] = useState<MentorApplicationListItem | null>(
    null,
  );
  const revokeAssignment = useRevokeMentorAssignment();
  const reactivateMutation = useReactivateMentor();

  const { data: pending, isLoading: pendingLoading } = useMentorList({
    status: "PENDING",
    search: search || undefined,
    page: pendingPage,
    perPage: PER_PAGE,
    sortBy: pendingSort || undefined,
  });
  const { data: all, isLoading: allLoading } = useMentorList({
    search: search || undefined,
    page: allPage,
    perPage: PER_PAGE,
    sortBy: allSort || undefined,
  });
  const { data: changeRequests, isLoading: changeRequestsLoading } =
    useMentorChangeRequests({
      search: search || undefined,
      page: changeRequestsPage,
      perPage: PER_PAGE,
      sortBy: changeRequestsSort || undefined,
    });

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email…"
                className="pl-8"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPendingPage(1);
                  setAllPage(1);
                }}
              />
            </div>
            <Button className="gap-2" onClick={() => setAssignOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Assign mentors
            </Button>
          </div>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending" className="gap-1.5">
              Pending
              {pending && pending.totalItems > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pending.totalItems}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-1.5">
              All Applications
            </TabsTrigger>
            <TabsTrigger value="change-requests" className="gap-1.5">
              <GitPullRequestArrow className="h-3.5 w-3.5" />
              Change Requests
              {changeRequests && changeRequests.totalItems > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {changeRequests.totalItems}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="roster" className="gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Roster
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4">
            <MentorTable
              items={pending?.data}
              isLoading={pendingLoading}
              showActions
              columns={APPLICATION_COLUMNS}
              onSort={(column) => {
                setPendingPage(1);
                setPendingSort((prev) => nextSortState(prev, column));
              }}
              onView={setViewFor}
              onVerify={(m, action) => setVerifyState({ mentor: m, action })}
              onScopes={setGrantsFor}
              onRevokeTier={setRevokeFor}
              onReactivate={setReactivateFor}
              page={pendingPage}
              totalPages={pending?.totalPages ?? 1}
              totalCount={pending?.totalItems}
              onPageChange={setPendingPage}
            />
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            <MentorTable
              items={all?.data}
              isLoading={allLoading}
              showActions
              columns={APPLICATION_COLUMNS}
              onSort={(column) => {
                setAllPage(1);
                setAllSort((prev) => nextSortState(prev, column));
              }}
              onView={setViewFor}
              onVerify={(m, action) => setVerifyState({ mentor: m, action })}
              onScopes={setGrantsFor}
              onRevokeTier={setRevokeFor}
              onReactivate={setReactivateFor}
              page={allPage}
              totalPages={all?.totalPages ?? 1}
              totalCount={all?.totalItems}
              onPageChange={setAllPage}
            />
          </TabsContent>

          {/* ── Change Requests tab ─────────────────────────────────────────
               Shows PENDING applications from users who are already approved
               for the same tier (affiliation-change requests). Same shape as
               /list/, so MentorTable works unchanged. Admin can approve/reject
               directly from here. */}
          <TabsContent value="change-requests" className="mt-4">
            <MentorTable
              items={changeRequests?.data}
              isLoading={changeRequestsLoading}
              showActions
              columns={CHANGE_REQUEST_COLUMNS}
              onSort={(column) => {
                setChangeRequestsPage(1);
                setChangeRequestsSort((prev) => nextSortState(prev, column));
              }}
              onView={setViewFor}
              onVerify={(m, action) => setVerifyState({ mentor: m, action })}
              onScopes={setGrantsFor}
              onRevokeTier={setRevokeFor}
              onReactivate={setReactivateFor}
              page={changeRequestsPage}
              totalPages={changeRequests?.totalPages ?? 1}
              totalCount={changeRequests?.totalItems}
              onPageChange={setChangeRequestsPage}
            />
          </TabsContent>

          {/* ── Roster tab ──────────────────────────────────────────────────
               Active APPROVED mentors with avg_rating and rating_count.
               Supports mentor_tier filter and low_rating toggle. */}
          <TabsContent
            value="roster"
            className="mt-4 data-[state=inactive]:hidden"
            forceMount
          >
            <MentorRosterTab />
          </TabsContent>
        </Tabs>

        <MentorVerifyDialog
          mentor={verifyState?.mentor ?? null}
          action={verifyState?.action ?? "approve"}
          open={!!verifyState}
          onOpenChange={(v) => !v && setVerifyState(null)}
        />

        <MentorApplicationSheet
          application={viewFor}
          open={Boolean(viewFor)}
          onOpenChange={(v) => !v && setViewFor(null)}
        />

        <MentorGrantsSheet
          mentorId={grantsFor?.id ?? ""}
          mentorName={grantsFor ? getDisplayName(grantsFor) : ""}
          mentorMuid={grantsFor?.muid}
          open={Boolean(grantsFor)}
          onOpenChange={(v) => !v && setGrantsFor(null)}
        />

        <AssignMentorsDialog open={assignOpen} onOpenChange={setAssignOpen} />

        <ConfirmDialog
          open={Boolean(revokeFor)}
          onOpenChange={(v) => !v && setRevokeFor(null)}
          title={
            revokeFor
              ? `Revoke ${revokeFor.mentor_tier ?? "mentor"} from ${getDisplayName(revokeFor)}?`
              : "Revoke tier?"
          }
          description="Removes this tier and all of its scope grants. Their profile, employment, and any other mentor tiers stay intact."
          confirmLabel="Revoke tier"
          isPending={revokeAssignment.isPending}
          onConfirm={() => {
            if (!revokeFor?.muid) return;
            revokeAssignment.mutate(
              {
                muid: revokeFor.muid,
                mentorTier: revokeFor.mentor_tier ?? undefined,
              },
              { onSuccess: () => setRevokeFor(null) },
            );
          }}
        />

        {/* Reactivate confirm — no reason needed, just a warning */}
        <ConfirmDialog
          open={Boolean(reactivateFor)}
          onOpenChange={(v) => !v && setReactivateFor(null)}
          variant="warning"
          title={
            reactivateFor
              ? `Reactivate ${getDisplayName(reactivateFor)}?`
              : "Reactivate mentor?"
          }
          description="This will immediately restore all mentor capabilities: session creation, persona switch, and roster visibility — without re-verification."
          confirmLabel="Reactivate mentor"
          isPending={reactivateMutation.isPending}
          onConfirm={() => {
            if (!reactivateFor) return;
            reactivateMutation.mutate(reactivateFor.id, {
              onSuccess: () => setReactivateFor(null),
            });
          }}
        />
      </div>
    </TooltipProvider>
  );
}
