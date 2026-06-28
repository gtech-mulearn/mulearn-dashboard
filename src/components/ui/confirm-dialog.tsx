"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  isPending?: boolean;
  variant?: "destructive" | "warning";
  confirmLabel?: string;
  cancelLabel?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isPending = false,
  variant = "destructive",
  confirmLabel,
  cancelLabel,
}: ConfirmDialogProps) {
  const isDestructive = variant === "destructive";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="confirm-dialog">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                isDestructive
                  ? "bg-destructive/10 text-destructive"
                  : "bg-warning/10 text-warning"
              }`}
            >
              {isDestructive ? (
                <Trash2 className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-1">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            data-testid="confirm-dialog-cancel"
          >
            {cancelLabel ?? "Cancel"}
          </Button>
          <Button
            type="button"
            variant={isDestructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isPending}
            data-testid="confirm-dialog-confirm"
          >
            {isPending
              ? "Processing..."
              : (confirmLabel ?? (isDestructive ? "Delete" : "Confirm"))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
