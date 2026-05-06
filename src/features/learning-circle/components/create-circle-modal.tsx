/**
 * Create Circle Modal
 *
 * 📍 src/features/learning-circle/components/create-circle-modal.tsx
 *
 * Modal for creating a new learning circle.
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCircle } from "../hooks";
import {
  type CreateCircleRequest,
  CreateCircleRequestSchema,
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
          <Button className="gap-2 rounded-xl px-5 text-sm font-semibold">
            <Plus className="h-4 w-4" />
            Create Circle
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="block">Create Learning Circle</span>
              <span className="block text-xs font-normal text-muted-foreground">
                Start collaborating with others
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-5">
          {/* Interest Group */}
          <div className="space-y-2">
            <Label
              htmlFor="ig"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Interest Group
            </Label>
            <select
              id="ig"
              {...register("ig")}
              className="block w-full rounded-xl border border-border/40 bg-card px-4 py-2.5 text-sm shadow-sm transition-shadow focus:border-primary/30 focus:shadow-[0_0_0_3px_rgba(9,97,245,0.06)] focus:outline-none focus:ring-0"
            >
              <option value="">Select an interest group</option>
              {interestGroups.map((ig) => (
                <option key={ig.id} value={ig.id}>
                  {ig.name}
                </option>
              ))}
            </select>
            {errors.ig && (
              <p className="text-xs font-medium text-destructive">
                {errors.ig.message}
              </p>
            )}
          </div>

          {/* Organization */}
          <div className="space-y-2">
            <Label
              htmlFor="org"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Organization
            </Label>
            <select
              id="org"
              {...register("org")}
              className="block w-full rounded-xl border border-border/30 bg-card px-4 py-2.5 text-sm transition-colors focus:border-primary/30 focus:outline-none focus:ring-0"
            >
              <option value="">Select an organization</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.title}
                </option>
              ))}
            </select>
            {errors.org && (
              <p className="text-xs font-medium text-destructive">
                {errors.org.message}
              </p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Circle Title
            </Label>
            <Input
              id="title"
              placeholder="e.g., Python Study Group"
              {...register("title")}
              className="rounded-xl border-border/30 shadow-none"
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
              placeholder="Describe what your circle is about..."
              rows={3}
              {...register("description")}
              className="resize-none rounded-xl border-border/30 shadow-none"
            />
            {errors.description && (
              <p className="text-xs font-medium text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-border/20 pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl border-border/30 px-5 text-sm font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-xl px-5 text-sm font-semibold"
            >
              {isPending && <Spinner className="mr-2 h-4 w-4" />}
              Create Circle
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
