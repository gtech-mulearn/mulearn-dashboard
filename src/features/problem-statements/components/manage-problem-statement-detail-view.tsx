"use client";

/**
 * Manage Problem Statement Detail View
 *
 * 📍 src/features/problem-statements/components/manage-problem-statement-detail-view.tsx
 *
 * Dedicated admin & company management view for a specific problem statement.
 * Unifies the Challenge Description and the list of Learners who joined into a
 * single, cohesive, responsive 2-column layout — eliminating disjointed tabs.
 *
 * Layout:
 *  - Responsive container & padding aligned with Events management design
 *  - Top navigation bar with breadcrumb & lifecycle actions (Edit, Publish, Delete)
 *  - Overview Identity Card with key status pills, deadline, and jump anchor
 *  - 2-Column Responsive Grid:
 *      * Main Column:
 *          1. Challenge Overview & Requirements (MarkdownRenderer)
 *          2. Required & Relevant Skills
 *          3. Learners Trying It (Live search, user details, MUID, join date)
 *      * Sticky Sidebar:
 *          1. Quick Actions & Status Control Card
 *          2. Problem Provider Card
 *          3. Analytics & Timeline Card
 */

import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Edit2,
  ExternalLink,
  Loader2,
  Play,
  Search,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StateDisplay } from "@/components/ui/state-display";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUserInfo } from "@/features/auth";
import { getApiResponseError } from "@/hooks/use-get-error";
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
import type { InteractionsQueryParams } from "../types/problem-statement.types";
import { ProblemStatementAboutSection } from "./problem-statement-about-section";
import { ProblemStatementFormDialog } from "./problem-statement-form-dialog";
import { ProblemStatementStatusBadge } from "./problem-statement-status-badge";
import { ProblemStatementsPagination } from "./problem-statements-pagination";

