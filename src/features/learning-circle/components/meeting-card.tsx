/**
 * Meeting Card Component
 *
 * 📍 src/features/learning-circle/components/meeting-card.tsx
 *
 * Bold card with colored status header, strong visual hierarchy,
 * decorative accents, and vivid action buttons.
 */

"use client";

import { format, isFuture } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { Meeting } from "../schemas";

interface MeetingCardProps {
  meeting: Meeting;
  showCircleLink?: boolean;
  onRsvp?: (meetingId: string) => void;
  isRsvpLoading?: boolean;
}

export function MeetingCard({
  meeting,
  onRsvp,
  isRsvpLoading,
}: MeetingCardProps) {
  const meetTime = new Date(meeting.meet_time);
  const isExpired = meeting.is_ended || !isFuture(meetTime);

  // Choose pill colors based on state
  let pillColor = "bg-indigo-400";
  if (meeting.is_started) pillColor = "bg-emerald-500";
  else if (isExpired) pillColor = "bg-gray-300";
  else if (meeting.is_rsvp) pillColor = "bg-amber-400";

  return (
    <div className="w-full rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col gap-3.5 transition-all hover:border-gray-200">
      {/* ─── Status Pill ─── */}
      <div className="flex items-center justify-between">
        <div className={`h-1.5 w-10 rounded-full ${pillColor}`} />
        {meeting.is_started && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        )}
      </div>

      {/* ─── Title with Checkmark ─── */}
      <div className="flex items-start gap-2.5 mt-1">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-gray-400 mt-0.5" />
        <Link
          href={`/dashboard/learning-circle/${meeting.circle_id}/meeting/${meeting.id}`}
          className="text-[14px] font-semibold text-gray-800 leading-snug hover:text-indigo-600 transition-colors line-clamp-2"
        >
          {meeting.title}
        </Link>
      </div>

      {/* ─── Footer (Avatar + Date) ─── */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700 overflow-hidden shrink-0">
            {meeting.meet_place?.charAt(0) || "M"}
          </div>
          <span className="text-[12px] font-semibold text-gray-600">
            {format(meetTime, "dd MMM - yyyy")}
          </span>
        </div>

        {/* RSVP Action if needed */}
        {onRsvp && !isExpired && !meeting.is_rsvp && !meeting.is_joined && (
          <button
            type="button"
            onClick={() => onRsvp(meeting.id)}
            disabled={isRsvpLoading}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wide bg-indigo-50 px-2 py-1 rounded"
          >
            RSVP
          </button>
        )}
      </div>
    </div>
  );
}
