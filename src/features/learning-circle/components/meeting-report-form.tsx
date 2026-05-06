/**
 * Meeting Report Form
 *
 * 📍 src/features/learning-circle/components/meeting-report-form.tsx
 *
 * Submit/edit meeting report with attendee checkboxes. Owner or Lead only.
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, FileText, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  useDeleteMeetingReport,
  useMeetingReport,
  useSubmitMeetingReport,
} from "../hooks";
import type { MeetingAttendee, MeetingReportRequest } from "../schemas";
import { MeetingReportRequestSchema } from "../schemas";

// TODO: avatar color palette — no semantic token for multi-color identity; needs design decision
const COLORS = [
  "bg-primary/20 text-primary",
  "bg-success/20 text-success",
  "bg-warning/20 text-warning",
  "bg-destructive/20 text-destructive",
  "bg-brand-blue/20 text-brand-blue",
  "bg-brand-purple/20 text-brand-purple",
];

function getColor(name: string) {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
}

interface MeetingReportFormProps {
  meetingId: string;
  attendees: MeetingAttendee[];
}

export function MeetingReportForm({
  meetingId,
  attendees,
}: MeetingReportFormProps) {
  const { data: existingReport, isLoading } = useMeetingReport(meetingId);
  const submitReport = useSubmitMeetingReport(meetingId);
  const deleteReport = useDeleteMeetingReport(meetingId);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MeetingReportRequest>({
    resolver: zodResolver(MeetingReportRequestSchema),
    defaultValues: {
      report: "",
      attendees: {},
    },
  });

  const attendeesValue = watch("attendees");

  useEffect(() => {
    if (existingReport) {
      reset({
        report: existingReport.report ?? "",
        attendees: Object.fromEntries(
          existingReport.attendees?.map((a) => [a.user_id, a.is_lc_approved]) ??
            [],
        ),
      });
    }
  }, [existingReport, reset]);

  const onSubmit = (data: MeetingReportRequest) => {
    submitReport.mutate(data);
  };

  const handleToggleAttendee = (userId: string) => {
    const current = attendeesValue[userId] ?? false;
    setValue("attendees", { ...attendeesValue, [userId]: !current });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  return (
    <div
      className="rounded-[20px] bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
      style={{
        fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-purple/10">
          <FileText className="h-4 w-4 text-brand-purple" />
        </div>
        <h3 className="text-[15px] font-bold text-foreground">
          Meeting Report
        </h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Report text */}
        <div className="space-y-2">
          <Label
            htmlFor="report"
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            Report
          </Label>
          <Textarea
            id="report"
            placeholder="Describe what was discussed..."
            rows={4}
            {...register("report")}
            className="resize-none rounded-xl border-border bg-muted/50 shadow-none transition-colors focus:border-primary/30 focus:bg-card"
          />
          {errors.report && (
            <p className="text-xs font-medium text-destructive">
              {errors.report.message}
            </p>
          )}
        </div>

        {/* Attendee Checkboxes */}
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Attendees
          </Label>
          <div className="max-h-[240px] overflow-y-auto space-y-1 rounded-xl bg-muted/50 p-3">
            {attendees.map((attendee) => {
              const isChecked = attendeesValue[attendee.user_id] ?? false;
              const colorClass = getColor(attendee.full_name);
              return (
                <label
                  key={attendee.user_id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                    isChecked ? "bg-primary/5" : "hover:bg-card"
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors ${
                      isChecked
                        ? "bg-primary text-primary-foreground"
                        : "border-2 border-border bg-card"
                    }`}
                  >
                    {isChecked && <Check className="h-3 w-3" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleAttendee(attendee.user_id)}
                    className="sr-only"
                  />
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${colorClass}`}
                  >
                    {attendee.full_name.charAt(0)}
                  </div>
                  <span className="text-[13px] font-semibold text-foreground">
                    {attendee.full_name}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-border pt-5">
          {existingReport?.is_report_submitted && (
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-2.5 text-[13px] font-bold text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-50"
              onClick={() => deleteReport.mutate()}
              disabled={deleteReport.isPending}
            >
              {deleteReport.isPending ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Delete Report
            </button>
          )}
          <button
            type="submit"
            disabled={submitReport.isPending}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-[13px] font-bold text-primary-foreground shadow-[0_4px_12px_rgba(79,70,229,0.3)] transition-all hover:bg-primary/90 hover:scale-[1.01] disabled:opacity-50"
          >
            {submitReport.isPending && <Spinner className="h-4 w-4" />}
            {existingReport?.is_report_submitted
              ? "Update Report"
              : "Submit Report"}
          </button>
        </div>
      </form>
    </div>
  );
}
