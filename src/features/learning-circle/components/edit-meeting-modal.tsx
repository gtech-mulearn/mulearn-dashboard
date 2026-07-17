/**
 * Edit Meeting Modal
 *
 * 📍 src/features/learning-circle/components/edit-meeting-modal.tsx
 *
 * Modal for editing an existing meeting. Owner or Lead only.
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit2 } from "lucide-react";
import { useEffect, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getApiResponseError } from "@/hooks/use-get-error";
import { useEditMeeting } from "../hooks";
import type { MeetingDetail } from "../schemas";
import {
  getMeetTimeErrorMessage,
  getMinDateTimeLocalValue,
  isMeetTimeValid,
} from "../utils/meet-time-validation";

const PLATFORMS = [
  "Zoom",
  "Google Meet",
  "Microsoft Teams",
  "Discord",
  "Other",
] as const;
type Platform = (typeof PLATFORMS)[number];

/**
 * Build the edit-meeting schema. We pass in the original local datetime string
 * (as returned by utcToLocalDateTimeInput) so that the superRefine can skip
 * the "15 minutes in the future" check when the user hasn't changed the time.
 * This lets organisers fix a title/description on past or near-future meetings
 * without being blocked by the time-buffer validation (P1 fix).
 */
function buildEditMeetingSchema(originalMeetTime: string) {
  return z
    .object({
      title: z.string().min(1, "Title is required").max(100),
      description: z.string().min(1, "Description is required").max(1000),
      mode: z.enum(["online", "offline"]),
      platform: z.enum(PLATFORMS).nullable().optional(),
      meet_place: z.string().min(1, "Meeting place is required").max(200),
      meet_time: z.string().min(1, "Meeting time is required"),
      duration: z.number().min(1).max(24),
    })
    .refine((data) => data.mode !== "online" || !!data.platform, {
      message: "Platform is required for online meetings",
      path: ["platform"],
    })
    .superRefine((data, ctx) => {
      // P1 fix: only validate the time-buffer when the organiser actually
      // changed meet_time. If it matches the original value we loaded from the
      // server, skip the check so they can edit other fields freely.
      if (!data.meet_time || data.meet_time === originalMeetTime) return;

      const utcIso = new Date(data.meet_time).toISOString();
      if (!isMeetTimeValid(utcIso)) {
        ctx.addIssue({
          code: "custom",
          path: ["meet_time"],
          message: getMeetTimeErrorMessage(),
        });
      }
    });
}

// EditMeetingFormData is now declared inside the component (after the schema
// is built) so the type always reflects the current meeting's schema.

