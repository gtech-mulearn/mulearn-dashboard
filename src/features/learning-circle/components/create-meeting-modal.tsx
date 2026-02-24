/**
 * Create Meeting Modal
 *
 * 📍 src/features/learning-circle/components/create-meeting-modal.tsx
 *
 * Modal for creating a new meeting in a learning circle.
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMeeting } from "../hooks";

// Simplified schema for the form
const CreateMeetingFormSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(100),
    description: z.string().min(1, "Description is required").max(1000),
    mode: z.enum(["online", "offline"]),
    platform: z
      .enum(["Zoom", "Google Meet", "Microsoft Teams", "Discord", "Other"])
      .optional()
      .nullable(),
    meet_place: z.string().min(1, "Meeting place/link is required").max(200),
    meet_time: z.string().min(1, "Meeting time is required"),
    duration: z.number().min(1).max(24),
    is_recurring: z.boolean(),
    recurrence_type: z.enum(["weekly", "monthly"]).optional().nullable(),
    recurrence: z.number().min(1).max(52).optional().nullable(),
  })
  .refine((data) => data.mode !== "online" || !!data.platform, {
    message: "Platform is required for online meetings",
    path: ["platform"],
  });

type CreateMeetingFormData = z.infer<typeof CreateMeetingFormSchema>;

interface CreateMeetingModalProps {
  circleId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateMeetingModal({
  circleId,
  open,
  onOpenChange,
}: CreateMeetingModalProps) {
  const createMeeting = useCreateMeeting(circleId);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateMeetingFormData>({
    resolver: zodResolver(CreateMeetingFormSchema),
    defaultValues: {
      mode: "online",
      duration: 1,
      is_recurring: false,
      recurrence_type: null,
      recurrence: null,
      platform: null,
    },
  });

  const mode = watch("mode");
  const isRecurring = watch("is_recurring");

  const onSubmit = async (data: CreateMeetingFormData) => {
    try {
      await createMeeting.mutateAsync({
        ...data,
        platform: data.mode === "online" ? data.platform : null,
        meet_link: data.mode === "online" ? data.meet_place : null,
        coord_x: 0,
        coord_y: 0,
        is_recurring: data.is_recurring,
        recurrence_type: data.is_recurring ? data.recurrence_type : null,
        recurrence: data.is_recurring ? data.recurrence : null,
        is_report_needed: false,
        report_description: null,
      });
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create meeting:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 shadow-sm">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="block">Schedule a Meeting</span>
              <span className="block text-xs font-normal text-muted-foreground">
                Set up a time to collaborate
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Meeting Title
            </Label>
            <Input
              id="title"
              placeholder="e.g., Weekly Standup"
              {...register("title")}
              className="rounded-xl border-border/40 shadow-sm"
            />
            {errors.title && (
              <p className="text-xs font-medium text-red-500">
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
              placeholder="What will be discussed..."
              {...register("description")}
              className="resize-none rounded-xl border-border/40 shadow-sm"
            />
            {errors.description && (
              <p className="text-xs font-medium text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Mode */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Meeting Mode
            </Label>
            <Select
              defaultValue="online"
              onValueChange={(value) => {
                setValue("mode", value as "online" | "offline");
                if (value === "offline") {
                  setValue("platform", null);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Platform (online only) */}
          {mode === "online" && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Platform
              </Label>
              <Select
                onValueChange={(value) =>
                  setValue(
                    "platform",
                    value as
                      | "Zoom"
                      | "Google Meet"
                      | "Microsoft Teams"
                      | "Discord"
                      | "Other",
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Zoom">Zoom</SelectItem>
                  <SelectItem value="Google Meet">Google Meet</SelectItem>
                  <SelectItem value="Microsoft Teams">
                    Microsoft Teams
                  </SelectItem>
                  <SelectItem value="Discord">Discord</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.platform && (
                <p className="text-xs font-medium text-red-500">
                  {errors.platform.message}
                </p>
              )}
            </div>
          )}

          {/* Meet Place / Link */}
          <div className="space-y-2">
            <Label
              htmlFor="meet_place"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {mode === "online" ? "Meeting Link" : "Meeting Location"}
            </Label>
            <Input
              id="meet_place"
              placeholder={
                mode === "online"
                  ? "https://meet.google.com/..."
                  : "Room 101, Building A"
              }
              {...register("meet_place")}
              className="rounded-xl border-border/40 shadow-sm"
            />
            {errors.meet_place && (
              <p className="text-xs font-medium text-red-500">
                {errors.meet_place.message}
              </p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="meet_time"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Date & Time
              </Label>
              <Input
                id="meet_time"
                type="datetime-local"
                {...register("meet_time")}
                className="rounded-xl border-border/40 shadow-sm"
              />
              {errors.meet_time && (
                <p className="text-xs font-medium text-red-500">
                  {errors.meet_time.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="duration"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Duration (hours)
              </Label>
              <Input
                id="duration"
                type="number"
                min={1}
                max={24}
                {...register("duration", { valueAsNumber: true })}
                className="rounded-xl border-border/40 shadow-sm"
              />
              {errors.duration && (
                <p className="text-xs font-medium text-red-500">
                  {errors.duration.message}
                </p>
              )}
            </div>
          </div>

          {/* Recurrence */}
          <div className="space-y-3 rounded-xl bg-muted/20 p-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_recurring"
                className="h-4 w-4 rounded-md border-border/60 text-primary focus:ring-primary/30"
                {...register("is_recurring")}
              />
              <Label
                htmlFor="is_recurring"
                className="cursor-pointer text-sm font-semibold text-foreground"
              >
                Recurring meeting
              </Label>
            </div>

            {isRecurring && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Repeat
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setValue("recurrence_type", value as "weekly" | "monthly")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="recurrence"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Number of occurrences
                  </Label>
                  <Input
                    id="recurrence"
                    type="number"
                    min={1}
                    max={52}
                    placeholder="e.g., 4"
                    {...register("recurrence", { valueAsNumber: true })}
                    className="rounded-xl border-border/40 shadow-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 border-t border-border/30 pt-5">
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
              disabled={isSubmitting || createMeeting.isPending}
              className="rounded-xl px-5 text-sm font-semibold shadow-sm hover:shadow"
            >
              {createMeeting.isPending ? "Creating..." : "Schedule Meeting"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
