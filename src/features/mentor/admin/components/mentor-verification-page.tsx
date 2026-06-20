"use client";

import { CheckCircle, Search, XCircle } from "lucide-react";
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
import { useMentorList } from "../hooks/use-mentor-verify";
import type { MentorApplicationListItem } from "../schemas";
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
}: {
  items: MentorApplicationListItem[] | undefined;
  isLoading: boolean;
  showActions: boolean;
  onVerify: (
    m: MentorApplicationListItem,
    action: "approve" | "reject",
  ) => void;
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
                {isActionable(m) ? (
                  <div className="flex items-center gap-1">
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
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export function MentorVerificationPage() {
  const [search, setSearch] = useState("");
  const [verifyState, setVerifyState] = useState<{
    mentor: MentorApplicationListItem;
    action: "approve" | "reject";
  } | null>(null);

  const { data: pending, isLoading: pendingLoading } = useMentorList({
    status: "PENDING",
    search: search || undefined,
  });
  const { data: all, isLoading: allLoading } = useMentorList({
    search: search || undefined,
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
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email…"
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
            />
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            <MentorTable
              items={all?.data}
              isLoading={allLoading}
              showActions
              onVerify={(m, action) => setVerifyState({ mentor: m, action })}
            />
          </TabsContent>
        </Tabs>

        <MentorVerifyDialog
          mentor={verifyState?.mentor ?? null}
          action={verifyState?.action ?? "approve"}
          open={!!verifyState}
          onOpenChange={(v) => !v && setVerifyState(null)}
        />
      </div>
    </TooltipProvider>
  );
}
