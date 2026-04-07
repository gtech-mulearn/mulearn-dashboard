"use client";

/**
 * JobDeleteDialog — Confirmation dialog for job deletion
 *
 * 📍 src/features/company-jobs/components/job-delete-dialog.tsx
 *
 * Uses the project's existing ConfirmDialog component.
 */

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface JobDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  jobTitle: string;
  isDeleting: boolean;
}

export function JobDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  jobTitle,
  isDeleting,
}: JobDeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Job"
      description={`Are you sure you want to delete "${jobTitle}"? This action cannot be undone. All associated eligibility rules will also be removed.`}
      onConfirm={onConfirm}
      isPending={isDeleting}
      variant="destructive"
      confirmLabel="Delete Job"
    />
  );
}
