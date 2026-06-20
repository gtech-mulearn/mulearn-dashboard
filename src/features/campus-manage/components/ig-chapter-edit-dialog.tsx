"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MuidSearchInput } from "@/components/ui/muid-search-input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getApiResponseError } from "@/hooks/use-get-error";
import type { UserResult } from "@/hooks/use-search";
import { useDeleteIgChapter, useUpdateIgChapter } from "../hooks";
import type { IgChapter } from "../types";
import { TransferIgRoleDialog } from "./transfer-ig-role-dialog";

const schema = z.object({
  description: z.string().optional(),
  lead: z.string().optional(),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

interface IgChapterEditDialogProps {
  chapter: IgChapter;
  trigger?: React.ReactNode;
  /** Controlled open state. When provided, the dialog is controlled externally. */
  open?: boolean;
  /** Called when the dialog open state should change. Required when `open` is provided. */
  onOpenChange?: (open: boolean) => void;
}

export function IgChapterEditDialog({
  chapter,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: IgChapterEditDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Support both controlled (passed from outside) and uncontrolled (own state) modes.
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (value: boolean) => {
    if (isControlled) {
      controlledOnOpenChange?.(value);
    } else {
      setUncontrolledOpen(value);
    }
  };

  const [selectedUser, setSelectedUser] = useState<{
    muid: string;
    name: string;
  } | null>(null);
  const { mutate: update, isPending: isUpdating } = useUpdateIgChapter();
  const { mutate: deleteChapter, isPending: isDeleting } = useDeleteIgChapter();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: chapter.description ?? "",
      lead: chapter.leadId ?? "",
      is_active: chapter.isActive ?? true,
    },
  });

  const handleSelectUser = (user: UserResult) => {
    setSelectedUser({ muid: user.muid, name: user.full_name });
    form.setValue("lead", user.muid);
  };

  const handleClear = () => {
    setSelectedUser(null);
    form.setValue("lead", "");
  };

  const onSubmit = (values: FormValues) => {
    update(
      {
        chapterId: chapter.id,
        data: {
          description: values.description || undefined,
          lead: values.lead || undefined,
          is_active: values.is_active,
        },
      },
      {
        onSuccess: () => {
          toast.success("Chapter updated");
          setOpen(false);
        },
        onError: (error) => {
          toast.error(
            getApiResponseError(error, {
              fallback: "Failed to update chapter",
            }),
          );
        },
      },
    );
  };

  const handleDelete = () => {
    deleteChapter(chapter.id, {
      onSuccess: () => {
        toast.success("Chapter deleted");
        setOpen(false);
        setDeleteConfirmOpen(false);
      },
      onError: (error) => {
        toast.error(
          getApiResponseError(error, {
            fallback: "Failed to delete chapter",
          }),
        );
        setDeleteConfirmOpen(false);
      },
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {chapter.name}</DialogTitle>
            <DialogDescription>Update chapter details.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-5"
          >
            <div className="space-y-1.5">
              <label
                htmlFor="edit-chapter-description"
                className="text-sm font-medium"
              >
                Description
              </label>
              <Textarea
                id="edit-chapter-description"
                {...form.register("description")}
                placeholder="Chapter description..."
                rows={3}
              />
            </div>
            {chapter.lead === "No Lead Assigned" ? (
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Assign Lead</p>
                <MuidSearchInput
                  onSelectUser={handleSelectUser}
                  selectedUser={selectedUser}
                  onClear={handleClear}
                  keepOpen
                  placeholder="Search for lead..."
                  disabled={isUpdating}
                />
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Transfer Lead Role</p>
                  <p className="text-xs text-muted-foreground">
                    Currently:{" "}
                    <span className="font-semibold text-foreground">
                      {chapter.lead}
                    </span>
                  </p>
                </div>
                <TransferIgRoleDialog
                  defaultIgCode={chapter.code}
                  trigger={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      Transfer Lead
                    </Button>
                  }
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <p className="text-sm font-medium">Active</p>
              <Switch
                checked={form.watch("is_active")}
                onCheckedChange={(val) => form.setValue("is_active", val)}
              />
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 sm:gap-0 mt-6">
              <Button
                type="button"
                variant="destructive"
                disabled={isDeleting || isUpdating}
                onClick={() => setDeleteConfirmOpen(true)}
                className="w-full sm:w-auto"
              >
                Delete
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="w-full sm:w-auto"
              >
                {isUpdating ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={`Delete ${chapter.name}?`}
        description="This will permanently remove the chapter. This action cannot be undone."
        confirmLabel={isDeleting ? "Deleting..." : "Delete"}
        onConfirm={handleDelete}
        isPending={isDeleting}
        variant="destructive"
      />
    </>
  );
}
