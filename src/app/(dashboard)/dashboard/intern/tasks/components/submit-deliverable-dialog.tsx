"use client";

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

interface SubmitDeliverableDialogProps {
  open: boolean;
  outputLink: string;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onOutputLinkChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function SubmitDeliverableDialog({
  open,
  outputLink,
  isPending,
  onOpenChange,
  onOutputLinkChange,
  onCancel,
  onConfirm,
}: SubmitDeliverableDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-md border-border/40 bg-card/95 backdrop-blur-2xl shadow-2xl">
        <DialogHeader className="pb-4 border-b border-border/20">
          <DialogTitle className="text-xl font-black uppercase tracking-tight text-foreground">
            Submit Task Deliverables
          </DialogTitle>
          <DialogDescription className="text-xs font-semibold text-muted-foreground mt-1">
            Please provide the submission link (e.g., GitHub PR, Figma link,
            document) to mark this task as completed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <label
              htmlFor="output-link-input"
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
            >
              Submission URL / Output Link
            </label>
            <Input
              id="output-link-input"
              type="url"
              required
              pattern="https?://.+"
              placeholder="https://github.com/... or similar"
              value={outputLink}
              onChange={(e) => onOutputLinkChange(e.target.value)}
              className="bg-background/50 border-border/50 font-medium focus-visible:ring-brand-blue"
            />
            <p className="text-[10px] text-muted-foreground font-medium">
              Must be a valid URL starting with{" "}
              <span className="font-black">https://</span>
            </p>
          </div>
        </div>

        <DialogFooter className="border-t border-border/20 pt-4 flex items-center justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={onCancel}
            className="text-xs uppercase tracking-widest"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="default"
            onClick={onConfirm}
            disabled={isPending}
            className="text-xs uppercase tracking-widest"
          >
            {isPending ? "Submitting..." : "Complete Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
