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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMeeting } from "../hooks";

const DAYS_OF_WEEK = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
] as const;

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
    recurrence: z.number().optional().nullable(),
  })
  .refine((data) => data.mode !== "online" || !!data.platform, {
    message: "Platform is required for online meetings",
    path: ["platform"],
  })
  .superRefine((data, ctx) => {
    if (!data.is_recurring) return;
    if (data.recurrence_type === "weekly") {
      if (
        data.recurrence == null ||
        data.recurrence < 1 ||
        data.recurrence > 7
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Select a day of the week",
          path: ["recurrence"],
        });
      }
    } else if (data.recurrence_type === "monthly") {
      if (
        data.recurrence == null ||
        data.recurrence < 1 ||
        data.recurrence > 28
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Day of month must be between 1 and 28",
          path: ["recurrence"],
        });
      }
    }
  });

type CreateMeetingFormData = z.infer<typeof CreateMeetingFormSchema>;

function localDateTimeToUtc(value: string) {
  return new Date(value).toISOString();
}

/** Convert a date string (YYYY-MM-DD or ISO) to datetime-local input value in local time. */
function toLocalDateTimeInput(value: string): string {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

interface CreateMeetingModalProps {
  circleId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Suggested meet_time (ISO date or datetime string) pre-filled from the circle's recurrence pattern. */
  suggestedMeetTime?: string | null;
}

export function CreateMeetingModal({
  circleId,
  open,
  onOpenChange,
  suggestedMeetTime,
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
      meet_time: suggestedMeetTime
        ? toLocalDateTimeInput(suggestedMeetTime)
        : "",
    },
  });

  const mode = watch("mode");
  const isRecurring = watch("is_recurring");
  const recurrenceType = watch("recurrence_type");

  // When the modal opens, apply the suggested time if provided.
  useEffect(() => {
    if (open && suggestedMeetTime) {
      setValue("meet_time", toLocalDateTimeInput(suggestedMeetTime));
    }
  }, [open, suggestedMeetTime, setValue]);

  const onSubmit = async (data: CreateMeetingFormData) => {
    try {
      await createMeeting.mutateAsync({
        ...data,
        meet_time: localDateTimeToUtc(data.meet_time),
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
      toast.error(
        error instanceof Error ? error.message : "Failed to create meeting",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-w-[700px]">
        {/* ── Header ── */}
        <DialogHeader className="shrink-0 px-8 pt-7 pb-5 border-b border-border/40">
          <DialogTitle className="flex items-center gap-3.5 text-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="block font-bold">Schedule a Meeting</span>
              <span className="block text-xs font-normal text-muted-foreground">
                Set up a time to collaborate with your circle
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* ── Scrollable form body ── */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col overflow-y-auto"
        >
          <div className="px-8 py-6 space-y-6">
            {/* Row 1: Title + Description */}
            <div className="grid grid-cols-2 gap-5">
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
                  className="rounded-xl border-border/40"
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
                  placeholder="What will be discussed..."
                  rows={1}
                  {...register("description")}
                  className="resize-none rounded-xl border-border/40"
                />
                {errors.description && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Mode + Platform */}
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Meeting Mode
                </Label>
                <Select
                  defaultValue="online"
                  onValueChange={(value) => {
                    setValue("mode", value as "online" | "offline");
                    if (value === "offline") setValue("platform", null);
                  }}
                >
                  <SelectTrigger className="rounded-xl border-border/40">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {mode === "online" ? "Platform" : "Location"}
                </Label>
                {mode === "online" ? (
                  <>
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
                      <SelectTrigger className="rounded-xl border-border/40">
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
                      <p className="text-xs font-medium text-destructive">
                        {errors.platform.message}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <Input
                      id="meet_place_offline"
                      placeholder="Room 101, Building A"
                      {...register("meet_place")}
                      className="rounded-xl border-border/40"
                    />
                    {errors.meet_place && (
                      <p className="text-xs font-medium text-destructive">
                        {errors.meet_place.message}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Row 3: Meeting link (online only, full width) */}
            {mode === "online" && (
              <div className="space-y-2">
                <Label
                  htmlFor="meet_place"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Meeting Link
                </Label>
                <Input
                  id="meet_place"
                  placeholder="https://meet.google.com/..."
                  {...register("meet_place")}
                  className="rounded-xl border-border/40"
                />
                {errors.meet_place && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.meet_place.message}
                  </p>
                )}
              </div>
            )}

            {/* Row 4: Date & Time + Duration */}
            <div className="grid grid-cols-2 gap-5">
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
                  className="rounded-xl border-border/40"
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
                  className="rounded-xl border-border/40"
                />
                {errors.duration && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.duration.message}
                  </p>
                )}
              </div>
            </div>

            {/* Row 5: Recurrence */}
            <div className="rounded-xl border border-border/40 bg-muted/20 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_recurring"
                  className="h-4 w-4 rounded border-border/60 text-primary focus:ring-primary/30"
                  {...register("is_recurring")}
                />
                <div>
                  <Label
                    htmlFor="is_recurring"
                    className="cursor-pointer text-sm font-semibold text-foreground"
                  >
                    Recurring meeting
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Set a weekly or monthly cadence — the system will suggest
                    the next date after each meeting.
                  </p>
                </div>
              </div>

              {isRecurring && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Frequency
                      </Label>
                      <Select
                        onValueChange={(value) => {
                          setValue(
                            "recurrence_type",
                            value as "weekly" | "monthly",
                          );
                          setValue("recurrence", null);
                        }}
                      >
                        <SelectTrigger className="rounded-xl border-border/40">
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
                        {recurrenceType === "monthly"
                          ? "Day of month"
                          : "Day of week"}
                      </Label>
                      {recurrenceType === "weekly" ? (
                        <Select
                          onValueChange={(value) =>
                            setValue("recurrence", parseInt(value, 10))
                          }
                        >
                          <SelectTrigger className="rounded-xl border-border/40">
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS_OF_WEEK.map((d) => (
                              <SelectItem key={d.value} value={String(d.value)}>
                                {d.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : recurrenceType === "monthly" ? (
                        <Input
                          id="recurrence"
                          type="number"
                          min={1}
                          max={28}
                          placeholder="e.g., 15"
                          {...register("recurrence", { valueAsNumber: true })}
                          className="rounded-xl border-border/40"
                        />
                      ) : (
                        <Input
                          disabled
                          placeholder="Select frequency first"
                          className="rounded-xl border-border/40 opacity-40"
                        />
                      )}
                      {errors.recurrence && (
                        <p className="text-xs font-medium text-destructive">
                          {errors.recurrence.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Date & time above
                    </span>{" "}
                    = when this specific meeting happens. &nbsp;
                    <span className="font-medium text-foreground">
                      Cadence below
                    </span>{" "}
                    = the regular day used to suggest future dates.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="shrink-0 flex justify-end gap-3 px-8 py-5 border-t border-border/40 bg-muted/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-border/40 px-6 text-sm font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createMeeting.isPending}
              className="rounded-xl px-6 text-sm font-semibold"
            >
              {createMeeting.isPending ? "Creating..." : "Schedule Meeting"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