function utcToLocalDateTimeInput(value: string) {
  const date = new Date(value);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function localDateTimeToUtc(value: string) {
  return new Date(value).toISOString();
}

interface EditMeetingModalProps {
  meeting: MeetingDetail;
  circleId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMeetingModal({
  meeting,
  circleId,
  open,
  onOpenChange,
}: EditMeetingModalProps) {
  const editMeeting = useEditMeeting(meeting.id, circleId);

  // Recomputed each time the modal opens to reflect the current clock.
  // Drives the native `min` attribute on the datetime-local input.
  // biome-ignore lint/correctness/useExhaustiveDependencies: Recomputed each time the modal opens
  const minMeetTime = useMemo(() => getMinDateTimeLocalValue(), [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Derive the original local datetime string once — used both as the form
  // default value and as the baseline for the skip-validation check.
  const originalMeetTime = utcToLocalDateTimeInput(meeting.meet_time);

  // Rebuild the schema whenever the meeting changes so the originalMeetTime
  // closure is always in sync with the currently-open meeting.
  // biome-ignore lint/correctness/useExhaustiveDependencies: schema depends on originalMeetTime derived from meeting
  const EditMeetingFormSchema = useMemo(
    () => buildEditMeetingSchema(originalMeetTime),
    [meeting.meet_time], // eslint-disable-line react-hooks/exhaustive-deps
  );

  type EditMeetingFormData = z.infer<typeof EditMeetingFormSchema>;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditMeetingFormData>({
    resolver: zodResolver(EditMeetingFormSchema),
    defaultValues: {
      title: meeting.title,
      description: meeting.description,
      mode: meeting.mode as "online" | "offline",
      platform: PLATFORMS.includes(meeting.meet_place as Platform)
        ? (meeting.meet_place as Platform)
        : null,
      meet_place: meeting.meet_link || meeting.meet_place || "",
      meet_time: originalMeetTime,
      duration: meeting.duration,
    },
  });

  const mode = watch("mode");

  useEffect(() => {
    reset({
      title: meeting.title,
      description: meeting.description,
      mode: meeting.mode as "online" | "offline",
      platform: PLATFORMS.includes(meeting.meet_place as Platform)
        ? (meeting.meet_place as Platform)
        : null,
      meet_place: meeting.meet_link || meeting.meet_place || "",
      // Use the already-computed originalMeetTime so the reset value matches
      // the baseline the schema was built with.
      meet_time: originalMeetTime,
      duration: meeting.duration,
    });
  }, [meeting, reset, originalMeetTime]);

  const onSubmit = async (data: EditMeetingFormData) => {
    try {
      await editMeeting.mutateAsync({
        ...data,
        meet_time: localDateTimeToUtc(data.meet_time),
        platform: data.mode === "online" ? data.platform : null,
        meet_link: data.mode === "online" ? data.meet_place : null,
        coord_x: meeting.coord_x,
        coord_y: meeting.coord_y,
      });
      onOpenChange(false);
    } catch (error) {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to save meeting" }),
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-w-[520px]">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-3 text-lg">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 shadow-sm">
              <Edit2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="block">Edit Meeting</span>
              <span className="block text-xs font-normal text-muted-foreground">
                Update meeting details
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col min-h-0"
        >
          <div className="overflow-y-auto px-6 py-5 space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Meeting Title
              </Label>
              <Input
                id="title"
                {...register("title")}
                className="rounded-xl border-border/40 shadow-sm"
              />
              {errors.title && (
                <p className="text-xs font-medium text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Description
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                className="resize-none rounded-xl border-border/40 shadow-sm"
              />
              {errors.description && (
                <p className="text-xs font-medium text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Meeting Mode
              </Label>
              <Select
                defaultValue={meeting.mode}
                onValueChange={(value) => {
                  setValue("mode", value as "online" | "offline");
                  if (value === "offline") setValue("platform", null);
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

            {mode === "online" && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Platform
                </Label>
                <Select
                  defaultValue={
                    PLATFORMS.includes(meeting.meet_place as Platform)
                      ? meeting.meet_place
                      : undefined
                  }
                  onValueChange={(value) =>
                    setValue("platform", value as Platform)
                  }
                >
                  <SelectTrigger className="rounded-xl border-border/40 shadow-sm">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.platform && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.platform.message}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="meet_place"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {mode === "online" ? "Meeting Link" : "Meeting Location"}
              </Label>
              <Input
                id="meet_place"
                {...register("meet_place")}
                className="rounded-xl border-border/40 shadow-sm"
              />
              {errors.meet_place && (
                <p className="text-xs font-medium text-destructive">
                  {errors.meet_place.message}
                </p>
              )}
            </div>

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
                  min={minMeetTime}
                  {...register("meet_time")}
                  className="rounded-xl border-border/40 shadow-sm"
                />
                {errors.meet_time && (
                  <p className="text-xs font-medium text-destructive">
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
                  <p className="text-xs font-medium text-destructive">
                    {errors.duration.message}
                  </p>
                )}
              </div>
            </div>
          </div>

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
              disabled={isSubmitting || editMeeting.isPending}
              className="rounded-xl px-5 text-sm font-semibold shadow-sm hover:shadow"
            >
              {editMeeting.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
