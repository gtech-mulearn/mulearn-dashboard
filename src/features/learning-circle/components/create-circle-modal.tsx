/**
 * Create Circle Modal
 *
 * 📍 src/features/learning-circle/components/create-circle-modal.tsx
 *
 * Modal for creating a new learning circle.
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCircle } from "../hooks";
import {
  CreateCircleRequestSchema,
  type CreateCircleRequest,
} from "../schemas";

interface CreateCircleModalProps {
  interestGroups: Array<{ id: string; name: string }>;
  organizations: Array<{ id: string; title: string }>;
  trigger?: React.ReactNode;
  onSuccess?: (circleId: string) => void;
}

export function CreateCircleModal({
  interestGroups,
  organizations,
  trigger,
  onSuccess,
}: CreateCircleModalProps) {
  const [open, setOpen] = useState(false);
  const { mutate: createCircle, isPending } = useCreateCircle();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCircleRequest>({
    resolver: zodResolver(CreateCircleRequestSchema),
    defaultValues: {
      ig: "",
      org: "",
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = (data: CreateCircleRequest) => {
    createCircle(data, {
      onSuccess: (circleId) => {
        setOpen(false);
        reset();
        onSuccess?.(circleId);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 bg-[#0961F5] hover:bg-[#0751d4]">
            <Plus className="h-4 w-4" />
            Create Circle
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
              <Users className="h-5 w-5 text-[#0961F5]" />
            </div>
            Create Learning Circle
          </DialogTitle>
          <DialogDescription>
            Start a new learning circle to collaborate with others on shared
            interests.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-5">
          {/* Interest Group */}
          <div className="space-y-2">
            <Label htmlFor="ig">Interest Group</Label>
            <select
              id="ig"
              {...register("ig")}
              className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-[#0961F5] focus:ring-[#0961F5]"
            >
              <option value="">Select an interest group</option>
              {interestGroups.map((ig) => (
                <option key={ig.id} value={ig.id}>
                  {ig.name}
                </option>
              ))}
            </select>
            {errors.ig && (
              <p className="text-sm text-red-500">{errors.ig.message}</p>
            )}
          </div>

          {/* Organization */}
          <div className="space-y-2">
            <Label htmlFor="org">Organization</Label>
            <select
              id="org"
              {...register("org")}
              className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-[#0961F5] focus:ring-[#0961F5]"
            >
              <option value="">Select an organization</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.title}
                </option>
              ))}
            </select>
            {errors.org && (
              <p className="text-sm text-red-500">{errors.org.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Circle Title</Label>
            <Input
              id="title"
              placeholder="e.g., Python Study Group"
              {...register("title")}
              className="w-full"
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
              placeholder="Describe what your circle is about..."
              rows={3}
              {...register("description")}
              className="w-full resize-none"
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#0961F5] hover:bg-[#0751d4]"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Circle
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
