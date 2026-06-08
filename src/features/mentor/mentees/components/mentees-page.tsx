"use client";

import { LogIn, MessageSquarePlus, Search, Users } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { useMentees } from "../hooks/use-mentees";

import { JoinSessionDialog } from "./join-session-dialog";
import { ParticipantHistorySheet } from "./participant-history-sheet";
import { SessionFeedbackDialog } from "./session-feedback-dialog";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const STATUS_VARIANTS: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  ATTENDED: { label: "Attended", variant: "default" },
  ABSENT: { label: "Absent", variant: "destructive" },
  INVITED: { label: "Invited", variant: "secondary" },
};

export function MenteesPage() {
  const [search, setSearch] = useState("");

  // Participant-sheet state: tracks which session's participants to show
  const [participantSheet, setParticipantSheet] = useState<{
    open: boolean;
    sessionId: string | null;
  }>({ open: false, sessionId: null });

  const [feedbackDialog, setFeedbackDialog] = useState<{
    open: boolean;
    sessionId: string;
    sessionTitle: string;
  }>({ open: false, sessionId: "", sessionTitle: "" });

  const [joinDialog, setJoinDialog] = useState<{
    open: boolean;
    sessionId: string;
  }>({ open: false, sessionId: "" });

  const { data, isLoading } = useMentees();

  // Client-side search filter on name or mu_id
  const mentees = (data?.data ?? []).filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.user_full_name.toLowerCase().includes(q) ||
      (m.mu_id ?? "").toLowerCase().includes(q)
    );
  });

  function openParticipants(sessionId: string) {
    setParticipantSheet({ open: true, sessionId });
  }

  function openFeedback(sessionId: string, sessionTitle: string) {
    setFeedbackDialog({ open: true, sessionId, sessionTitle });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mentees</h1>
          {data && (
            <p className="text-sm text-muted-foreground">
              {data.totalItems} mentee{data.totalItems !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search mentees..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setJoinDialog({ open: true, sessionId: "" })}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Join Session
          </Button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : mentees.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 text-muted-foreground">
          <p className="text-sm">
            {search ? "No mentees match your search." : "No mentees yet."}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mentee</TableHead>
              <TableHead>Last Status</TableHead>
              <TableHead className="text-right">Sessions</TableHead>
              <TableHead className="text-right">Participants</TableHead>
              <TableHead className="text-right">Feedback</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mentees.map((mentee) => {
              const status = mentee.last_attendance_status
                ? STATUS_VARIANTS[mentee.last_attendance_status]
                : null;
              return (
                <TableRow key={mentee.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(mentee.user_full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{mentee.user_full_name}</p>
                        {mentee.mu_id && (
                          <p className="text-xs text-muted-foreground">
                            {mentee.mu_id}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {status ? (
                      <Badge variant={status.variant}>{status.label}</Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {mentee.session_count}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => openParticipants(mentee.last_session_id)}
                    >
                      <Users className="size-3.5" />
                      View
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() =>
                        openFeedback(
                          mentee.last_session_id,
                          `Session with ${mentee.user_full_name}`,
                        )
                      }
                    >
                      <MessageSquarePlus className="size-3.5" />
                      Feedback
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Participant sheet — scoped to mentee's last session */}
      <ParticipantHistorySheet
        open={participantSheet.open}
        onOpenChange={(open) =>
          setParticipantSheet((prev) => ({ ...prev, open }))
        }
        sessionId={participantSheet.sessionId}
      />

      <SessionFeedbackDialog
        open={feedbackDialog.open}
        onOpenChange={(open) =>
          setFeedbackDialog((prev) => ({ ...prev, open }))
        }
        sessionId={feedbackDialog.sessionId}
        sessionTitle={feedbackDialog.sessionTitle}
      />

      <JoinSessionDialog
        open={joinDialog.open}
        onOpenChange={(open) => setJoinDialog((prev) => ({ ...prev, open }))}
        defaultSessionId={joinDialog.sessionId}
      />
    </div>
  );
}
