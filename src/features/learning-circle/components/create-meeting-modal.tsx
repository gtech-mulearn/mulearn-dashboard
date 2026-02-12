/**
 * Create Meeting Modal
 *
 * 📍 src/features/learning-circle/components/create-meeting-modal.tsx
 *
 * Modal for creating a new meeting in a learning circle.
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
const CreateMeetingFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(1, "Description is required").max(1000),
  mode: z.enum(["online", "offline"]),
  meet_place: z.string().min(1, "Meeting place/link is required").max(200),
  meet_time: z.string().min(1, "Meeting time is required"),
  duration: z.number().min(1).max(24),
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
    },
  });

  const mode = watch("mode");

  const onSubmit = async (data: CreateMeetingFormData) => {
    try {
      await createMeeting.mutateAsync({
        ...data,
        meet_link: data.mode === "online" ? data.meet_place : null,
        coord_x: 0,
        coord_y: 0,
        is_recurring: false,
        recurrence_type: null,
        recurrence: null,
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule a Meeting</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title</Label>
            <Input
              id="title"
              placeholder="e.g., Weekly Standup"
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
              placeholder="What will be discussed..."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Mode */}
          <div className="space-y-2">
            <Label>Meeting Mode</Label>
            <Select
              defaultValue="online"
              onValueChange={(value) =>
                setValue("mode", value as "online" | "offline")
              }
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

          {/* Meet Place / Link */}
          <div className="space-y-2">
            <Label htmlFor="meet_place">
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
            />
            {errors.meet_place && (
              <p className="text-sm text-red-500">
                {errors.meet_place.message}
              </p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="meet_time">Date & Time</Label>
              <Input
                id="meet_time"
                type="datetime-local"
                {...register("meet_time")}
              />
              {errors.meet_time && (
                <p className="text-sm text-red-500">
                  {errors.meet_time.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                max={24}
                {...register("duration", { valueAsNumber: true })}
              />
              {errors.duration && (
                <p className="text-sm text-red-500">
                  {errors.duration.message}
                </p>
              )}
            </div>
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
              disabled={isSubmitting || createMeeting.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {createMeeting.isPending ? "Creating..." : "Schedule Meeting"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
