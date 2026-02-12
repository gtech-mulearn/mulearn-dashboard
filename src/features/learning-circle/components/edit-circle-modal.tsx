/**
 * Edit Circle Modal
 *
 * 📍 src/features/learning-circle/components/edit-circle-modal.tsx
 *
 * Modal for editing an existing learning circle.
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
      console.error("Failed to edit circle:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Learning Circle</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Circle Name</Label>
            <Input
              id="title"
              placeholder="e.g., Web Dev Enthusiasts"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this circle about..."
              rows={4}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Read-only fields */}
          <div className="space-y-2">
            <Label className="text-gray-500">Interest Group</Label>
            <p className="text-sm text-gray-600 bg-gray-50 rounded-md p-2">
              {circle.ig}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-500">Organization</Label>
            <p className="text-sm text-gray-600 bg-gray-50 rounded-md p-2">
              {circle.org || "No organization"}
            </p>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || editCircle.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {editCircle.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
