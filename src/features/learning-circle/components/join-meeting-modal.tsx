/**
 * Join Meeting Modal
 *
 * 📍 src/features/learning-circle/components/join-meeting-modal.tsx
 *
 * Modal for entering meeting code to join.
 */

"use client";

import { Info, LogIn } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useJoinMeeting } from "../hooks";

interface JoinMeetingModalProps {
  meetingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  defaultCode?: string;
}

export function JoinMeetingModal({
  meetingId,
  open,
  onOpenChange,
  onSuccess,
  defaultCode = "",
}: JoinMeetingModalProps) {
  const [code, setCode] = useState(defaultCode);
  const { mutate: joinMeeting, isPending } = useJoinMeeting();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (code.length !== 6) return;

      joinMeeting(
        { meetingId, data: { meet_code: code.toUpperCase() } },
        {
          onSuccess: () => {
            setCode("");
            onOpenChange(false);
            onSuccess?.();
          },
        },
      );
    },
    [code, meetingId, joinMeeting, onOpenChange, onSuccess],
  );

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (value.length <= 6) {
      setCode(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10 shadow-sm">
              <LogIn className="h-5 w-5 text-success" />
            </div>
            <div>
              <span className="block font-bold">Join Meeting</span>
              <span className="block text-xs font-normal text-muted-foreground">
                Enter the 6-character code
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Meeting Code Input */}
          <div className="space-y-2">
            <Label
              htmlFor="code"
              className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >
              Meeting Code
            </Label>
            <Input
              id="code"
              value={code}
              onChange={handleCodeChange}
              placeholder="ABC123"
              className="h-14 rounded-xl border-border bg-muted/50 text-center text-2xl font-bold tracking-[0.3em] uppercase shadow-none transition-colors focus:border-success/30 focus:bg-card"
              maxLength={6}
              autoFocus
            />
            <div className="flex justify-center">
              <span
                className={`text-[11px] font-semibold ${code.length === 6 ? "text-success" : "text-muted-foreground"}`}
              >
                {code.length}/6 characters
              </span>
            </div>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-3.5">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-[12px] leading-relaxed text-primary">
              Get the meeting code from the organizer or scan the QR code they
              share.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-border pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="trusty"
              disabled={isPending || code.length !== 6}
            >
              {isPending && <Spinner className="h-4 w-4" />}
              Join Meeting
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
