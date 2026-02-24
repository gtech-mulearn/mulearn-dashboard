/**
 * Attendee Report View
 *
 * 📍 src/features/learning-circle/components/attendee-report-view.tsx
 *
 * Displays attendee reports with submit/view. Owner or Lead only.
 */

"use client";

import { ClipboardList, ExternalLink, FileText } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useAttendeeReport } from "../hooks";

interface AttendeeReportViewProps {
  meetingId: string;
}

export function AttendeeReportView({ meetingId }: AttendeeReportViewProps) {
  const { data: report, isLoading } = useAttendeeReport(meetingId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  return (
    <div
      className="rounded-[20px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
      style={{
        fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FEF3C7]">
          <ClipboardList className="h-4 w-4 text-[#D97706]" />
        </div>
        <h3 className="text-[15px] font-bold text-[#111827]">
          Attendee Report
        </h3>
      </div>

      {!report ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-[#F9FAFB] py-10">
          <FileText className="mb-2 h-8 w-8 text-[#D1D5DB]" />
          <p className="text-[13px] font-medium text-[#9CA3AF]">
            No report submitted yet
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {report.report && (
            <div className="rounded-xl bg-[#FAFBFC] p-4">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">
                Report
              </p>
              <p className="text-[13px] leading-relaxed text-[#374151]">
                {report.report}
              </p>
            </div>
          )}
          {report.report_link && (
            <a
              href={report.report_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#EEF2FF] px-4 py-2.5 text-[13px] font-semibold text-[#4F46E5] transition-colors hover:bg-[#E0E7FF]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View Report Link
            </a>
          )}
        </div>
      )}
    </div>
  );
}
