"use client";

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  LogOut,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  useCompanyAdminLinks,
  useDeactivateCompanySelf,
  useInviteCompanyAdmin,
  useLeaveCompanyAdmin,
  useRemoveCompanyAdmin,
  useRespondCompanyAdminInvitation,
  useUserCompanyStatus,
} from "@/features/company-jobs/hooks";

export function CompanyAdminsPageClient() {
  const { data: adminLinks = [], isLoading: isLoadingLinks } =
    useCompanyAdminLinks();
  const { data: userStatus } = useUserCompanyStatus();

  const inviteMutation = useInviteCompanyAdmin();
  const respondMutation = useRespondCompanyAdminInvitation();
  const removeMutation = useRemoveCompanyAdmin();
  const leaveMutation = useLeaveCompanyAdmin();
  const deactivateMutation = useDeactivateCompanySelf();

  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false);

  const activeAdmins = adminLinks.filter((l) => l.status === "ACCEPTED");
  const pendingLinks = adminLinks.filter((l) => l.status === "INVITED");
  const userPendingInvites = userStatus?.pending_invitations ?? [];

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error("Please provide an email address.");
      return;
    }
    try {
      await inviteMutation.mutateAsync(inviteEmail.trim());
      toast.success(`Invitation sent to ${inviteEmail.trim()}`);
      setInviteEmail("");
      setIsInviteDialogOpen(false);
    } catch {
      toast.error("Failed to send invitation. Please check the email address.");
    }
  };

  const handleRespond = async (id: string, action: "ACCEPT" | "REJECT") => {
    try {
      await respondMutation.mutateAsync({
        linkId: id,
        accept: action === "ACCEPT",
      });
      toast.success(
        action === "ACCEPT"
          ? "Invitation accepted successfully!"
          : "Invitation rejected.",
      );
    } catch {
      toast.error("Failed to respond to invitation.");
    }
  };

  const handleRemove = async (id: string, nameOrEmail: string) => {
    if (!confirm(`Are you sure you want to remove ${nameOrEmail}?`)) return;
    try {
      await removeMutation.mutateAsync(id);
      toast.success("Administrator removed.");
    } catch {
      toast.error("Failed to remove administrator.");
    }
  };

  const handleLeave = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to leave your co-admin role for this company?",
      )
    )
      return;
    try {
      await leaveMutation.mutateAsync(id);
      toast.success("You have left the company administration.");
    } catch {
      toast.error("Failed to leave company administration.");
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivateMutation.mutateAsync();
      toast.success("Company has been deactivated.");
      setDeactivateConfirmOpen(false);
    } catch {
      toast.error("Failed to deactivate company.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Company Administration
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage authorized co-administrators, team permissions, and
            invitation status.
          </p>
        </div>

        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0">
              <UserPlus className="h-4 w-4" />
              Invite Co-Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Co-Administrator</DialogTitle>
              <DialogDescription>
                Send an invitation to a team member to manage job postings, view
                applications, and create community tasks on behalf of your
                company.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="invite-email">User Email Address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsInviteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={inviteMutation.isPending}>
                  {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending Invitations Banner for Current User */}
      {userPendingInvites.length > 0 && (
        <Alert className="border-amber-500/30 bg-amber-500/10">
          <Clock className="h-5 w-5 text-amber-600" />
          <AlertTitle className="font-semibold text-amber-900 dark:text-amber-300">
            Pending Company Admin Invitations ({userPendingInvites.length})
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            {userPendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-background/80 rounded-lg border"
              >
                <div>
                  <p className="font-medium text-foreground">
                    Invitation to join{" "}
                    <span className="font-bold">{invite.company_name}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Invited by {invite.invited_by} on{" "}
                    {new Date(invite.invited_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={respondMutation.isPending}
                    onClick={() => handleRespond(invite.id, "ACCEPT")}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-rose-600 hover:text-rose-700"
                    disabled={respondMutation.isPending}
                    onClick={() => handleRespond(invite.id, "REJECT")}
                  >
                    <XCircle className="h-4 w-4" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Team Members
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminLinks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active and invited administrators
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Co-Admins
            </CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {activeAdmins.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Authorized to manage jobs & tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Invitations
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {pendingLinks.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting user acceptance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Admin Scope
            </CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold">Full Organization</div>
            <p className="text-xs text-muted-foreground mt-1">
              Jobs, Gigs, Tasks, & Mentors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team Administrators Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Company Administrators & Invitations
          </CardTitle>
          <CardDescription>
            List of users with administrative access or active invitations for
            this company.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingLinks ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : adminLinks.length === 0 ? (
            <div className="text-center py-12 border rounded-lg border-dashed">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="font-semibold text-foreground text-base">
                No Additional Administrators
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Invite colleagues to collaborate on managing job openings,
                candidate screening, and company task assignments.
              </p>
              <Button
                onClick={() => setIsInviteDialogOpen(true)}
                className="mt-4 gap-2"
                variant="outline"
              >
                <UserPlus className="h-4 w-4" />
                Invite Co-Admin
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User / Member</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invited By</TableHead>
                    <TableHead>Invited Date</TableHead>
                    <TableHead>Accepted Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminLinks.map((link) => {
                    const displayName =
                      link.user_name || link.user_email || "Invited User";
                    const initial = displayName.charAt(0).toUpperCase();

                    return (
                      <TableRow key={link.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {initial}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-foreground">
                                {link.user_name || "Pending User"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {link.user_email || `User ID: ${link.user_id}`}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {link.status === "ACCEPTED" ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium">
                              Active Admin
                            </Badge>
                          ) : link.status === "INVITED" ? (
                            <Badge
                              variant="secondary"
                              className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-medium"
                            >
                              Pending Invite
                            </Badge>
                          ) : (
                            <Badge
                              variant="destructive"
                              className="font-medium"
                            >
                              {link.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {link.invited_by || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {link.invited_at
                            ? new Date(link.invited_at).toLocaleDateString()
                            : "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {link.accepted_at
                            ? new Date(link.accepted_at).toLocaleDateString()
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {link.status === "ACCEPTED" ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                                  onClick={() =>
                                    handleRemove(
                                      link.id,
                                      link.user_name ||
                                        link.user_email ||
                                        "Admin",
                                    )
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-muted-foreground hover:text-foreground"
                                  title="Leave Admin Role"
                                  onClick={() => handleLeave(link.id)}
                                >
                                  <LogOut className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs"
                                onClick={() =>
                                  handleRemove(
                                    link.id,
                                    link.user_email || "Invitation",
                                  )
                                }
                              >
                                Cancel Invite
                              </Button>
                            )}
                          </div>
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

      {/* Danger Zone: Company Self Deactivation */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-destructive flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Deactivating your company will pause all active job postings, task
            assignments, and disable co-admin access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-destructive/20 rounded-lg bg-background">
            <div>
              <p className="font-medium text-foreground">
                Deactivate Company Account
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                This action will mark the organization as inactive. Contact
                support or platform administration to reactivate.
              </p>
            </div>
            <Dialog
              open={deactivateConfirmOpen}
              onOpenChange={setDeactivateConfirmOpen}
            >
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="shrink-0">
                  Deactivate Company
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Confirm Company Deactivation
                  </DialogTitle>
                  <DialogDescription>
                    Are you sure you want to deactivate this company profile?
                    All active jobs will be hidden from learners, and
                    administrative privileges will be frozen.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    variant="outline"
                    onClick={() => setDeactivateConfirmOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={deactivateMutation.isPending}
                    onClick={handleDeactivate}
                  >
                    {deactivateMutation.isPending
                      ? "Deactivating..."
                      : "Yes, Deactivate Company"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
