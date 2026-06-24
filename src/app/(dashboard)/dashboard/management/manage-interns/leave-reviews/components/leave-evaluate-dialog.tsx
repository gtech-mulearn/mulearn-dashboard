"use client";

import { AlertTriangle, CheckCircle2, Shield, XCircle } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type TLeaveRequest, useReviewLeave } from "@/features/intern";

const calculateDurationDays = (startStr: string, endStr: string) => {
  if (!startStr || !endStr) return 0;
  const start = new Date(startStr);
  const end = new Date(endStr);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diffTime = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24))) + 1;
};

interface LeaveEvaluateDialogProps {
  selectedLeave: TLeaveRequest | null;
  reviewNote: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewNoteChange: (note: string) => void;
  onClose: () => void;
}

export function LeaveEvaluateDialog({
  selectedLeave,
  reviewNote,
  isOpen,
  onOpenChange,
  onReviewNoteChange,
  onClose,
}: LeaveEvaluateDialogProps) {
  const reviewMutation = useReviewLeave(selectedLeave?.id || "");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-card/95 backdrop-blur-xl border-border/60 w-full max-w-[calc(100%-2rem)] sm:max-w-lg p-4 sm:p-6"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-wider text-foreground">
            Evaluate Leave Request
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Review details and approve/reject leave requests.
          </DialogDescription>
        </DialogHeader>

        {selectedLeave &&
          (() => {
            const muid = String(
              selectedLeave.user_muid ||
                (selectedLeave as unknown as { muid?: string }).muid ||
                "",
            );
            const days =
              selectedLeave.duration_days ||
              calculateDurationDays(
                selectedLeave.start_date,
                selectedLeave.end_date,
              );
            return (
              <div className="space-y-4 py-2 my-2 text-sm max-h-[60vh] overflow-y-auto pr-1 w-full min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      Intern
                    </span>
                    <span className="font-bold text-foreground text-sm">
                      {selectedLeave.user_name || "Unknown"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      MUID
                    </span>
                    <span className="font-bold text-foreground text-sm">
                      {String(muid || "-")}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      Submission Date
                    </span>
                    <span className="font-bold text-foreground text-sm">
                      {new Date(selectedLeave.created_at).toLocaleDateString(
                        undefined,
                        {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 items-start">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      Leave Type
                    </span>
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground font-bold text-xs uppercase tracking-wider mt-1">
                      {selectedLeave.leave_type}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      Start Date
                    </span>
                    <span className="font-bold text-foreground text-sm">
                      {new Date(selectedLeave.start_date).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric", year: "numeric" },
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      End Date
                    </span>
                    <span className="font-bold text-foreground text-sm">
                      {new Date(selectedLeave.end_date).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric", year: "numeric" },
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      Duration Days
                    </span>
                    <span className="font-bold text-foreground text-sm">
                      {days ? `${days} Day${days > 1 ? "s" : ""}` : "-"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      Status
                    </span>
                    <div className="mt-1">
                      {selectedLeave.status === "APPROVED" && (
                        <Badge
                          variant="outline"
                          className="gap-1.5 text-success border-success/30 font-bold uppercase text-xs"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Approved
                        </Badge>
                      )}
                      {selectedLeave.status === "REJECTED" && (
                        <Badge
                          variant="outline"
                          className="gap-1.5 text-destructive border-destructive/30 font-bold uppercase text-xs"
                        >
                          <XCircle className="w-3 h-3" /> Rejected
                        </Badge>
                      )}
                      {selectedLeave.status === "CANCELLED" && (
                        <Badge
                          variant="outline"
                          className="gap-1.5 text-muted-foreground border-border font-bold uppercase text-xs"
                        >
                          <Shield className="w-3 h-3" /> Cancelled
                        </Badge>
                      )}
                      {selectedLeave.status === "PENDING" && (
                        <Badge
                          variant="outline"
                          className="gap-1.5 text-warning border-warning/30 font-bold uppercase text-xs"
                        >
                          <AlertTriangle className="w-3 h-3" /> Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                    Reason for Respite
                  </span>
                  <p className="bg-muted/40 p-2.5 rounded-lg text-xs font-semibold text-foreground/80 mt-1 border border-border/20 max-h-40 overflow-y-auto leading-relaxed break-words">
                    {selectedLeave.reason || "No reason provided."}
                  </p>
                </div>

                {selectedLeave.status === "PENDING" ? (
                  <div className="space-y-2 pt-2 border-t border-border/20 flex flex-col gap-1">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      Review Notes / Feedback
                    </Label>
                    <Textarea
                      value={reviewNote}
                      onChange={(e) => onReviewNoteChange(e.target.value)}
                      placeholder="Feedback visible to the intern..."
                      className="min-h-[80px] text-xs font-semibold resize-none"
                    />
                  </div>
                ) : (
                  selectedLeave.review_note && (
                    <div className="pt-2 border-t border-border/20 flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                        Council Review Note
                      </span>
                      <p className="p-2.5 bg-muted/20 border rounded-lg text-xs mt-1 text-muted-foreground leading-relaxed break-words">
                        {selectedLeave.review_note}
                      </p>
                    </div>
                  )
                )}
              </div>
            );
          })()}

        <DialogFooter className="gap-2 sm:justify-between border-t border-border/20 pt-4">
          {selectedLeave?.status === "PENDING" ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="gap-2 text-[10px] tracking-widest h-10 shadow-lg"
              >
                Close
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    reviewMutation.mutate(
                      { action: "reject", review_note: reviewNote },
                      { onSuccess: onClose },
                    );
                  }}
                  disabled={reviewMutation.isPending}
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-white hover:border-destructive hover:bg-none gap-2 text-[10px] tracking-widest h-10 shadow-lg font-bold"
                >
                  Reject
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    reviewMutation.mutate(
                      { action: "approve", review_note: reviewNote },
                      { onSuccess: onClose },
                    );
                  }}
                  disabled={reviewMutation.isPending}
                  variant="outline"
                  className="border-success text-success hover:bg-success hover:text-white hover:border-success hover:bg-none gap-2 text-[10px] tracking-widest h-10 shadow-lg font-bold"
                >
                  Approve
                </Button>
              </div>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full gap-2 text-[10px] tracking-widest h-10 shadow-lg font-bold"
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
