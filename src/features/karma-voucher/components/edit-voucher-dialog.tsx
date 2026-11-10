/**
 * Edit Voucher Dialog
 *
 * 📍 src/features/karma-voucher/components/edit-voucher-dialog.tsx
 *
 * Updates a voucher's task hashtag and karma via
 * PATCH /karma-voucher/update/<id>/.
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
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
import { UpdateVoucherFormSchema } from "../schemas";
import type { KarmaVoucher } from "../types";

type FormInput = z.input<typeof UpdateVoucherFormSchema>;
type FormValues = z.output<typeof UpdateVoucherFormSchema>;

interface EditVoucherDialogProps {
  voucher: KarmaVoucher | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FormValues) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function EditVoucherDialog({
  voucher,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: EditVoucherDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(UpdateVoucherFormSchema),
    defaultValues: { hashtag: "", new_karma: 0 },
  });

  useEffect(() => {
    if (voucher) {
      reset({
        hashtag: voucher.hashtag ?? "",
        new_karma: voucher.karma,
      });
    }
  }, [voucher, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Dialog open={!!voucher} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border border-border bg-card">
        <DialogHeader>
          <DialogTitle>Edit Voucher</DialogTitle>
          <DialogDescription>
            Update the task hashtag or karma for this voucher.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="hashtag">Task Hashtag</Label>
            <Input
              id="hashtag"
              placeholder="#task-hashtag"
              {...register("hashtag")}
            />
            {errors.hashtag && (
              <p className="text-sm text-destructive">
                {errors.hashtag.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new_karma">Karma</Label>
            <Input
              id="new_karma"
              type="number"
              min={1}
              {...register("new_karma")}
            />
            {errors.new_karma && (
              <p className="text-sm text-destructive">
                {errors.new_karma.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
