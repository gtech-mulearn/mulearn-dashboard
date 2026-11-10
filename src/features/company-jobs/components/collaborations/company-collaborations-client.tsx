"use client";

import { Handshake, Plus, RefreshCw } from "lucide-react";
import { type ReactNode, useState } from "react";
import Pagination from "@/components/dashboard/table/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
import { formatShortDate } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import {
  useCollaborations,
  useDiscoverCollaborations,
  useWithdrawCollaboration,
} from "../../hooks/use-company-collaborations";
import {
  COLLAB_TARGET_LABELS,
  COLLAB_TYPE_LABELS,
} from "../../lib/collaboration-payload";
import type {
  CollaborationPage,
  CollabStatus,
  CompanyCollaboration,
} from "../../types";
import { CreateCollaborationDialog } from "./create-collaboration-dialog";

const PAGE_SIZE = 10;

const STATUS_BADGE: Record<CollabStatus, { label: string; className: string }> =
  {
    OPEN: {
      label: "Open",
      className:
        "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-400",
    },
    PENDING: {
      label: "Awaiting response",
      className:
        "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    },
    ACCEPTED: {
      label: "Accepted",
      className:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    },
    DECLINED: {
      label: "Declined",
      className:
        "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400",
    },
    WITHDRAWN: {
      label: "Withdrawn",
      className: "border-border bg-muted text-muted-foreground",
    },
  };

const canWithdraw = (c: CompanyCollaboration) =>
  c.status === "OPEN" || c.status === "PENDING";

function audienceLabel(c: CompanyCollaboration): string {
  if (!c.target_type) return "Open to all";
  return `Invited ${COLLAB_TARGET_LABELS[c.target_type].toLowerCase()}`;
}

function statusDetail(c: CompanyCollaboration): string | null {
  if (c.status === "DECLINED" && c.rejection_reason) {
    return `“${c.rejection_reason}”`;
  }
  if (c.status === "ACCEPTED" || c.status === "DECLINED") {
    return (
      [
        c.responded_by_name ? `By ${c.responded_by_name}` : null,
        c.responded_at ? formatShortDate(c.responded_at) : null,
      ]
        .filter(Boolean)
        .join(" · ") || null
    );
  }
  return null;
}

function ListState({
  isLoading,
  isError,
  onRetry,
  isEmpty,
  empty,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  isEmpty: boolean;
  empty: ReactNode;
  children: ReactNode;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {(["a", "b", "c"] as const).map((k) => (
          <Skeleton key={k} className="h-14 w-full" />
        ))}
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-10 text-center">
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t load these collaborations.
        </p>
        <Button variant="outline" size="sm" className="gap-2" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
      </div>
    );
  }
  if (isEmpty) return <>{empty}</>;
  return <>{children}</>;
}

function PageControls({
  page,
  data,
  onPage,
}: {
  page: number;
  data: CollaborationPage | undefined;
  onPage: (page: number) => void;
}) {
  const totalPages = data?.pagination.totalPages ?? 1;
  if (totalPages <= 1) return null;
  return (
    <Pagination
      currentPage={page}
      totalPages={totalPages}
      perPage={PAGE_SIZE}
      totalCount={data?.pagination.count}
      handlePreviousClick={() => onPage(Math.max(1, page - 1))}
      handleNextClick={() => onPage(Math.min(totalPages, page + 1))}
    />
  );
}

