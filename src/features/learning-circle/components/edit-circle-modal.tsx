/**
 * Edit Circle Modal
 *
 * 📍 src/features/learning-circle/components/edit-circle-modal.tsx
 *
 * Modal for editing an existing learning circle.
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEditCircle } from "../hooks";
import type { LearningCircleDetail } from "../schemas";

const EditCircleFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(1, "Description is required").max(1000),
});

type EditCircleFormData = z.infer<typeof EditCircleFormSchema>;

interface EditCircleModalProps {
  circle: LearningCircleDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCircleModal({
  circle,
  open,
  onOpenChange,
}: EditCircleModalProps) {
  const editCircle = useEditCircle(circle.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditCircleFormData>({
    resolver: zodResolver(EditCircleFormSchema),
    defaultValues: {
      title: circle.title,
      description: circle.description ?? "",
    },
  });

  // Reset form when circle data changes
  useEffect(() => {
    reset({
      title: circle.title,
      description: circle.description ?? "",
    });
  }, [circle, reset]);

  const onSubmit = async (data: EditCircleFormData) => {
    try {
      await editCircle.mutateAsync(data);
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save circle",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-w-[520px]">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-3 text-lg">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 shadow-sm">
              <Edit className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="block">Edit Learning Circle</span>
              <span className="block text-xs font-normal text-muted-foreground">
                Update circle details
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col min-h-0"
        >
          <div className="overflow-y-auto px-6 py-5 space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Circle Name
              </Label>
              <Input
                id="title"
                placeholder="e.g., Web Dev Enthusiasts"
                {...register("title")}
                className="rounded-xl border-border/40 shadow-sm"
              />
              {errors.title && (
                <p className="text-xs font-medium text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="What is this circle about..."
                rows={4}
                {...register("description")}
                className="resize-none rounded-xl border-border/40 shadow-sm"
              />
              {errors.description && (
                <p className="text-xs font-medium text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Read-only fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Interest Group
                </Label>
                <p className="rounded-xl bg-muted/30 px-4 py-2.5 text-sm font-medium text-foreground">
                  {circle.ig}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Organization
                </Label>
                <p className="rounded-xl bg-muted/30 px-4 py-2.5 text-sm font-medium text-foreground">
                  {circle.org || "No organization"}
                </p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="shrink-0 flex justify-end gap-3 px-6 py-4 border-t border-border/30">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-border/40 px-5 text-sm font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || editCircle.isPending}
              className="rounded-xl px-5 text-sm font-semibold shadow-sm hover:shadow"
            >
              {editCircle.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
