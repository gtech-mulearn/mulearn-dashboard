"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomDateTimePicker } from "@/components/ui/custom-datetime-picker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateBroadcast, useUpdateBroadcast } from "../../hooks";
import {
  type AdminBroadcast,
  type BroadcastCreatePayload,
  BroadcastCreateSchema,
  TARGET_TYPE_LABELS,
  type TargetType,
} from "../../schemas";

interface BroadcastFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTarget?: AdminBroadcast;
}

export function BroadcastFormDialog({
  open,
  onOpenChange,
  editTarget,
}: BroadcastFormDialogProps) {
  const isEdit = !!editTarget;

  const { mutate: create, isPending: isCreating } = useCreateBroadcast();
  const { mutate: update, isPending: isUpdating } = useUpdateBroadcast();
  const isPending = isCreating || isUpdating;

  const form = useForm<BroadcastCreatePayload>({
    resolver: zodResolver(BroadcastCreateSchema),
    defaultValues: { title: "", description: "", url: "", expires_at: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        editTarget
          ? {
              title: editTarget.title,
              description: editTarget.description,
              url: editTarget.url ?? "",
              expires_at: editTarget.expires_at,
            }
          : { title: "", description: "", url: "", expires_at: "" },
      );
    }
  }, [open, editTarget, form]);

  function onSubmit(values: BroadcastCreatePayload) {
    const payload = { ...values, url: values.url || undefined };

    if (isEdit && editTarget) {
      update(
        { id: editTarget.id, payload },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      create(payload, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Broadcast" : "Create Broadcast"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Announcement title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Announcement details..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expires_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expires at</FormLabel>
                  <FormControl>
                    <CustomDateTimePicker
                      value={field.value ?? ""}
                      onChange={(val) => field.onChange(val)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEdit && editTarget && (
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Target Audience</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {TARGET_TYPE_LABELS[editTarget.target_type as TargetType] ??
                      editTarget.target_type}
                  </Badge>
                  {editTarget.target_type !== "global" &&
                    editTarget.target_details?.name && (
                      <span className="text-sm text-muted-foreground">
                        {editTarget.target_details.name}
                      </span>
                    )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Target is set by the system and cannot be changed.
                </p>
              </div>
            )}

            {!isEdit && (
              <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Target:</span>{" "}
                  Global (All Users) — set automatically by the system.
                </p>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? isEdit
                    ? "Saving..."
                    : "Creating..."
                  : isEdit
                    ? "Save changes"
                    : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