interface ManageProblemStatementDetailViewProps {
  statementId: string;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDeadline(deadline: string | null): string | null {
  if (!deadline) return null;
  const d = new Date(deadline);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  if (diff < 0) return "Deadline passed";
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Ends today";
  if (days === 1) return "1 day left";
  if (days <= 7) return `${days} days left`;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
  const [interactionStatusFilter, setInteractionStatusFilter] = useState<
    "all" | "Submitted" | "Trying"
  >("all");
  const [rosterPage, setRosterPage] = useState(1);
  const [deletingUser, setDeletingUser] = useState<{
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
    perPage: 20,
    search: searchQuery.trim() || undefined,
    status:
      interactionStatusFilter === "all" ? undefined : interactionStatusFilter,
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
  const interactionsQuery = isAdmin
    ? adminInteractionsQuery
    : companyInteractionsQuery;
  const { data: interactionsData, isLoading: interactionsLoading } =
    interactionsQuery;

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

  const adminDeleteUserMutation = useAdminDeleteUserInteraction();

  const isLoading = isUserLoading || isDetailLoading;

  const interactions = interactionsData?.data ?? [];
  const tryingCount =
    interactionsData?.counts?.Trying ??
    statement?.interaction_counts?.Trying ??
    0;
  const submittedCount =
    interactionsData?.counts?.Submitted ??
    statement?.interaction_counts?.Submitted ??
    0;
  const deadlineText = formatDeadline(statement?.deadline ?? null);
  const hasActiveFilter = Boolean(
    searchQuery.trim() || interactionStatusFilter !== "all",
  );

  const handleConfirmDeleteUser = async () => {
    if (!deletingUser || !statement) return;
    try {
      await adminDeleteUserMutation.mutateAsync({
        statementId: statement.id,
        userId: deletingUser.userId,
      });
      setDeletingUser(null);
    } catch {
      // toast is handled by mutation hook
    }
  };

  // Lifecycle handlers
  const handlePublish = async () => {
    if (!statement) return;
    try {
      await publishMutation.mutateAsync(statement.id);
      toast.success("Problem statement published! Learners can now see it.");
      setShowPublishDialog(false);
    } catch (err) {
      toast.error(getApiResponseError(err, { fallback: "Failed to publish" }));
    }
  };

  const handleUnpublish = async () => {
    if (!statement) return;
    try {
      await unpublishMutation.mutateAsync(statement.id);
      toast.success("Problem statement unpublished. Hidden from learners.");
      setShowUnpublishDialog(false);
    } catch (err) {
      toast.error(
        getApiResponseError(err, { fallback: "Failed to unpublish" }),
      );
    }
  };

  const handleDelete = async () => {
    if (!statement) return;
    try {
      await deleteMutation.mutateAsync(statement.id);
      router.push("/dashboard/manage-problem-statements");
    } catch {
      // toast handled by mutation hook
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-full overflow-x-hidden px-0 py-2 lg:p-4 min-h-[calc(100vh-6rem)]">
        <div className="mx-auto w-full space-y-5 pb-24 lg:pb-6 lc-fade-in overflow-x-hidden">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-5">
              <Skeleton className="h-72 w-full rounded-2xl" />
              <Skeleton className="h-80 w-full rounded-2xl" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-60 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !statement) {
    return (
      <div className="w-full max-w-full overflow-x-hidden px-0 py-2 lg:p-4 min-h-[calc(100vh-6rem)]">
        <div className="mx-auto max-w-xl py-16">
          <StateDisplay
            variant="no-results"
            title="Statement Not Found"
            description="You might not have access to manage this problem statement, or it may have been deleted."
            action={
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/dashboard/manage-problem-statements">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Manage Problem Statements
                </Link>
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const companyName = statement.company?.name || "μLearn";

  return (
    <div className="w-full max-w-full overflow-x-hidden px-0 py-2 lg:p-4 min-h-[calc(100vh-6rem)]">
      <div className="mx-auto w-full space-y-5 pb-24 lg:pb-6 lc-fade-in overflow-x-hidden">
        {/* ─── Top Navigation & Action Controls ─── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="rounded-xl text-xs gap-1.5 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <Link href="/dashboard/manage-problem-statements">
              <ArrowLeft className="h-3.5 w-3.5" />
              Manage Problem Statements
            </Link>
          </Button>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Public view link */}
            {statement.status === "Published" && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="rounded-xl text-xs gap-1.5"
              >
                <Link
                  href={`/dashboard/problem-statements/${statement.id}`}
                  target="_blank"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Public View
                </Link>
              </Button>
            )}

            {/* Edit */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowEditDialog(true)}
              className="rounded-xl text-xs gap-1.5"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit
            </Button>

            {/* Publish / Unpublish */}
            {(statement.status === "Draft" ||
              statement.status === "Unpublished") && (
              <Button
                size="sm"
                onClick={() => setShowPublishDialog(true)}
                disabled={publishMutation.isPending}
                className="rounded-xl text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {publishMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5" />
                )}
                Publish
              </Button>
            )}
            {statement.status === "Published" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowUnpublishDialog(true)}
                disabled={unpublishMutation.isPending}
                className="rounded-xl text-xs gap-1.5 text-amber-600 border-amber-500/20 hover:bg-amber-500/10"
              >
                {unpublishMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <X className="h-3.5 w-3.5" />
                )}
                Unpublish
              </Button>
            )}

            {/* Delete */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDeleteDialog(true)}
              className="rounded-xl text-xs text-destructive hover:bg-destructive/10"
              title="Delete statement"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* ─── Identity Overview Header Card ─── */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <ProblemStatementStatusBadge status={statement.status} />
              {statement.is_open ? (
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle className="h-3 w-3" />
                  Open for Submissions
                </span>
              ) : statement.status === "Published" ? (
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground border border-border">
                  Deadline Passed
                </span>
              ) : null}

              <Badge
                variant="outline"
                className="rounded-full border-brand-blue/20 bg-brand-blue/8 text-brand-blue text-xs px-2.5 py-0.5"
              >
                {statement.category}
              </Badge>
            </div>

            <h1 className="text-2xl font-bold text-foreground md:text-3xl leading-snug">
              {statement.title}
            </h1>
          </div>

          {/* Quick Meta strip with Jump Link */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-4 border-t border-border/60 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              <span>{companyName}</span>
            </div>

            <span className="h-3 w-px bg-border hidden sm:inline-block" />

            <div className="flex items-center gap-1.5">
              {statement.is_open ? (
                <Calendar className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span>
                {deadlineText
                  ? `Deadline: ${deadlineText}`
                  : "No deadline (Continuous)"}
              </span>
            </div>

            <span className="h-3 w-px bg-border hidden sm:inline-block" />

            <a
              href="#learners-section"
              className="flex items-center gap-1.5 text-primary hover:underline font-semibold"
              title="Jump to learners roster"
            >
              <Users className="h-3.5 w-3.5" />
              <span>
                <strong>{tryingCount}</strong> trying •{" "}
                <strong>{submittedCount}</strong> submitted ↓
              </span>
            </a>

            {statement.published_at && (
              <>
                <span className="h-3 w-px bg-border hidden sm:inline-block" />
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Published {formatDate(statement.published_at)}</span>
                </div>
              </>
            )}

            <div className="ml-auto text-[11px] text-muted-foreground hidden md:block">
              Updated {formatDate(statement.updated_at)}
            </div>
          </div>
        </div>

        {/* ─── 2-Column Responsive Grid (All Content Together) ─── */}
        <div className="grid gap-5 w-full max-w-full overflow-x-hidden lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main Column */}
          <div className="min-w-0 w-full max-w-full space-y-5 overflow-x-hidden">
            {/* 1. Challenge Overview & Requirements Card with Read More / Read Less */}
            <ProblemStatementAboutSection description={statement.description} />

            {/* 2. Required & Relevant Skills Card */}
            {statement.skills && statement.skills.length > 0 && (
              <div className="rounded-2xl border border-border bg-card shadow-sm">
                <div className="flex items-center gap-2.5 px-5 py-4">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                    <Sparkles className="size-4 text-primary" />
                  </div>
                  <h2 className="text-base font-bold text-foreground">
                    Required & Relevant Skills
                  </h2>
                </div>
                <div className="relative px-5 pb-5 pt-0">
                  <div className="flex flex-wrap gap-2">
                    {statement.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs hover:border-primary/40 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Learners Who Joined & Are Trying / Submitted */}
            <div
              id="learners-section"
              className="rounded-2xl border border-border bg-card shadow-sm scroll-mt-6"
            >
              <div className="flex flex-col gap-4 p-5 border-b border-border/50">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                      <Users className="size-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-foreground">
                          Learner Participants & Submissions
                        </h2>
                        <Badge
                          variant="secondary"
                          className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        >
                          {interactionsData?.pagination?.count ??
                            tryingCount + submittedCount}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {tryingCount} actively trying • {submittedCount}{" "}
                        submitted solution deliverables
                      </p>
                    </div>
                  </div>

                  {/* Real-time search filter */}
                  {(interactions.length > 0 || hasActiveFilter) && (
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or MUID..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setRosterPage(1);
                        }}
                        className="pl-9 h-8 text-xs rounded-xl bg-background"
                      />
                    </div>
                  )}
                </div>

                {/* Status Filter Tabs */}
                {(interactions.length > 0 || hasActiveFilter) && (
                  <div className="flex items-center gap-1.5 self-start rounded-xl bg-muted/50 p-1 border border-border/60">
                    {[
                      {
                        label: "All",
                        value: "all",
                        count: tryingCount + submittedCount,
                      },
                      {
                        label: "Submitted",
                        value: "Submitted",
                        count: submittedCount,
                      },
                      { label: "Trying", value: "Trying", count: tryingCount },
                    ].map((tab) => (
                      <button
                        key={tab.value}
                        type="button"
                        onClick={() => {
                          setInteractionStatusFilter(
                            tab.value as "all" | "Submitted" | "Trying",
                          );
                          setRosterPage(1);
                        }}
                        className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                          interactionStatusFilter === tab.value
                            ? "bg-background text-foreground shadow-xs ring-1 ring-border"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {tab.label} ({tab.count})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Table or state display */}
              <div className="p-0">
                {interactionsLoading ? (
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                  </div>
                ) : interactions.length === 0 ? (
                  hasActiveFilter ? (
                    <div className="p-6">
                      <StateDisplay
                        variant="no-results"
                        className="rounded-2xl border border-dashed border-border bg-muted/20 py-8"
                        title="No matches found"
                        description={
                          searchQuery.trim()
                            ? `No learners matching "${searchQuery}". Try a different name or MUID.`
                            : `No learners found with status "${interactionStatusFilter}".`
                        }
                        action={
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSearchQuery("");
                              setInteractionStatusFilter("all");
                              setRosterPage(1);
                            }}
                            className="rounded-xl text-xs"
                          >
                            Clear Filters
                          </Button>
                        }
                      />
                    </div>
                  ) : (
                    <div className="p-6">
                      <StateDisplay
                        variant="no-results"
                        className="rounded-2xl border border-dashed border-border bg-muted/20 py-10"
                        title="No learners participating yet"
                        description="When learners click 'I'm Trying It' or submit solution links, they'll appear here automatically."
                      />
                    </div>
                  )
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-border/60 bg-muted/30 hover:bg-muted/30">
                          <TableHead className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Learner
                          </TableHead>
                          <TableHead className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            MUID
                          </TableHead>
                          <TableHead className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Status
                          </TableHead>
                          <TableHead className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Submission Link
                          </TableHead>
                          <TableHead className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
                            Timestamp
                          </TableHead>
                          {isAdmin && (
                            <TableHead className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
                              Action
                            </TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {interactions.map((interaction) => {
                          const initials = (interaction.full_name || "L")
                            .slice(0, 2)
                            .toUpperCase();
                          const isSub = interaction.status === "Submitted";
                          return (
                            <TableRow
                              key={interaction.user_id}
                              className="transition-colors hover:bg-muted/40"
                            >
                              <TableCell className="px-5 py-3.5 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs">
                                    {initials}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-xs text-foreground">
                                      {interaction.full_name}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                      Participant
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-3.5 whitespace-nowrap text-xs text-muted-foreground font-mono">
                                @{interaction.muid}
                              </TableCell>
                              <TableCell className="px-4 py-3.5 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                                    isSub
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                  }`}
                                >
                                  {isSub ? (
                                    <CheckCircle className="size-3" />
                                  ) : (
                                    <Clock className="size-3" />
                                  )}
                                  {interaction.status}
                                </span>
                              </TableCell>
                              <TableCell className="px-4 py-3.5">
                                {interaction.submission_url ? (
                                  <a
                                    href={interaction.submission_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 font-mono text-xs text-primary hover:underline max-w-[260px] truncate"
                                    title={interaction.submission_url}
                                  >
                                    <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
                                    <span className="truncate">
                                      {interaction.submission_url}
                                    </span>
                                  </a>
                                ) : (
                                  <span className="text-xs text-muted-foreground italic">
                                    No submission link
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="px-5 py-3.5 whitespace-nowrap text-right">
                                {interaction.submitted_at ? (
                                  <div>
                                    <p className="text-xs font-medium text-foreground">
                                      {formatDate(interaction.submitted_at)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      Submitted
                                    </p>
                                  </div>
                                ) : (
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      {formatDate(interaction.created_at)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      Joined
                                    </p>
                                  </div>
                                )}
                              </TableCell>
                              {isAdmin && (
                                <TableCell className="px-4 py-3.5 whitespace-nowrap text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setDeletingUser({
                                        userId: interaction.user_id,
                                        fullName: interaction.full_name,
                                      })
                                    }
                                    className="size-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                                    title="Remove learner interaction"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>

                    {interactionsData?.pagination &&
                      interactionsData.pagination.count > 0 && (
                        <div className="border-t border-border/50 p-4">
                          <ProblemStatementsPagination
                            pagination={interactionsData.pagination}
                            currentPage={rosterPage}
                            onPageChange={setRosterPage}
                            currentCount={interactions.length}
                          />
                        </div>
                      )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ─── Sticky Sidebar Column ─── */}
          <aside className="min-w-0 w-full max-w-full space-y-4 overflow-x-hidden lg:sticky lg:top-6 lg:self-start">
            {/* Card 1: Management Actions & Status Control */}
            <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status & Controls
                </span>
                <ProblemStatementStatusBadge status={statement.status} />
              </div>

              {/* Publish / Unpublish CTA */}
              {(statement.status === "Draft" ||
                statement.status === "Unpublished") && (
                <Button
                  size="default"
                  onClick={() => setShowPublishDialog(true)}
                  disabled={publishMutation.isPending}
                  className="w-full rounded-full font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm"
                >
                  {publishMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Play className="size-4" />
                  )}
                  Publish to Learners
                </Button>
              )}

              {statement.status === "Published" && (
                <Button
                  size="default"
                  variant="outline"
                  onClick={() => setShowUnpublishDialog(true)}
                  disabled={unpublishMutation.isPending}
                  className="w-full rounded-full font-bold text-amber-600 border-amber-500/30 hover:bg-amber-500/10 gap-2"
                >
                  {unpublishMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <X className="size-4" />
                  )}
                  Unpublish Statement
                </Button>
              )}

              {/* Edit Details */}
              <Button
                variant="outline"
                size="default"
                onClick={() => setShowEditDialog(true)}
                className="w-full rounded-full text-xs font-semibold gap-1.5"
              >
                <Edit2 className="size-3.5" />
                Edit Statement Details
              </Button>

              {/* Public View */}
              {statement.status === "Published" && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="w-full rounded-full text-xs text-muted-foreground hover:text-foreground gap-1.5"
                >
                  <Link
                    href={`/dashboard/problem-statements/${statement.id}`}
                    target="_blank"
                  >
                    <ExternalLink className="size-3.5" />
                    Open Public Challenge Page
                  </Link>
                </Button>
              )}

              {/* Delete Button */}
              <div className="pt-2 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="w-full rounded-full text-xs text-destructive hover:bg-destructive/10 gap-1.5"
                >
                  <Trash2 className="size-3.5" />
                  Delete Problem Statement
                </Button>
              </div>
            </div>

            {/* Card 2: Problem Provider */}
            <div className="rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center gap-2.5 px-5 py-4">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                  <Building2 className="size-4 text-primary" />
                </div>
                <h2 className="text-base font-bold text-foreground">
                  Problem Provider
                </h2>
              </div>
              <div className="flex items-center gap-3 px-5 pb-5">
                {statement.company?.logo ? (
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-background border border-border">
                    <Image
                      src={statement.company.logo}
                      alt={companyName}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                ) : (
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary">
                    <span className="text-sm font-black text-primary-foreground">
                      {companyName.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <p
                    title={companyName}
                    className="text-sm font-bold text-foreground wrap-break-word line-clamp-2"
                  >
                    {companyName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isAdmin && !statement.company?.id
                      ? "Admin Managed"
                      : "Challenge Partner"}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Summary Analytics & Timeline */}
            <div className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-sm text-xs">
              <p className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                Engagement & Timeline
              </p>

              <div className="space-y-2.5 pt-1 text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Users className="size-3.5 text-primary" />
                    Total Trying
                  </span>
                  <span className="font-semibold text-foreground">
                    {tryingCount}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-primary" />
                    Deadline
                  </span>
                  <span className="font-semibold text-foreground">
                    {deadlineText ?? "None (Continuous)"}
                  </span>
                </div>

                {statement.published_at && (
                  <div className="flex items-center justify-between">
                    <span>Published</span>
                    <span className="text-foreground">
                      {formatDate(statement.published_at)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span>Last Updated</span>
                  <span className="text-foreground">
                    {formatDate(statement.updated_at)}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Edit dialog */}
      <ProblemStatementFormDialog
        open={showEditDialog}
        mode={isAdmin ? "admin-edit" : "company-edit"}
        statement={statement}
        onClose={() => setShowEditDialog(false)}
        onSuccess={() => setShowEditDialog(false)}
      />

      {/* Publish confirm */}
      <ConfirmDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        title="Publish this problem statement?"
        description="Learners will be able to see and interact with this statement. You can unpublish it later."
        confirmLabel="Publish"
        onConfirm={handlePublish}
        isPending={publishMutation.isPending}
      />

      {/* Unpublish confirm */}
      <ConfirmDialog
        open={showUnpublishDialog}
        onOpenChange={setShowUnpublishDialog}
        title="Unpublish this problem statement?"
        description="This statement will be hidden from learners. Existing interactions are preserved."
        variant="destructive"
        confirmLabel="Unpublish"
        onConfirm={handleUnpublish}
        isPending={unpublishMutation.isPending}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete this problem statement?"
        description="This action is permanent and cannot be undone. All learner interactions will also be deleted."
        variant="destructive"
        confirmLabel="Delete Forever"
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />

      {/* Delete learner interaction confirm (Admin only) */}
      <ConfirmDialog
        open={Boolean(deletingUser)}
        onOpenChange={(open) => !open && setDeletingUser(null)}
        title="Remove learner interaction?"
        description={`This will permanently remove ${deletingUser?.fullName}'s participation and submission from this challenge.`}
        variant="destructive"
        confirmLabel="Remove Learner"
        onConfirm={handleConfirmDeleteUser}
        isPending={adminDeleteUserMutation.isPending}
      />
    </div>
  );
}
