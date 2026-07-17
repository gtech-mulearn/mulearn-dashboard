/**
 * Delete Meeting Button
 *
 * 📍 src/features/learning-circle/components/delete-meeting-button.tsx
 *
 * Confirmation dialog for deleting a learning circle meeting.
 * Visible only to the meeting creator, circle lead, or circle owner.
 */

"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useDeleteMeeting } from "../hooks";

interface DeleteMeetingButtonProps {
  meetingId: string;
  meetingTitle: string;
  circleId: string;
  /** When true, shows an extra callout warning that only this occurrence will be deleted. */
  isRecurring?: boolean;
}

export function DeleteMeetingButton({
  meetingId,
  meetingTitle,
  circleId,
  isRecurring = false,
}: DeleteMeetingButtonProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { mutate: deleteMeeting, isPending } = useDeleteMeeting();

  const handleDelete = () => {
    deleteMeeting(meetingId, {
      onSuccess: () => {
        setOpen(false);
        router.push(`/dashboard/learning-circle/${circleId}`);
      },
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        title="Delete Meeting"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden rounded-[20px] border border-border p-0 shadow-[0_20px_60px_rgba(0,0,0,0.12)] sm:max-w-[420px]">
          <div
            style={{
              fontFamily:
                "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
            }}
          >
            <DialogHeader className="px-6 pt-6 pb-4">
              <DialogTitle className="flex items-center gap-3 text-lg">
                <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-destructive/10 border border-destructive/20">
                  <Trash2 className="h-5 w-5 text-destructive" />
                </div>
                <span className="text-[18px] font-bold tracking-[-0.01em] text-destructive">
                  Delete Meeting
                </span>
              </DialogTitle>
              <DialogDescription className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                Are you sure you want to delete{" "}
                <span className="font-bold text-foreground">
                  {meetingTitle}
                </span>
                ? This action cannot be undone. All attendee records and RSVP
                data associated with this meeting will be permanently removed.
              </DialogDescription>
            </DialogHeader>

            {/* Recurring meeting warning */}
            {isRecurring && (
              <div className="mx-6 mb-4 flex items-start gap-3 rounded-xl border border-warning/25 bg-warning/10 px-4 py-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <p className="text-[13px] leading-relaxed text-foreground">
                  <span className="font-semibold">Recurring meeting</span> —
                  only this occurrence will be deleted. The rest of the series
                  will remain unaffected.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 border-t border-border bg-muted/50 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending && <Spinner className="mr-2 h-4 w-4" />}
                Delete Meeting
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
