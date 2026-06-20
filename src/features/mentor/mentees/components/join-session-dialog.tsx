"use client";

import { Loader2, LogIn } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { getApiResponseError } from "@/hooks/use-get-error";
import { useJoinSession } from "../hooks/use-mentees";
import type { JoinSessionParticipant } from "../schemas";

interface JoinSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-fill the session ID (e.g. from a row's session ID). Optional. */
  defaultSessionId?: string;
}

const ROLE_LABELS: Record<JoinSessionParticipant["participant_role"], string> =
  {
    MENTOR: "Mentor",
    MENTEE: "Mentee",
    CO_MENTOR: "Co-Mentor",
  };

const ATTENDANCE_LABELS: Record<string, string> = {
  INVITED: "Invited",
  ATTENDED: "Attended",
  ABSENT: "Absent",
};

const ATTENDANCE_COLORS: Record<string, string> = {
  ATTENDED: "text-green-700 bg-green-50 border-green-200",
  ABSENT: "text-red-700 bg-red-50 border-red-200",
  INVITED: "text-amber-700 bg-amber-50 border-amber-200",
};

export function JoinSessionDialog({
  open,
  onOpenChange,
  defaultSessionId = "",
}: JoinSessionDialogProps) {
  const [sessionId, setSessionId] = useState(defaultSessionId);
  const [joined, setJoined] = useState<JoinSessionParticipant | null>(null);

  const { mutate, isPending } = useJoinSession();

  function handleJoin() {
    const trimmed = sessionId.trim();
    if (!trimmed) {
      toast.error("Please enter a session ID.");
      return;
    }

    mutate(trimmed, {
      onSuccess: (participant) => {
        setJoined(participant);
        toast.success("Successfully joined the session!");
      },
      onError: (err) => {
        toast.error(
          getApiResponseError(err, {
            fallback:
              "Failed to join session. Please check the session ID and try again.",
          }),
        );
      },
    });
  }

  function handleClose() {
    if (!isPending) {
      setSessionId(defaultSessionId);
      setJoined(null);
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
              <LogIn className="size-4 text-primary" />
            </div>
            <div>
              <DialogTitle>Join a Session</DialogTitle>
              <DialogDescription className="mt-0.5 text-xs">
                Enter the session ID to join as a participant.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {joined ? (
          // ── Success state ──────────────────────────────────────────────────
          <div className="space-y-4 py-2">
            <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">
                You have joined the session
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{joined.user_full_name}</span>

                {joined.mu_id && (
                  <>
                    <span className="text-muted-foreground">MU ID</span>
                    <span>{joined.mu_id}</span>
                  </>
                )}

                <span className="text-muted-foreground">Role</span>
                <span>
                  <Badge variant="secondary" className="text-xs">
                    {ROLE_LABELS[joined.participant_role]}
                  </Badge>
                </span>

                {joined.attendance_status && (
                  <>
                    <span className="text-muted-foreground">Status</span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit ${ATTENDANCE_COLORS[joined.attendance_status] ?? ""}`}
                    >
                      {ATTENDANCE_LABELS[joined.attendance_status] ??
                        joined.attendance_status}
                    </span>
                  </>
                )}

                <span className="text-muted-foreground">Session ID</span>
                <span className="truncate font-mono text-xs text-muted-foreground">
                  {joined.session_id}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          // ── Input state ──────────────────────────────────────────────────
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="join-session-id" className="text-sm font-medium">
                Session ID
              </Label>
              <Input
                id="join-session-id"
                placeholder="e.g. 3f7a2e10-…"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                disabled={isPending}
                autoFocus
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                The unique identifier for the scheduled session you want to
                join.
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleJoin}
                disabled={isPending || !sessionId.trim()}
                className="min-w-[120px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Joining…
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 size-4" />
                    Join Session
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
