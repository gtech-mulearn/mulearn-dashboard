"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MuidSearchInput } from "@/components/ui/muid-search-input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { UserResult } from "@/hooks/use-search";
import { ApiError } from "@/api";
import { useDeleteIgChapter, useUpdateIgChapter } from "../hooks";
import type { IgChapter } from "../types";

const schema = z.object({
  description: z.string().optional(),
  lead: z.string().optional(),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

interface IgChapterEditSheetProps {
  chapter: IgChapter;
  trigger: React.ReactNode;
}

export function IgChapterEditSheet({
  chapter,
  trigger,
}: IgChapterEditSheetProps) {
  const [open, setOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
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
            error instanceof ApiError
              ? error.message
              : "Failed to update chapter",
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
          error instanceof ApiError
            ? error.message
            : "Failed to delete chapter",
        );
        setDeleteConfirmOpen(false);
      },
    });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit {chapter.name}</SheetTitle>
            <SheetDescription>Update chapter details.</SheetDescription>
          </SheetHeader>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-6 space-y-5"
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
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Lead</p>
              <MuidSearchInput
                onSelectUser={handleSelectUser}
                selectedUser={selectedUser}
                onClear={handleClear}
                keepOpen
                placeholder="Search for lead..."
                disabled={isUpdating}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Active</p>
              <Switch
                checked={form.watch("is_active")}
                onCheckedChange={(val) => form.setValue("is_active", val)}
              />
            </div>
            <SheetFooter className="gap-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={isDeleting || isUpdating}
                onClick={() => setDeleteConfirmOpen(true)}
              >
                Delete
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save changes"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

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
