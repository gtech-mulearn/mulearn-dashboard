"use client";

import {
  CheckCircle,
  Search,
  ShieldCheck,
  ShieldOff,
  UserPlus,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
import Pagination from "@/components/dashboard/table/pagination";
import {
  useMentorList,
  useRevokeMentorAssignment,
} from "../hooks/use-mentor-verify";
import type { MentorApplicationListItem } from "../schemas";
import { AssignMentorsDialog } from "./assign-mentors-dialog";
import { MentorGrantsSheet } from "./mentor-grants-sheet";
import { MentorVerifyDialog } from "./mentor-verify-dialog";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDisplayName(m: MentorApplicationListItem): string {
  return m.user_full_name ?? m.full_name ?? "—";
}

// Doc: status is "PENDING" | "APPROVED" | "REJECTED"
// Backward compat: fall back to is_verified boolean if status not present
function resolveStatus(
  m: MentorApplicationListItem,
): "PENDING" | "APPROVED" | "REJECTED" {
  return (
    m.status ??
    (m.is_verified === true
      ? "APPROVED"
      : m.verification_note
        ? "REJECTED"
        : "PENDING")
  );
}

function getStatusBadge(m: MentorApplicationListItem) {
  const status = resolveStatus(m);
  if (status === "APPROVED") return <Badge variant="success">Approved</Badge>;
  if (status === "REJECTED")
    return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="warning">Pending</Badge>;
}

// Action buttons only make sense for applications still awaiting a decision.
function isActionable(m: MentorApplicationListItem): boolean {
  return resolveStatus(m) === "PENDING";
}

// ─── Table Component ──────────────────────────────────────────────────────────

function MentorTable({
  items,
  isLoading,
  showActions,
  onVerify,
  onScopes,
  onRevokeTier,
}: {
  items: MentorApplicationListItem[] | undefined;
  isLoading: boolean;
  showActions: boolean;
  onVerify: (
    m: MentorApplicationListItem,
    action: "approve" | "reject",
  ) => void;
  onScopes: (m: MentorApplicationListItem) => void;
  onRevokeTier: (m: MentorApplicationListItem) => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-muted-foreground">
        <CheckCircle className="h-8 w-8" />
        <p className="text-sm">No applications found.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Tier</TableHead>
          {showActions && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((m) => (
          <TableRow key={m.id}>
            <TableCell>
              <p className="font-medium">{getDisplayName(m)}</p>
              {m.muid && (
                <p className="text-xs text-muted-foreground">{m.muid}</p>
              )}
            </TableCell>
            <TableCell>
              <p className="text-sm text-muted-foreground">
                {m.user_email ?? m.email ?? "—"}
              </p>
            </TableCell>
            <TableCell>{getStatusBadge(m)}</TableCell>
            <TableCell>
              {m.mentor_tier ? (
                <Badge variant="outline">{m.mentor_tier}</Badge>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            {showActions && (
              <TableCell>
                <div className="flex items-center gap-1">
                  {isActionable(m) && (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950"
                            onClick={() => onVerify(m, "approve")}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Approve</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => onVerify(m, "reject")}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Reject</TooltipContent>
                      </Tooltip>
                    </>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-foreground hover:bg-muted"
                        onClick={() => onScopes(m)}
                      >
                        <ShieldCheck className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Scopes</TooltipContent>
                  </Tooltip>
                  {resolveStatus(m) === "APPROVED" && m.muid && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => onRevokeTier(m)}
                        >
                          <ShieldOff className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Revoke tier</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

const PER_PAGE = 10;

export function MentorVerificationPage() {
  const [search, setSearch] = useState("");
  const [pendingPage, setPendingPage] = useState(1);
  const [allPage, setAllPage] = useState(1);
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
  const revokeAssignment = useRevokeMentorAssignment();

  const { data: pending, isLoading: pendingLoading } = useMentorList({
    status: "PENDING",
    search: search || undefined,
    page: pendingPage,
    perPage: PER_PAGE,
  });
  const { data: all, isLoading: allLoading } = useMentorList({
    search: search || undefined,
    page: allPage,
    perPage: PER_PAGE,
  });

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mentor Verification</h1>
            <p className="text-sm text-muted-foreground">
              Review and approve mentor applications
            </p>
          </div>
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
            <TabsTrigger value="pending">
              Pending
              {pending && pending.data.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pending.data.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">All Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4">
            <MentorTable
              items={pending?.data}
              isLoading={pendingLoading}
              showActions
              onVerify={(m, action) => setVerifyState({ mentor: m, action })}
              onScopes={setGrantsFor}
              onRevokeTier={setRevokeFor}
            />
            <div className="mt-4">
              <Pagination
                currentPage={pendingPage}
                totalPages={pending?.totalPages ?? 1}
                perPage={PER_PAGE}
                totalCount={pending?.totalItems}
                currentPageCount={pending?.data?.length}
                handlePreviousClick={() =>
                  setPendingPage(Math.max(1, pendingPage - 1))
                }
                handleNextClick={() => setPendingPage(pendingPage + 1)}
              />
            </div>
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            <MentorTable
              items={all?.data}
              isLoading={allLoading}
              showActions
              onVerify={(m, action) => setVerifyState({ mentor: m, action })}
              onScopes={setGrantsFor}
              onRevokeTier={setRevokeFor}
            />
            <div className="mt-4">
              <Pagination
                currentPage={allPage}
                totalPages={all?.totalPages ?? 1}
                perPage={PER_PAGE}
                totalCount={all?.totalItems}
                currentPageCount={all?.data?.length}
                handlePreviousClick={() => setAllPage(Math.max(1, allPage - 1))}
                handleNextClick={() => setAllPage(allPage + 1)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <MentorVerifyDialog
          mentor={verifyState?.mentor ?? null}
          action={verifyState?.action ?? "approve"}
          open={!!verifyState}
          onOpenChange={(v) => !v && setVerifyState(null)}
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
      </div>
    </TooltipProvider>
  );
}