export function CompanyCollaborationsPageClient() {
  const [tab, setTab] = useState<"mine" | "open">("mine");
  const [minePage, setMinePage] = useState(1);
  const [openPage, setOpenPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState<CompanyCollaboration | null>(
    null,
  );

  const mine = useCollaborations({ page: minePage, perPage: PAGE_SIZE });
  const discover = useDiscoverCollaborations(
    { page: openPage, perPage: PAGE_SIZE },
    { enabled: tab === "open" },
  );
  const withdraw = useWithdrawCollaboration();

  const myPosts = mine.data?.data ?? [];
  const openPosts = discover.data?.data ?? [];

  const newButton = (
    <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
      <Plus className="h-4 w-4" aria-hidden="true" />
      New collaboration
    </Button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
            <Handshake className="h-8 w-8 text-primary" aria-hidden="true" />
            Collaborations
          </h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Partner with campuses and interest groups on events, sponsorships,
            campus programmes and mentoring.
          </p>
        </div>
        <div className="shrink-0">{newButton}</div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "mine" | "open")}>
        <TabsList>
          <TabsTrigger value="mine">Your posts</TabsTrigger>
          <TabsTrigger value="open">Open posts</TabsTrigger>
        </TabsList>

        <TabsContent value="mine" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your posts</CardTitle>
              <CardDescription>
                Open posts are visible to every campus and interest group.
                Direct invites wait for that campus or IG to respond.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ListState
                isLoading={mine.isLoading}
                isError={mine.isError}
                onRetry={() => mine.refetch()}
                isEmpty={myPosts.length === 0}
                empty={
                  <div className="rounded-lg border border-dashed py-12 text-center">
                    <Handshake
                      className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50"
                      aria-hidden="true"
                    />
                    <h3 className="text-base font-semibold text-foreground">
                      No collaborations yet
                    </h3>
                    <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                      Post your first collaboration to reach campuses and
                      interest groups on muLearn.
                    </p>
                    <div className="mt-4">{newButton}</div>
                  </div>
                }
              >
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Collaboration</TableHead>
                        <TableHead>Audience</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Posted</TableHead>
                        <TableHead className="text-right">
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myPosts.map((c) => {
                        const badge = STATUS_BADGE[c.status];
                        const detail = statusDetail(c);
                        return (
                          <TableRow key={c.id}>
                            <TableCell className="max-w-xs">
                              <div className="font-medium text-foreground">
                                {c.title}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {COLLAB_TYPE_LABELS[c.collab_type]}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {audienceLabel(c)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn("font-medium", badge.className)}
                              >
                                {badge.label}
                              </Badge>
                              {detail && (
                                <div className="mt-1 max-w-56 text-xs text-muted-foreground">
                                  {detail}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatShortDate(c.created_at)}
                            </TableCell>
                            <TableCell className="text-right">
                              {canWithdraw(c) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => setWithdrawing(c)}
                                >
                                  Withdraw
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <PageControls
                  page={minePage}
                  data={mine.data}
                  onPage={setMinePage}
                />
              </ListState>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="open" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Open posts</CardTitle>
              <CardDescription>
                Every company&apos;s open collaboration posts, as campuses and
                interest groups see them.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ListState
                isLoading={discover.isLoading}
                isError={discover.isError}
                onRetry={() => discover.refetch()}
                isEmpty={openPosts.length === 0}
                empty={
                  <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                    No open collaboration posts right now.
                  </p>
                }
              >
                <ul className="grid gap-3 md:grid-cols-2">
                  {openPosts.map((c) => (
                    <li key={c.id} className="rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        {c.company_logo ? (
                          // biome-ignore lint/performance/noImgElement: external logo URL, next/image would require configuring all possible domains
                          <img
                            src={c.company_logo}
                            alt=""
                            className="h-8 w-8 rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary">
                            {(c.company_name ?? "?").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {c.company_name ?? "A company"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {COLLAB_TYPE_LABELS[c.collab_type]} ·{" "}
                            {formatShortDate(c.created_at)}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 font-medium text-foreground">
                        {c.title}
                      </p>
                      {c.description && (
                        <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                          {c.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
                <PageControls
                  page={openPage}
                  data={discover.data}
                  onPage={setOpenPage}
                />
              </ListState>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateCollaborationDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      <ConfirmDialog
        open={withdrawing !== null}
        onOpenChange={(open) => {
          if (!open) setWithdrawing(null);
        }}
        variant="destructive"
        title="Withdraw this collaboration?"
        description={
          withdrawing?.status === "PENDING"
            ? `"${withdrawing.title}" will be withdrawn and the invited campus or IG can no longer respond.`
            : `"${withdrawing?.title ?? ""}" will be removed from the open posts campuses and IGs can see.`
        }
        confirmLabel="Withdraw"
        isPending={withdraw.isPending}
        onConfirm={() => {
          if (!withdrawing) return;
          withdraw.mutate(withdrawing.id, {
            onSettled: () => setWithdrawing(null),
          });
        }}
      />
    </div>
  );
}
