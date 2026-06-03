"use client";

import { Bell, Pencil, Plus, Star, Users } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { usePermissions } from "@/hooks/use-permissions";
import { MANAGEMENT_ROLES } from "@/lib/auth/roles";
import {
  usePendingSessions,
  useRemindSession,
  useSessions,
} from "../hooks/use-sessions";
import type { Session } from "../schemas";
import { ApproveSessionDialog } from "./approve-session-dialog";
import { KarmaAwardDialog } from "./karma-award-dialog";
import { SessionCreateDialog } from "./session-create-dialog";
import { SessionEditSheet } from "./session-edit-sheet";
import { SessionParticipantsDialog } from "./session-participants-dialog";

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  SCHEDULED: "default",
  PENDING_APPROVAL: "secondary",
  COMPLETED: "outline",
  CANCELLED: "destructive",
  REJECTED: "destructive",
};

const TERMINAL = new Set(["COMPLETED", "CANCELLED", "REJECTED"]);

function SessionRow({
  session,
  isAdmin,
  onEdit,
  onParticipants,
  onApprove,
  onKarma,
}: {
  session: Session;
  isAdmin: boolean;
  onEdit: (s: Session) => void;
  onParticipants: (s: Session) => void;
  onApprove: (s: Session, action: "approve" | "reject") => void;
  onKarma: (s: Session) => void;
}) {
  const { mutate: remind, isPending: isReminding } = useRemindSession();

  return (
    <TableRow>
      <TableCell className="font-medium">{session.title}</TableCell>
      <TableCell>
        {session.ig_name ? (
          session.ig_name
        ) : (
          <Badge variant="outline">Global</Badge>
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {session.starts_at
          ? new Date(session.starts_at).toLocaleString()
          : "Not scheduled"}
      </TableCell>
      <TableCell>
        <Badge variant={STATUS_VARIANT[session.status] ?? "secondary"}>
          {session.status.replace(/_/g, " ")}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(session)}
                disabled={TERMINAL.has(session.status)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onParticipants(session)}
              >
                <Users className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Participants</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={TERMINAL.has(session.status) || isReminding}
                onClick={() => remind(session.id)}
              >
                <Bell className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {TERMINAL.has(session.status)
                ? "Cannot remind for this status"
                : "Send reminder"}
            </TooltipContent>
          </Tooltip>

          {isAdmin && session.status === "COMPLETED" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onKarma(session)}
                >
                  <Star className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Award Karma</TooltipContent>
            </Tooltip>
          )}

          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-1">
                  Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {session.status === "SCHEDULED" ||
                session.status === "PENDING_APPROVAL" ? (
                  <>
                    <DropdownMenuItem
                      onClick={() => onApprove(session, "approve")}
                    >
                      Approve / Complete
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onApprove(session, "reject")}
                      className="text-destructive"
                    >
                      Reject / Cancel
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem disabled>
                    No transitions available
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

function SessionTable({
  sessions,
  isLoading,
  isAdmin,
  onEdit,
  onParticipants,
  onApprove,
  onKarma,
}: {
  sessions: Session[] | undefined;
  isLoading: boolean;
  isAdmin: boolean;
  onEdit: (s: Session) => void;
  onParticipants: (s: Session) => void;
  onApprove: (s: Session, action: "approve" | "reject") => void;
  onKarma: (s: Session) => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-2 text-muted-foreground">
        <Users className="w-8 h-8" />
        <p className="text-sm">No sessions found.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>IG</TableHead>
          <TableHead>Starts At</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((s) => (
          <SessionRow
            key={s.id}
            session={s}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onParticipants={onParticipants}
            onApprove={onApprove}
            onKarma={onKarma}
          />
        ))}
      </TableBody>
    </Table>
  );
}

export function SessionsPage() {
  const { hasRole } = usePermissions();
  const isAdmin = hasRole(MANAGEMENT_ROLES);

  const [createOpen, setCreateOpen] = useState(false);
  const [editSession, setEditSession] = useState<Session | null>(null);
  const [participantsSession, setParticipantsSession] =
    useState<Session | null>(null);
  const [approveState, setApproveState] = useState<{
    session: Session;
    action: "approve" | "reject";
  } | null>(null);
  const [karmaSession, setKarmaSession] = useState<Session | null>(null);

  const { data: all, isLoading: allLoading } = useSessions({});
  const upcomingSessions = all?.data?.filter(
    (s) => s.status === "SCHEDULED" || s.status === "PENDING_APPROVAL",
  );
  const { data: pendingResult, isLoading: pendingLoading } =
    usePendingSessions(isAdmin);
  const pending = pendingResult?.data;

  const sharedHandlers = {
    onEdit: setEditSession,
    onParticipants: setParticipantsSession,
    onApprove: (s: Session, action: "approve" | "reject") =>
      setApproveState({ session: s, action }),
    onKarma: setKarmaSession,
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Sessions</h1>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Session
          </Button>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="all">All Sessions</TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="pending">
                Pending
                {pending && pending.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {pending.length}
                  </Badge>
                )}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="upcoming" className="mt-4">
            <SessionTable
              sessions={upcomingSessions}
              isLoading={allLoading}
              isAdmin={isAdmin}
              {...sharedHandlers}
            />
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            <SessionTable
              sessions={all?.data}
              isLoading={allLoading}
              isAdmin={isAdmin}
              {...sharedHandlers}
            />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="pending" className="mt-4">
              <SessionTable
                sessions={pending}
                isLoading={pendingLoading}
                isAdmin={isAdmin}
                {...sharedHandlers}
              />
            </TabsContent>
          )}
        </Tabs>

        <SessionCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
        <SessionEditSheet
          session={editSession}
          open={!!editSession}
          onOpenChange={(v) => !v && setEditSession(null)}
        />
        <SessionParticipantsDialog
          session={participantsSession}
          open={!!participantsSession}
          onOpenChange={(v) => !v && setParticipantsSession(null)}
        />
        <ApproveSessionDialog
          session={approveState?.session ?? null}
          action={approveState?.action ?? "approve"}
          open={!!approveState}
          onOpenChange={(v) => !v && setApproveState(null)}
        />
        <KarmaAwardDialog
          session={karmaSession}
          open={!!karmaSession}
          onOpenChange={(v) => !v && setKarmaSession(null)}
        />
      </div>
    </TooltipProvider>
  );
}
