/**
 * Attendee Report View
 *
 * Lets joined attendees submit and view their own meeting report.
 */

"use client";

import { ClipboardList, ExternalLink, FileText, Send } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useAttendeeReport, useSubmitAttendeeReport } from "../hooks";

interface AttendeeReportViewProps {
  meetingId: string;
}

export function AttendeeReportView({ meetingId }: AttendeeReportViewProps) {
  const { data: report, isLoading } = useAttendeeReport(meetingId);
  const submitReport = useSubmitAttendeeReport(meetingId);
  const [reportText, setReportText] = useState("");
  const [reportLink, setReportLink] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedReport = reportText.trim();
    const trimmedLink = reportLink.trim();

    if (!trimmedReport && !trimmedLink) {
      setFormError("Add a short report or paste a report link.");
      return;
    }

    setFormError(null);
    submitReport.mutate({
      report: trimmedReport || undefined,
      report_link: trimmedLink || undefined,
    });
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
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-warning/10">
          <ClipboardList className="h-4 w-4 text-warning" />
        </div>
        <h3 className="text-[15px] font-bold text-foreground">
          Attendee Report
        </h3>
      </div>

      {!report ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Submit your attendee report first. The organizer can include you
              in the final meeting report only after this is submitted.
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="attendee-report"
              className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >
              Report
            </Label>
            <Textarea
              id="attendee-report"
              value={reportText}
              onChange={(event) => setReportText(event.target.value)}
              placeholder="Share what you learned or contributed..."
              rows={4}
              className="resize-none rounded-xl border-border bg-muted/50 shadow-none transition-colors focus:border-primary/30 focus:bg-card"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="attendee-report-link"
              className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >
              Report Link
            </Label>
            <Input
              id="attendee-report-link"
              value={reportLink}
              onChange={(event) => setReportLink(event.target.value)}
              placeholder="https://..."
              className="rounded-xl border-border bg-muted/50 shadow-none transition-colors focus:border-primary/30 focus:bg-card"
            />
          </div>

          {formError && (
            <p className="text-xs font-medium text-destructive">{formError}</p>
          )}

          <div className="flex justify-end border-t border-border pt-4">
            <Button
              type="submit"
              disabled={submitReport.isPending}
              className="gap-2 rounded-xl px-5 text-[13px] font-bold"
            >
              {submitReport.isPending ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Submit Attendee Report
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {report.report && (
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Report
              </p>
              <p className="text-[13px] leading-relaxed text-foreground">
                {report.report}
              </p>
            </div>
          )}
          {report.report_link && (
            <a
              href={report.report_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-[13px] font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View Report Link
            </a>
          )}
          {!report.report && !report.report_link && (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-muted py-10">
              <FileText className="mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-[13px] font-medium text-muted-foreground">
                No report details available
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
