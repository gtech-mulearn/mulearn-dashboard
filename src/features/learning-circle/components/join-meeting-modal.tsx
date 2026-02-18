/**
 * Join Meeting Modal
 *
 * 📍 src/features/learning-circle/components/join-meeting-modal.tsx
 *
 * Modal for entering meeting code to join.
 */

"use client";

import { LogIn } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
}

export function JoinMeetingModal({
  meetingId,
  open,
  onOpenChange,
  onSuccess,
}: JoinMeetingModalProps) {
  const [code, setCode] = useState("");
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
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
              <LogIn className="h-5 w-5 text-emerald-600" />
            </div>
            Join Meeting
          </DialogTitle>
          <DialogDescription>
            Enter the 6-character meeting code shared by the organizer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {/* Meeting Code Input */}
          <div className="space-y-2">
            <Label htmlFor="code">Meeting Code</Label>
            <Input
              id="code"
              value={code}
              onChange={handleCodeChange}
              placeholder="ABC123"
              className="text-center text-2xl tracking-widest uppercase"
              maxLength={6}
              autoFocus
            />
            <p className="text-xs text-gray-500 text-center">
              {code.length}/6 characters
            </p>
          </div>

          {/* Info Box */}
          <div className="rounded-lg bg-primary/10 p-3">
            <p className="text-sm text-blue-700">
              💡 Get the meeting code from the organizer or scan the QR code
              they share.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || code.length !== 6}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isPending && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
              Join Meeting
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
