/**
 * Add Voucher Dialog
 *
 * 📍 src/features/karma-voucher/components/add-voucher-dialog.tsx
 *
 * Single karma voucher creation form — issues one voucher to one user
 * for one task, mirroring the backend's singular VoucherLogAPI.post.
 * Task is entered as a plain hashtag string (backend resolves it).
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import { MuidSearchInput } from "@/components/ui/muid-search-input";
import type { UserResult } from "@/hooks/use-search";
import { CreateVoucherFormSchema } from "../schemas";

type FormInput = z.input<typeof CreateVoucherFormSchema>;
type FormValues = z.output<typeof CreateVoucherFormSchema>;

interface AddVoucherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FormValues) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function AddVoucherDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: AddVoucherDialogProps) {
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(CreateVoucherFormSchema),
    defaultValues: { user: "", task: "", karma: 0, month: "", week: "" },
  });

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
      setSelectedUser(null);
    }
    onOpenChange(nextOpen);
  };

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
    handleClose(false);
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="rounded-3xl border border-border bg-card">
        <DialogHeader>
          <DialogTitle>Add Voucher</DialogTitle>
          <DialogDescription>
            Issue a single karma voucher to a user. An email with the voucher
            code is sent automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>User</Label>
            <MuidSearchInput
              keepOpen
              selectedUser={
                selectedUser
                  ? { muid: selectedUser.muid, name: selectedUser.full_name }
                  : null
              }
              onSelectUser={(user) => {
                setSelectedUser(user);
                setValue("user", user.muid, { shouldValidate: true });
              }}
              onClear={() => {
                setSelectedUser(null);
                setValue("user", "", { shouldValidate: true });
              }}
              placeholder="Search by muid or name…"
            />
            {errors.user && (
              <p className="text-sm text-destructive">{errors.user.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task">Task Hashtag</Label>
            <Input
              id="task"
              placeholder="#task-hashtag"
              {...register("task")}
            />
            {errors.task && (
              <p className="text-sm text-destructive">{errors.task.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="karma">Karma</Label>
              <Input id="karma" type="number" min={1} {...register("karma")} />
              {errors.karma && (
                <p className="text-sm text-destructive">
                  {errors.karma.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="month">Month</Label>
              <Input
                id="month"
                placeholder="e.g. August"
                {...register("month")}
              />
              {errors.month && (
                <p className="text-sm text-destructive">
                  {errors.month.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="week">Week</Label>
              <Input id="week" placeholder="e.g. W3" {...register("week")} />
              {errors.week && (
                <p className="text-sm text-destructive">
                  {errors.week.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleClose(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Voucher"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
