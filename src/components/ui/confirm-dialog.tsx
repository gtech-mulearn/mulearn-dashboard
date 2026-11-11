"use client";

import { AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";
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
  variant?: "destructive" | "warning" | "default" | "success";
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
  const isWarning = variant === "warning";

  const getIcon = () => {
    if (isDestructive) return <Trash2 className="h-5 w-5" />;
    if (isWarning) return <AlertTriangle className="h-5 w-5" />;
    return <CheckCircle2 className="h-5 w-5" />;
  };

  const getIconContainerStyles = () => {
    if (isDestructive) return "bg-destructive/10 text-destructive";
    if (isWarning)
      return "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400";
    return "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="confirm-dialog">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getIconContainerStyles()}`}
            >
              {getIcon()}
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
