"use client";

import { Clock, Edit2, Users } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSessionParticipants } from "../hooks/use-mentees";
import type { SessionParticipantListItem } from "../schemas";
import { UpdateParticipantDialog } from "./update-participant-dialog";

interface ParticipantHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The session whose participants we want to view */
  sessionId: string | null;
}

const ROLE_LABELS: Record<
  SessionParticipantListItem["participant_role"],
  string
> = {
  MENTOR: "Mentor",
  MENTEE: "Mentee",
  CO_MENTOR: "Co-Mentor",
};

const ROLE_VARIANTS: Record<
  SessionParticipantListItem["participant_role"],
  "default" | "secondary" | "outline"
> = {
  MENTOR: "default",
  CO_MENTOR: "secondary",
  MENTEE: "outline",
};

const ATTENDANCE_LABELS: Record<string, string> = {
  INVITED: "Invited",
  ATTENDED: "Attended",
  ABSENT: "Absent",
};

const ATTENDANCE_COLORS: Record<string, string> = {
  ATTENDED: "text-green-600 bg-green-50 border-green-200",
  ABSENT: "text-red-600 bg-red-50 border-red-200",
  INVITED: "text-yellow-600 bg-yellow-50 border-yellow-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function ParticipantHistorySheet({
  open,
  onOpenChange,
  sessionId,
}: ParticipantHistorySheetProps) {
  const { data, isLoading } = useSessionParticipants(open ? sessionId : null);

  const [editParticipant, setEditParticipant] =
    useState<SessionParticipantListItem | null>(null);

  const isEmpty = !data || data.length === 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-3xl"
      >
        <SheetHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
              <Users className="size-4 text-primary" />
            </div>
            <div>
              <SheetTitle>Session Participants</SheetTitle>
              <SheetDescription className="text-xs">
                {sessionId
                  ? "All participants in this session"
                  : "Select a session to view participants"}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6">
          {!sessionId ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-muted-foreground">
              <Users className="size-8 opacity-30" />
              <p className="text-sm">No session selected.</p>
            </div>
          ) : isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : isEmpty ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-muted-foreground">
              <Users className="size-8 opacity-30" />
              <p className="text-sm">No participants found for this session.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Contributed</TableHead>
                  <TableHead>Progress Note</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, idx) => (
                  <TableRow key={item.id ?? `${item.session_id}-${idx}`}>
                    <TableCell>
                      <p className="font-medium text-sm">
                        {item.user_full_name}
                      </p>
                      {item.mu_id && (
                        <p className="text-xs text-muted-foreground">
                          {item.mu_id}
                        </p>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge variant={ROLE_VARIANTS[item.participant_role]}>
                        {ROLE_LABELS[item.participant_role]}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {item.attendance_status ? (
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${ATTENDANCE_COLORS[item.attendance_status] ?? ""}`}
                        >
                          {ATTENDANCE_LABELS[item.attendance_status] ??
                            item.attendance_status}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-sm">
                      {item.contributed_minutes != null ? (
                        <span className="flex items-center gap-1">
                          <Clock className="size-3 text-muted-foreground" />
                          {item.contributed_minutes} min
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell className="max-w-[160px]">
                      {item.progress_note ? (
                        <p
                          className="truncate text-xs text-muted-foreground"
                          title={item.progress_note}
                        >
                          {item.progress_note}
                        </p>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell className="max-w-[160px]">
                      {item.feedback ? (
                        <p
                          className="truncate text-xs text-muted-foreground"
                          title={item.feedback}
                        >
                          {item.feedback}
                        </p>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:bg-primary/10"
                        onClick={() => setEditParticipant(item)}
                        disabled={!item.id}
                        title={
                          !item.id
                            ? "Cannot edit user without a link_id"
                            : "Update progress"
                        }
                      >
                        <Edit2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </SheetContent>

      {editParticipant && sessionId && editParticipant.id && (
        <UpdateParticipantDialog
          open={!!editParticipant}
          onOpenChange={(v) => !v && setEditParticipant(null)}
          sessionId={sessionId}
          linkId={editParticipant.id}
          participantName={editParticipant.user_full_name}
          defaultValues={{
            attendance_status: editParticipant.attendance_status ?? undefined,
            contributed_minutes: editParticipant.contributed_minutes,
            progress_note: editParticipant.progress_note,
          }}
        />
      )}
    </Sheet>
  );
}
