"use client";

/**
 * Manage Problem Statement Detail View
 *
 * 📍 src/features/problem-statements/components/manage-problem-statement-detail-view.tsx
 *
 * /dashboard/manage-problem-statements/[id] — company owners and admins.
 *  1. Header: back link, status badges, title, provider, one action bar
 *     (Edit · Publish/Unpublish · More → View public page / Delete)
 *  2. Stats: trying, submitted, deadline, published
 *  3. About: description + skills
 *  4. Participants: status tabs, search, roster table, pagination
 * Every fact and action appears once.
 */

import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MoreHorizontal,
  Pencil,
  Send,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RowActionButton } from "@/components/dashboard/table/row-action-button";
import { SearchBar } from "@/components/dashboard/table/SearchBar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { StateDisplay } from "@/components/ui/state-display";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserInfo } from "@/features/auth";
import { ROLES } from "@/lib/auth/roles";
import {
  useAdminDeleteStatement,
  useAdminDeleteUserInteraction,
  useAdminInteractions,
  useAdminPublishStatement,
  useAdminStatementDetail,
  useAdminUnpublishStatement,
  useCompanyInteractions,
  useCompanyStatementDetail,
  useDeleteCompanyStatement,
  usePublishCompanyStatement,
  useUnpublishCompanyStatement,
} from "../hooks";
import { formatDate, formatDateTime, formatDeadline } from "../lib/format";
import type {
  InteractionStatus,
  InteractionsQueryParams,
} from "../types/problem-statement.types";
import { ProblemStatementAboutSection } from "./problem-statement-about-section";
import { ProblemStatementCompany } from "./problem-statement-company";
import { ProblemStatementFormDialog } from "./problem-statement-form-dialog";
import {
  ProblemStatementAvailabilityBadge,
  ProblemStatementParticipationBadge,
  ProblemStatementStatusBadge,
} from "./problem-statement-status-badge";
import { ProblemStatementsPagination } from "./problem-statements-pagination";

const ROSTER_PER_PAGE = 20;
const LIST_HREF = "/dashboard/manage-problem-statements";

type RosterFilter = "all" | InteractionStatus;

interface ManageProblemStatementDetailViewProps {
  statementId: string;
}

function BackLink() {
  return (
    <Button
      variant="ghost"
      asChild
      className="gap-2 text-muted-foreground hover:text-foreground"
    >
      <Link href={LIST_HREF}>
        <ArrowLeft className="h-4 w-4" />
        Back to Problem Statements
      </Link>
    </Button>
  );
}

