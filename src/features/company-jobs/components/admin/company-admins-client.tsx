"use client";

import {
  Clock,
  LogOut,
  RefreshCw,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge, type BadgeProps } from "@/components/ui/badge";
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
import { PageHeader } from "@/components/ui/page-header";
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
import { useUserInfo } from "@/features/auth";
import { formatShortDate } from "@/lib/datetime";
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
  { label: string; variant: BadgeProps["variant"] }
> = {
  Accepted: { label: "Co-admin", variant: "success" },
  Pending: { label: "Invite pending", variant: "warning" },
  Declined: { label: "Declined", variant: "secondary" },
  Revoked: { label: "Revoked", variant: "secondary" },
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
      <PageHeader
        title="Co-Administrators"
        description={
          can.manageAdmins
            ? `Invite up to ${seats.max} colleagues to help run your company on muLearn. Co-admins can do everything except edit the company profile, manage admins or deactivate the company.`
            : "You're a co-admin of this company. You can leave at any time from your row below."
        }
        action={
          can.manageAdmins && (
            <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
              <Button onClick={openInvite} disabled={seatsFull}>
                <UserPlus aria-hidden="true" />
                Invite co-admin
              </Button>
              {seatsFull && (
                <p className="max-w-xs text-xs text-muted-foreground sm:text-right">
                  All {seats.max} seats are taken by co-admins or pending
                  invites. A seat frees up when you remove a co-admin, cancel an
                  invite, or an invite is declined.
                </p>
              )}
            </div>
          )
        }
      />

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Co-admins"
          value={acceptedCount}
          description="Can act for the company"
          icon={<UserCheck className="size-5" />}
          accent="chart-1"
        />
        <StatCard
          title="Pending invites"
          value={pendingCount}
          description="Waiting for a response"
          icon={<Clock className="size-5" />}
          accent="chart-2"
        />
        <StatCard
          title="Seats left"
          value={`${seats.left} of ${seats.max}`}
          description="Co-admins and pending invites count"
          icon={<Users className="size-5" />}
          accent="chart-3"
        />
      </div>

      {/* Team */}
      <Card>
        <CardHeader>
          <CardTitle>Team and invitations</CardTitle>
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
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw aria-hidden="true" />
                Try again
              </Button>
            </div>
          ) : adminLinks.length === 0 ? (
            <StateDisplay
              variant="no-results"
              size="sm"
              className="rounded-2xl border border-dashed"
              title="No co-admins yet"
              description="Invite a colleague by their muLearn ID to share job postings, applicant reviews and company tasks."
              action={
                can.manageAdmins && (
                  <Button variant="outline" onClick={openInvite}>
                    <UserPlus aria-hidden="true" />
                    Invite co-admin
                  </Button>
                )
              }
            />
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
                          <Badge variant={badge.variant}>{badge.label}</Badge>
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
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                setConfirm({ kind: "remove", link })
                              }
                            >
                              <Trash2 aria-hidden="true" />
                              Remove
                            </Button>
                          )}
                          {actions.canCancel && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                setConfirm({ kind: "cancel", link })
                              }
                            >
                              Cancel invite
                            </Button>
                          )}
                          {actions.canLeave && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setConfirm({ kind: "leave", link })
                              }
                            >
                              <LogOut aria-hidden="true" />
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
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Danger zone</CardTitle>
            <CardDescription>
              Deactivating takes your company page offline, stops new jobs and
              tasks, revokes every co-admin, ends your company mentors&apos;
              access and removes your IG sponsorships.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
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
