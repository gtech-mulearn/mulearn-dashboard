"use client";

import {
  Copy,
  MapPin,
  Pencil,
  Plus,
  Star,
  Trash,
  Users,
  Video,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
  useDeleteSession,
  usePendingSessions,
  useSessions,
} from "../hooks/use-sessions";
import type { Session } from "../schemas";
import { ApproveSessionDialog } from "./approve-session-dialog";
import { IncomingRequestsList } from "./incoming-requests-list";
import { KarmaAwardDialog } from "./karma-award-dialog";
import { getSessionAccess } from "./session-access";
import { SessionCreateDialog } from "./session-create-dialog";
import { SessionEditSheet } from "./session-edit-sheet";
import { SessionParticipantsDialog } from "./session-participants-dialog";

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/50",
  PENDING_APPROVAL:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-950/50",
  COMPLETED:
    "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/50",
  CANCELLED:
    "bg-stone-100 text-stone-700 dark:bg-stone-900/50 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-900/50",
  REJECTED:
    "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-950/50",
};

const TERMINAL = new Set(["COMPLETED", "CANCELLED", "REJECTED"]);

function SessionRow({
  session,
  isAdmin,
  onEdit,
  onParticipants,
  onApprove,
  onKarma,
  onDelete,
}: {
  session: Session;
  isAdmin: boolean;
  onEdit: (s: Session) => void;
  onParticipants: (s: Session) => void;
  onApprove: (s: Session, action: "approve" | "reject") => void;
  onKarma: (s: Session) => void;
  onDelete: (id: string) => void;
}) {
  const status = session.status || "PENDING_APPROVAL";
  const { meetingUrl, mapUrl } = getSessionAccess(
    session.mode,
    session.meeting_link,
    session.venue,
  );

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex flex-col gap-1">
          <span>{session.title}</span>
          {session.is_recurring && (
            <div className="flex items-center gap-1">
              {!session.parent_session_id ? (
                <Badge
                  variant="outline"
                  className="text-[10px] h-4 px-1 py-0 bg-blue-50 text-blue-700 hover:bg-blue-50"
                >
                  <span className="mr-1">🔄</span> Series Parent
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[10px] h-4 px-1 py-0 text-muted-foreground"
                >
                  ↳ Series Child
                </Badge>
              )}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        {(session.ig_name ?? session.entity_name) ? (
          <Badge variant="outline">
            {session.ig_name ?? session.entity_name}
          </Badge>
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
        <Badge
          variant="outline"
          className={
            STATUS_STYLES[status] ||
            "bg-muted text-muted-foreground border-border hover:bg-muted"
          }
        >
          {status.replace(/_/g, " ")}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          {meetingUrl && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary hover:text-primary"
                  aria-label="Join meeting"
                  onClick={() =>
                    window.open(meetingUrl, "_blank", "noopener,noreferrer")
                  }
                >
                  <Video className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Join meeting</TooltipContent>
            </Tooltip>
          )}

          {mapUrl && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary hover:text-primary"
                  aria-label="View location on map"
                  onClick={() =>
                    window.open(mapUrl, "_blank", "noopener,noreferrer")
                  }
                >
                  <MapPin className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View location</TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  if (status !== "SCHEDULED") {
                    e.preventDefault();
                    return;
                  }
                  navigator.clipboard.writeText(session.id);
                  toast.success("Session ID copied to clipboard!");
                }}
                disabled={status !== "SCHEDULED"}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy Session ID</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => onEdit(session)}
                disabled={TERMINAL.has(status)}
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
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
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
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(session.id)}
              >
                <Trash className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>

          {isAdmin && status === "COMPLETED" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
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
                {status === "SCHEDULED" || status === "PENDING_APPROVAL" ? (
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
  onDelete,
}: {
  sessions: Session[] | undefined;
  isLoading: boolean;
  isAdmin: boolean;
  onEdit: (s: Session) => void;
  onParticipants: (s: Session) => void;
  onApprove: (s: Session, action: "approve" | "reject") => void;
  onKarma: (s: Session) => void;
  onDelete: (id: string) => void;
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
          <TableHead className="text-right">Actions</TableHead>
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
            onDelete={onDelete}
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
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);

  const { data: all, isLoading: allLoading } = useSessions({});
  const upcomingSessions = all?.data?.filter(
    (s) => s.status === "SCHEDULED" || s.status === "PENDING_APPROVAL",
  );
  const { data: pendingResult, isLoading: pendingLoading } =
    usePendingSessions(isAdmin);
  const pending = pendingResult?.data;

  const { mutate: deleteSession, isPending: isDeleting } = useDeleteSession();

  const sharedHandlers = {
    onEdit: setEditSession,
    onParticipants: setParticipantsSession,
    onApprove: (s: Session, action: "approve" | "reject") =>
      setApproveState({ session: s, action }),
    onKarma: setKarmaSession,
    onDelete: setDeleteSessionId,
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
            <TabsTrigger value="requests">Student Requests</TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="pending">
                Pending
                {pending && pending.length > 0 && (
                  <Badge
                    variant="outline"
                    className="ml-2 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800"
                  >
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

          <TabsContent value="requests" className="mt-4">
            <IncomingRequestsList />
          </TabsContent>
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
        <ConfirmDialog
          open={!!deleteSessionId}
          onOpenChange={(v) => !v && setDeleteSessionId(null)}
          title="Delete Session"
          description="Are you sure you want to delete this session? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          isPending={isDeleting}
          onConfirm={() => {
            if (deleteSessionId) {
              deleteSession(deleteSessionId, {
                onSuccess: () => setDeleteSessionId(null),
              });
            }
          }}
        />
      </div>
    </TooltipProvider>
  );
}
