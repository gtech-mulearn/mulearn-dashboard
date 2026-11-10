"use client";

import {
  Clock,
  LogOut,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUserInfo } from "@/features/auth";
import { formatShortDate } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import { useCompanyAccess } from "../../hooks/use-company-access";
import {
  useCancelCompanyAdminInvite,
  useCompanyAdminLinks,
  useDeactivateCompanySelf,
  useInviteCompanyAdmin,
  useLeaveCompanyAdmin,
  useRemoveCompanyAdmin,
} from "../../hooks/use-company-admin-links";
import { adminLinkActions, coAdminSeats } from "../../lib/admin-link-actions";
import type { CompanyAdminLink, CompanyAdminLinkStatus } from "../../types";

const STATUS_BADGE: Record<
  CompanyAdminLinkStatus,
  { label: string; className: string }
> = {
  Accepted: {
    label: "Co-admin",
    className:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  Pending: {
    label: "Invite pending",
    className:
      "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  Declined: {
    label: "Declined",
    className: "border-border bg-muted text-muted-foreground",
  },
  Revoked: {
    label: "Revoked",
    className: "border-border bg-muted text-muted-foreground",
  },
};

function statusDetail(link: CompanyAdminLink): string | null {
  switch (link.status) {
    case "Accepted":
      return link.responded_at
        ? `Since ${formatShortDate(link.responded_at)}`
        : null;
    case "Pending":
      return "Waiting for them to accept";
    case "Declined":
      return link.responded_at ? formatShortDate(link.responded_at) : null;
    case "Revoked":
      return (
        [
          link.revoked_by_name ? `By ${link.revoked_by_name}` : null,
          link.revoked_at ? formatShortDate(link.revoked_at) : null,
        ]
          .filter(Boolean)
          .join(" · ") || null
      );
  }
}

type ConfirmState = {
  kind: "remove" | "leave" | "cancel";
  link: CompanyAdminLink;
} | null;

export function CompanyAdminsPageClient() {
  const router = useRouter();
  const { role, can } = useCompanyAccess();
  const { data: userInfo } = useUserInfo();
  const viewer = { role, muid: userInfo?.muid ?? null };

  const {
    data: adminLinks = [],
    isLoading,
    isError,
    refetch,
  } = useCompanyAdminLinks();
  const inviteMutation = useInviteCompanyAdmin();
  const removeMutation = useRemoveCompanyAdmin();
  const leaveMutation = useLeaveCompanyAdmin();
  const cancelInvite = useCancelCompanyAdminInvite();
  const deactivateMutation = useDeactivateCompanySelf();

  const [inviteMuid, setInviteMuid] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState>(null);

  const seats = coAdminSeats(adminLinks);
  const acceptedCount = adminLinks.filter(
    (l) => l.status === "Accepted",
  ).length;
  const pendingCount = adminLinks.filter((l) => l.status === "Pending").length;
  const seatsFull = seats.left === 0;

  const openInvite = () => setIsInviteOpen(true);

  const handleInvite = (e: FormEvent) => {
    e.preventDefault();
    const muid = inviteMuid.trim();
    if (!muid) return;
    // Errors (unknown muid, already a co-admin, seat cap) are toasted
    // verbatim by the hook; the dialog stays open so the ID can be fixed.
    inviteMutation.mutate(muid, {
      onSuccess: () => {
        setInviteMuid("");
        setIsInviteOpen(false);
      },
    });
  };

  const handleConfirm = () => {
    if (!confirm) return;
    const { kind, link } = confirm;
    if (kind === "remove") {
      removeMutation.mutate(link.id, { onSettled: () => setConfirm(null) });
      return;
    }
    if (kind === "cancel") {
      cancelInvite.mutate(link.id, { onSettled: () => setConfirm(null) });
      return;
    }
    leaveMutation.mutate(link.id, {
      onSuccess: () => router.replace("/dashboard"),
      onSettled: () => setConfirm(null),
    });
  };

  const confirmName = confirm?.link.user_name || confirm?.link.user_muid;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
            <ShieldCheck className="h-8 w-8 text-primary" aria-hidden="true" />
            Co-Administrators
          </h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            {can.manageAdmins
              ? `Invite up to ${seats.max} colleagues to help run your company on muLearn. Co-admins can do everything except edit the company profile, manage admins or deactivate the company.`
              : "You're a co-admin of this company. You can leave at any time from your row below."}
          </p>
        </div>

        {can.manageAdmins && (
          <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
            <Button className="gap-2" onClick={openInvite} disabled={seatsFull}>
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Invite co-admin
            </Button>
            {seatsFull && (
              <p className="max-w-xs text-xs text-muted-foreground sm:text-right">
                All {seats.max} seats are taken by co-admins or pending invites.
                A seat frees up when you remove a co-admin, cancel an invite, or
                an invite is declined.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Co-admins"
          value={acceptedCount}
          hint="Can act for the company"
          icon={UserCheck}
          tone="text-emerald-600"
        />
        <SummaryCard
          title="Pending invites"
          value={pendingCount}
          hint="Waiting for a response"
          icon={Clock}
          tone="text-amber-600"
        />
        <SummaryCard
          title="Seats left"
          value={`${seats.left} of ${seats.max}`}
          hint="Co-admins and pending invites count"
          icon={Users}
          tone="text-primary"
        />
      </div>

      {/* Team */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Users className="h-5 w-5 text-primary" aria-hidden="true" />
            Team and invitations
          </CardTitle>
          <CardDescription>
            Everyone who has been invited to help manage this company, newest
            first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {(["a", "b", "c"] as const).map((k) => (
                <Skeleton key={k} className="h-12 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-10 text-center">
              <p className="text-sm text-muted-foreground">
                We couldn&apos;t load your co-admins.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Try again
              </Button>
            </div>
          ) : adminLinks.length === 0 ? (
            <div className="rounded-lg border border-dashed py-12 text-center">
              <Shield
                className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50"
                aria-hidden="true"
              />
              <h3 className="text-base font-semibold text-foreground">
                No co-admins yet
              </h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                Invite a colleague by their muLearn ID to share job postings,
                applicant reviews and company tasks.
              </p>
              {can.manageAdmins && (
                <Button
                  onClick={openInvite}
                  className="mt-4 gap-2"
                  variant="outline"
                >
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  Invite co-admin
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invited by</TableHead>
                    <TableHead>Invited</TableHead>
                    <TableHead className="text-right">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminLinks.map((link) => {
                    const name = link.user_name || link.user_muid;
                    const badge = STATUS_BADGE[link.status];
                    const detail = statusDetail(link);
                    const actions = adminLinkActions(link, viewer);
                    return (
                      <TableRow key={link.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                                {name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="truncate font-medium text-foreground">
                                {name}
                              </div>
                              <div className="truncate text-xs text-muted-foreground">
                                {link.user_muid}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("font-medium", badge.className)}
                          >
                            {badge.label}
                          </Badge>
                          {detail && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              {detail}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {link.invited_by_name || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatShortDate(link.invited_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          {actions.canRemove && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() =>
                                setConfirm({ kind: "remove", link })
                              }
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                              Remove
                            </Button>
                          )}
                          {actions.canCancel && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() =>
                                setConfirm({ kind: "cancel", link })
                              }
                            >
                              Cancel invite
                            </Button>
                          )}
                          {actions.canLeave && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1.5"
                              onClick={() =>
                                setConfirm({ kind: "leave", link })
                              }
                            >
                              <LogOut className="h-4 w-4" aria-hidden="true" />
                              Leave
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger zone — owner only on the backend */}
      {can.deactivateCompany && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-destructive">
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
              Danger zone
            </CardTitle>
            <CardDescription>
              Deactivating takes your company page offline, stops new jobs and
              tasks, revokes every co-admin, ends your company mentors&apos;
              access and removes your IG sponsorships.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 rounded-lg border border-destructive/20 bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-foreground">
                  Deactivate company
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Only a muLearn admin can reactivate it.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="shrink-0"
                onClick={() => setIsDeactivateOpen(true)}
              >
                Deactivate company
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite dialog */}
      <Dialog
        open={isInviteOpen}
        onOpenChange={(open) => {
          setIsInviteOpen(open);
          if (!open) setInviteMuid("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a co-admin</DialogTitle>
            <DialogDescription>
              They&apos;ll get a notification and can act for your company once
              they accept. {seats.left} of {seats.max} seats left.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInvite} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="invite-muid">muLearn ID</Label>
              <Input
                id="invite-muid"
                placeholder="name@mulearn"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                value={inviteMuid}
                onChange={(e) => setInviteMuid(e.target.value)}
                aria-describedby="invite-muid-hint"
                required
              />
              <p
                id="invite-muid-hint"
                className="text-xs text-muted-foreground"
              >
                Ask your colleague for the muLearn ID shown on their profile.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsInviteOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={inviteMutation.isPending || !inviteMuid.trim()}
              >
                {inviteMutation.isPending ? "Sending…" : "Send invitation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Remove / leave / cancel confirmation */}
      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
        variant="destructive"
        title={
          confirm?.kind === "leave"
            ? "Leave this company?"
            : confirm?.kind === "cancel"
              ? "Cancel this invitation?"
              : `Remove ${confirmName}?`
        }
        description={
          confirm?.kind === "leave"
            ? "You'll lose co-admin access right away. The owner can invite you again later."
            : confirm?.kind === "cancel"
              ? `${confirmName} won't be able to accept it, and the seat frees up.`
              : `${confirmName} will lose co-admin access right away. You can invite them again later.`
        }
        confirmLabel={
          confirm?.kind === "leave"
            ? "Leave company"
            : confirm?.kind === "cancel"
              ? "Cancel invitation"
              : "Remove"
        }
        isPending={
          removeMutation.isPending ||
          leaveMutation.isPending ||
          cancelInvite.isPending
        }
        onConfirm={handleConfirm}
      />

      {/* Deactivate confirmation */}
      <ConfirmDialog
        open={isDeactivateOpen}
        onOpenChange={setIsDeactivateOpen}
        variant="destructive"
        title="Deactivate your company?"
        description="Your company page goes offline, every co-admin is revoked, company mentors lose access and your IG sponsorships end. Only a muLearn admin can reactivate the company."
        confirmLabel="Deactivate company"
        isPending={deactivateMutation.isPending}
        onConfirm={() =>
          deactivateMutation.mutate(undefined, {
            onSuccess: () => setIsDeactivateOpen(false),
          })
        }
      />
    </div>
  );
}

function SummaryCard({
  title,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  title: string;
  value: number | string;
  hint: string;
  icon: typeof Users;
  tone: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn("h-4 w-4", tone)} aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", tone)}>{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
