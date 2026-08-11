"use client";

import { useState } from "react";
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
import { useAddLearnerToShortlist } from "../hooks";

interface ShortlistLearnerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  learnerId: string;
  learnerName: string;
}

export function ShortlistLearnerDialog({
  isOpen,
  onClose,
  learnerId,
  learnerName,
}: ShortlistLearnerDialogProps) {
  const [note, setNote] = useState("");
  const { mutateAsync: addLearner, isPending } = useAddLearnerToShortlist();

  const handleOpenChange = (open: boolean) => {
    if (!open && !isPending) {
      setNote("");
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addLearner({ userId: learnerId, note: note.trim() || undefined });
    setNote("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add to Shortlist</DialogTitle>
            <DialogDescription>
              Adding{" "}
              <span className="font-medium text-foreground">{learnerName}</span>{" "}
              to your shortlist.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-2">
            <Label
              htmlFor="shortlist-note"
              className="text-sm text-muted-foreground"
            >
              Add a note (optional)
            </Label>
            <Textarea
              id="shortlist-note"
              placeholder="e.g. Strong backend candidate..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[90px] resize-none text-sm"
              disabled={isPending}
            />
          </div>

          <DialogFooter className="mt-5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Shortlisting…" : "Shortlist"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