export function ManageProblemStatementDetailView({
  statementId,
}: ManageProblemStatementDetailViewProps) {
  const router = useRouter();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [rosterFilter, setRosterFilter] = useState<RosterFilter>("all");
  const [rosterPage, setRosterPage] = useState(1);
  const [removingUser, setRemovingUser] = useState<{
    userId: string;
    fullName: string;
  } | null>(null);

  const { data: userInfo, isLoading: isUserLoading } = useUserInfo();
  const userRoles = (userInfo?.roles as string[]) ?? [];
  const isAdmin = userRoles.includes(ROLES.ADMIN);
  const isCompany = userRoles.includes(ROLES.COMPANY);

  // Queries
  const companyDetailQuery = useCompanyStatementDetail(statementId, {
    enabled: Boolean(userInfo && !isAdmin && isCompany),
  });
  const adminDetailQuery = useAdminStatementDetail(statementId, {
    enabled: Boolean(userInfo && isAdmin),
  });
  const detailQuery = isAdmin ? adminDetailQuery : companyDetailQuery;
  const { data: statement, isLoading: isDetailLoading, isError } = detailQuery;

  const interactionsParams: InteractionsQueryParams = {
    pageIndex: rosterPage,
    perPage: ROSTER_PER_PAGE,
    search: searchQuery || undefined,
    status: rosterFilter === "all" ? undefined : rosterFilter,
  };
  const companyInteractionsQuery = useCompanyInteractions(
    statementId,
    interactionsParams,
    { enabled: Boolean(userInfo && !isAdmin && isCompany) },
  );
  const adminInteractionsQuery = useAdminInteractions(
    statementId,
    interactionsParams,
    { enabled: Boolean(userInfo && isAdmin) },
  );
  const { data: interactionsData, isLoading: interactionsLoading } = isAdmin
    ? adminInteractionsQuery
    : companyInteractionsQuery;

  // Mutations
  const publishCompanyMutation = usePublishCompanyStatement();
  const publishAdminMutation = useAdminPublishStatement();
  const publishMutation = isAdmin
    ? publishAdminMutation
    : publishCompanyMutation;
  const unpublishCompanyMutation = useUnpublishCompanyStatement();
  const unpublishAdminMutation = useAdminUnpublishStatement();
  const unpublishMutation = isAdmin
    ? unpublishAdminMutation
    : unpublishCompanyMutation;
  const deleteCompanyMutation = useDeleteCompanyStatement();
  const deleteAdminMutation = useAdminDeleteStatement();
  const deleteMutation = isAdmin ? deleteAdminMutation : deleteCompanyMutation;
  const removeUserMutation = useAdminDeleteUserInteraction();

  const interactions = interactionsData?.data ?? [];
  const tryingCount =
    interactionsData?.counts?.Trying ??
    statement?.interaction_counts?.Trying ??
    0;
  const submittedCount =
    interactionsData?.counts?.Submitted ??
    statement?.interaction_counts?.Submitted ??
    0;
  const totalParticipants = tryingCount + submittedCount;
  const totalRosterPages = interactionsData?.pagination?.totalPages ?? 1;
  const hasActiveFilter = Boolean(searchQuery || rosterFilter !== "all");

  // Don't strand the roster on an empty page after removals shrink it.
  useEffect(() => {
    if (
      !interactionsLoading &&
      interactions.length === 0 &&
      rosterPage > 1 &&
      rosterPage > totalRosterPages
    ) {
      setRosterPage(Math.max(1, totalRosterPages));
    }
  }, [interactions.length, rosterPage, totalRosterPages, interactionsLoading]);

  const handlePublish = async () => {
    if (!statement) return;
    try {
      await publishMutation.mutateAsync(statement.id);
      toast.success("Published. Learners can now see this problem statement.");
      setShowPublishDialog(false);
    } catch {
      // error toast is owned by the mutation hook
    }
  };

  const handleUnpublish = async () => {
    if (!statement) return;
    try {
      await unpublishMutation.mutateAsync(statement.id);
      toast.success("Unpublished. It's now hidden from learners.");
      setShowUnpublishDialog(false);
    } catch {
      // error toast is owned by the mutation hook
    }
  };

  const handleDelete = async () => {
    if (!statement) return;
    try {
      await deleteMutation.mutateAsync(statement.id);
      router.push(LIST_HREF);
    } catch {
      // error toast is owned by the mutation hook
    }
  };

  const handleRemoveUser = async () => {
    if (!removingUser || !statement) return;
    try {
      await removeUserMutation.mutateAsync({
        statementId: statement.id,
        userId: removingUser.userId,
      });
      setRemovingUser(null);
      if (interactions.length <= 1 && rosterPage > 1) {
        setRosterPage((p) => Math.max(1, p - 1));
      }
    } catch {
      // error toast is owned by the mutation hook
    }
  };

  if (isUserLoading || isDetailLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-md" />
        <div className="space-y-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-8 w-2/3" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["a", "b", "c", "d"].map((k) => (
            <Skeleton key={k} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !statement) {
    return (
      <StateDisplay
        variant="not-found"
        title="Problem statement not found"
        description="It may have been deleted, or you don't have access to manage it."
        action={<BackLink />}
      />
    );
  }

  const isPublished = statement.status === "Published";

  return (
    <div className="space-y-6">
      <BackLink />

      {/* ─── Header + the single action bar ─── */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <ProblemStatementStatusBadge status={statement.status} />
            {isPublished && (
              <ProblemStatementAvailabilityBadge isOpen={statement.is_open} />
            )}
            <Badge>{statement.category}</Badge>
          </div>
          <h1 className="text-2xl font-bold leading-tight text-foreground md:text-3xl">
            {statement.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <ProblemStatementCompany
              company={statement.company}
              nameClassName="text-sm"
            />
            <span className="text-sm text-muted-foreground">
              Updated {formatDateTime(statement.updated_at)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setShowEditDialog(true)}>
            <Pencil />
            Edit
          </Button>
          {isPublished ? (
            <Button
              variant="outline"
              onClick={() => setShowUnpublishDialog(true)}
              disabled={unpublishMutation.isPending}
            >
              {unpublishMutation.isPending && (
                <Loader2 className="animate-spin" />
              )}
              Unpublish
            </Button>
          ) : (
            <Button
              onClick={() => setShowPublishDialog(true)}
              disabled={publishMutation.isPending}
            >
              {publishMutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Send />
              )}
              Publish
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="More actions">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              {isPublished && (
                <>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/dashboard/problem-statements/${statement.id}`}
                      target="_blank"
                    >
                      <ExternalLink />
                      View Public Page
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setShowDeleteDialog(true)}
              >
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ─── At a glance ─── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Trying"
          value={tryingCount}
          icon={<Users className="size-5" />}
          accent="chart-2"
        />
        <StatCard
          title="Submitted"
          value={submittedCount}
          icon={<CheckCircle2 className="size-5" />}
          accent="chart-3"
        />
        <StatCard
          title="Deadline"
          value={
            <span className="text-lg">
              {formatDeadline(statement.deadline)}
            </span>
          }
          description={
            statement.deadline ? formatDateTime(statement.deadline) : undefined
          }
          icon={<CalendarClock className="size-5" />}
          accent="chart-4"
        />
        <StatCard
          title="Published"
          value={
            <span className="text-lg">
              {statement.published_at
                ? formatDate(statement.published_at)
                : "Not yet"}
            </span>
          }
          description={
            isPublished
              ? statement.is_open
                ? "Visible and open"
                : "Visible, submissions closed"
              : "Hidden from learners"
          }
          icon={<Send className="size-5" />}
          accent="chart-1"
        />
      </div>

      <ProblemStatementAboutSection
        description={statement.description}
        skills={statement.skills}
      />

      {/* ─── Participants ─── */}
      <Card className="gap-0 rounded-2xl pb-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Participants</CardTitle>
          <CardDescription>
            Learners working on this problem statement and the solution links
            they've submitted.
          </CardDescription>
        </CardHeader>

        {(totalParticipants > 0 || hasActiveFilter) && (
          <div className="flex flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Tabs
              value={rosterFilter}
              onValueChange={(v) => {
                setRosterFilter(v as RosterFilter);
                setRosterPage(1);
              }}
            >
              <TabsList>
                <TabsTrigger value="all">All ({totalParticipants})</TabsTrigger>
                <TabsTrigger value="Submitted">
                  Submitted ({submittedCount})
                </TabsTrigger>
                <TabsTrigger value="Trying">Trying ({tryingCount})</TabsTrigger>
              </TabsList>
            </Tabs>
            <SearchBar
              onSearch={(value) => {
                setSearchQuery(value);
                setRosterPage(1);
              }}
              placeholder="Search by name or MUID…"
              size="sm"
              showButton={false}
              className="sm:w-64"
            />
          </div>
        )}

        <div className="border-t border-border">
          {interactionsLoading ? (
            <div className="space-y-3 p-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : interactions.length === 0 ? (
            <StateDisplay
              variant="no-results"
              size="sm"
              title={
                hasActiveFilter
                  ? "No matching participants"
                  : "No participants yet"
              }
              description={
                hasActiveFilter
                  ? "Try a different name, MUID or status."
                  : isPublished
                    ? "Learners who choose “I'm Trying It” or submit a solution will appear here."
                    : "Publish this problem statement so learners can start working on it."
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Learner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Solution</TableHead>
                  <TableHead>Date</TableHead>
                  {isAdmin && (
                    <TableHead className="w-12 pr-6">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {interactions.map((interaction) => (
                  <TableRow key={interaction.user_id}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="text-xs font-semibold">
                            {(interaction.full_name || "L")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {interaction.full_name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {interaction.muid}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ProblemStatementParticipationBadge
                        status={interaction.status}
                      />
                    </TableCell>
                    <TableCell className="max-w-64">
                      {interaction.submission_url ? (
                        <a
                          href={interaction.submission_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={interaction.submission_url}
                          className="flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"
                        >
                          <ExternalLink className="size-3.5 shrink-0" />
                          <span className="truncate">
                            {interaction.submission_url.replace(
                              /^https?:\/\//,
                              "",
                            )}
                          </span>
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {interaction.submitted_at
                        ? `Submitted ${formatDate(interaction.submitted_at)}`
                        : `Joined ${formatDate(interaction.created_at)}`}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="pr-6 text-right">
                        <RowActionButton
                          icon={Trash2}
                          label="Remove participant"
                          tone="destructive"
                          onClick={() =>
                            setRemovingUser({
                              userId: interaction.user_id,
                              fullName: interaction.full_name,
                            })
                          }
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {!interactionsLoading &&
          (interactionsData?.pagination?.count ?? 0) > 0 && (
            <div className="px-6 pb-4">
              <ProblemStatementsPagination
                pagination={interactionsData?.pagination}
                currentPage={rosterPage}
                perPage={ROSTER_PER_PAGE}
                onPageChange={setRosterPage}
              />
            </div>
          )}
      </Card>

      <ProblemStatementFormDialog
        open={showEditDialog}
        mode={isAdmin ? "admin-edit" : "company-edit"}
        statement={statement}
        onClose={() => setShowEditDialog(false)}
        onSuccess={() => setShowEditDialog(false)}
      />

      <ConfirmDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        title="Publish this problem statement?"
        description="Learners will be able to see it and start working on it. You can unpublish it later."
        variant="success"
        confirmLabel="Publish"
        onConfirm={handlePublish}
        isPending={publishMutation.isPending}
      />

      <ConfirmDialog
        open={showUnpublishDialog}
        onOpenChange={setShowUnpublishDialog}
        title="Unpublish this problem statement?"
        description="It will be hidden from learners. Existing participants and submissions are kept."
        variant="warning"
        confirmLabel="Unpublish"
        onConfirm={handleUnpublish}
        isPending={unpublishMutation.isPending}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete this problem statement?"
        description="This permanently deletes it along with every participant and submission. This can't be undone."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />

      <ConfirmDialog
        open={Boolean(removingUser)}
        onOpenChange={(open) => !open && setRemovingUser(null)}
        title="Remove this participant?"
        description={`${removingUser?.fullName ?? "This learner"}'s participation and any submitted solution will be permanently removed from this problem statement.`}
        variant="destructive"
        confirmLabel="Remove"
        onConfirm={handleRemoveUser}
        isPending={removeUserMutation.isPending}
      />
    </div>
  );
}
