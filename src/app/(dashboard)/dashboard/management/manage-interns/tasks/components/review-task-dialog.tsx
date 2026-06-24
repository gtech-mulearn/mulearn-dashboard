"use client";

import {
  CheckCircle2,
  ExternalLink,
  MessageSquareDot,
  Trash2,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { TInternTask } from "@/features/intern";

export const STATUS_OPTIONS = [
  "WAITING_FOR_REVIEW",
  "IN_PROGRESS",
  "COMPLETED",
  "ON_HOLD",
] as const;

export type ReviewForm = {
  status: string;
  karma: string;
  remark: string;
};

interface ReviewTaskDialogProps {
  reviewTarget: TInternTask | null;
  reviewForm: ReviewForm;
  isFetchingDetail: boolean;
  isReviewPending: boolean;
  isVerifyPending: boolean;
  deleteTarget: string | null;
  isDeletePending: boolean;
  onClose: () => void;
  onReviewFormChange: (form: ReviewForm) => void;
  onVerifySubmit: () => void;
  onVerifyAndAward: () => void;
  onDeleteClose: () => void;
  onDelete: () => void;
}

export function ReviewTaskDialog({
  reviewTarget,
  reviewForm,
  isFetchingDetail,
  isReviewPending,
  isVerifyPending,
  deleteTarget,
  isDeletePending,
  onClose,
  onReviewFormChange,
  onVerifySubmit,
  onVerifyAndAward,
  onDeleteClose,
  onDelete,
}: ReviewTaskDialogProps) {
  return (
    <>
      {/* Review & Status Update Dialog */}
      <Dialog open={!!reviewTarget} onOpenChange={(o) => !o && onClose()}>
        <DialogContent
          className="max-w-md border-border/40 bg-card backdrop-blur-xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-widest text-brand-blue flex items-center gap-2">
              <MessageSquareDot className="w-5 h-5" /> Review & Update Status
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-muted-foreground mt-2">
              Update the task status and provide review feedback to the intern.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3 my-2 pr-1 max-h-[60vh] overflow-y-auto w-full min-w-0">
            {/* Read-only metadata */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-border/40 bg-background/40">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">
                  Task
                </span>
                <span
                  className="font-bold text-foreground text-xs truncate block"
                  title={reviewTarget?.title}
                >
                  {reviewTarget?.title}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">
                  Assigned To
                </span>
                <span className="font-semibold text-foreground text-xs truncate block">
                  {reviewTarget?.assigned_to_name || reviewTarget?.assigned_to}
                </span>
              </div>
            </div>

            {/* Submission link */}
            <div className="space-y-1">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                Submission Link
              </span>
              {reviewTarget?.output_link ? (
                <a
                  href={reviewTarget.output_link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-brand-blue hover:underline break-all flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  {reviewTarget.output_link}
                </a>
              ) : isFetchingDetail ? (
                <span className="text-xs text-muted-foreground italic">
                  Loading submission link...
                </span>
              ) : (
                <span className="text-xs text-muted-foreground italic">
                  No submission link provided
                </span>
              )}
            </div>

            {/* Status selector */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                value={reviewForm.status}
                onValueChange={(v) =>
                  onReviewFormChange({ ...reviewForm, status: v })
                }
              >
                <SelectTrigger className="h-10 bg-background/50 border-border/50 font-bold text-xs uppercase">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className="bg-card font-bold border-border/60"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem
                      key={s}
                      value={s}
                      className="font-bold text-xs uppercase"
                    >
                      {s.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Karma — visible only when COMPLETED */}
            {reviewForm.status === "COMPLETED" && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Karma Points Awarded
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={reviewForm.karma}
                  onChange={(e) =>
                    onReviewFormChange({ ...reviewForm, karma: e.target.value })
                  }
                  className="h-10 bg-background/50 border-border/50 font-bold"
                  placeholder="e.g. 200"
                />
              </div>
            )}

            {/* Review Remark */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Review Remark
                {(reviewForm.status === "IN_PROGRESS" ||
                  reviewForm.status === "ON_HOLD") && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              <Textarea
                placeholder={
                  reviewForm.status === "COMPLETED"
                    ? "Optional — e.g. Great work, well done!"
                    : reviewForm.status === "IN_PROGRESS" ||
                        reviewForm.status === "ON_HOLD"
                      ? "Required — e.g. Failing test cases, please fix..."
                      : "Optional remark..."
                }
                value={reviewForm.remark}
                onChange={(e) =>
                  onReviewFormChange({ ...reviewForm, remark: e.target.value })
                }
                className="min-h-[80px] max-h-[150px] overflow-y-auto bg-background/50 border-border/50 font-medium resize-none"
              />
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-border/20 flex-wrap gap-2">
            <Button variant="outline" onClick={onClose} className="font-bold">
              Cancel
            </Button>
            {reviewForm.status === "COMPLETED" && (
              <Button
                disabled={isVerifyPending || isReviewPending}
                onClick={onVerifyAndAward}
                className="bg-success hover:bg-success/90 text-white font-bold gap-2"
              >
                {isVerifyPending ? (
                  <>
                    <Spinner className="w-4 h-4" /> Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Verify &amp; Award
                    Karma
                  </>
                )}
              </Button>
            )}
            <Button
              disabled={
                isReviewPending ||
                isVerifyPending ||
                !reviewForm.status ||
                ((reviewForm.status === "IN_PROGRESS" ||
                  reviewForm.status === "ON_HOLD") &&
                  !reviewForm.remark.trim())
              }
              onClick={onVerifySubmit}
              className="bg-brand-blue hover:bg-brand-blue/90 text-white font-bold gap-2"
            >
              {isReviewPending ? (
                <>
                  <Spinner className="w-4 h-4" /> Saving...
                </>
              ) : (
                <>
                  <MessageSquareDot className="w-4 h-4" /> Save Review
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && onDeleteClose()}>
        <DialogContent
          className="w-full max-w-[calc(100%-2rem)] sm:max-w-md border-border/40 bg-card backdrop-blur-xl max-h-[calc(100vh-2rem)] flex flex-col p-4 sm:p-6 rounded-2xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-widest text-destructive">
              Delete Task
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-muted-foreground mt-2">
              This action is permanent and cannot be undone. Are you sure you
              want to delete this task?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              onClick={onDeleteClose}
              className="font-bold"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isDeletePending}
              onClick={onDelete}
              className="font-bold gap-2"
            >
              {isDeletePending ? (
                <>
                  <Spinner className="w-4 h-4" /> Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" /> Delete Task
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
