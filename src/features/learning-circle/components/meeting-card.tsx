/**
 * Meeting Card Component
 *
 * 📍 src/features/learning-circle/components/meeting-card.tsx
 *
 * Bold card with colored status header, strong visual hierarchy,
 * decorative accents, and vivid action buttons.
 */

"use client";

import {
  addHours,
  format,
  formatDistanceToNow,
  isFuture,
  isWithinInterval,
  subHours,
} from "date-fns";
import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";
import type { Meeting } from "../schemas";

interface MeetingCardProps {
  meeting: Meeting;
  showCircleLink?: boolean;
  onRsvp?: (meetingId: string) => void;
  isRsvpLoading?: boolean;
}

function getMeetingStatus(meeting: Meeting) {
  const meetTime = new Date(meeting.meet_time);
  const now = new Date();

  if (meeting.is_ended) {
    return {
      label: "Ended",
      headerGradient: "from-[#9CA3AF] to-[#6B7280]",
      barColor: "bg-[#D1D5DB]",
      dot: false,
    };
  }

  const joinStart = subHours(meetTime, 2);
  const _joinEnd = addHours(meetTime, (meeting.attendees_count || 2) + 2);

  if (
    meeting.is_started ||
    isWithinInterval(now, { start: joinStart, end: meetTime })
  ) {
    return {
      label: "Live Now",
      headerGradient: "from-[#34D399] to-[#10B981]",
      barColor: "bg-[#10B981]",
      dot: true,
    };
  }

  if (isFuture(meetTime)) {
    const distance = formatDistanceToNow(meetTime, { addSuffix: false });
    return {
      label: `In ${distance}`,
      headerGradient: "from-[#818CF8] to-[#6366F1]",
      barColor: "bg-[#6366F1]",
      dot: false,
    };
  }

  return {
    label: "Scheduled",
    headerGradient: "from-[#FCD34D] to-[#F59E0B]",
    barColor: "bg-[#F59E0B]",
    dot: false,
  };
}

export function MeetingCard({
  meeting,
  onRsvp,
  isRsvpLoading,
}: MeetingCardProps) {
  const meetTime = new Date(meeting.meet_time);
  const status = getMeetingStatus(meeting);
  const isOnline = meeting.mode === "online";
  const canRsvp =
    !meeting.is_ended &&
    !meeting.is_rsvp &&
    !meeting.is_joined &&
    isFuture(meetTime);

  return (
    <div
      className="group overflow-hidden rounded-[20px] bg-white
        shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_1px_rgba(0,0,0,0.04)]
        transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)]
        hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)]"
      style={{
        fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
        fontFeatureSettings: "'cv02', 'cv03', 'cv04'",
      }}
    >
      {/* ─── Colored status header ─── */}
      <div
        className={`relative overflow-hidden bg-gradient-to-r ${status.headerGradient} px-5 py-3`}
      >
        {/* Decorative blob */}
        <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/[0.08] blur-sm" />
        <div className="relative z-10 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-white">
            {status.dot && (
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-white" />
            )}
            {!status.dot && <Clock className="h-3 w-3 text-white/70" />}
            {status.label}
          </span>

          <div className="flex gap-1.5">
            {meeting.is_rsvp && !meeting.is_joined && (
              <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                RSVP'd
              </span>
            )}
            {meeting.is_joined && (
              <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                Joined ✓
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ─── Body ─── */}
      <div className="p-5">
        {/* Title */}
        <Link
          href={`/dashboard/learning-circle/${meeting.circle_id}/meeting/${meeting.id}`}
        >
          <h3 className="text-[17px] font-bold leading-snug tracking-[-0.01em] text-[#111827] transition-colors duration-200 group-hover:text-[#4F46E5] line-clamp-2">
            {meeting.title}
          </h3>
        </Link>

        {meeting.description && (
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#6B7280] line-clamp-2">
            {meeting.description}
          </p>
        )}

        {/* Meta — visual hierarchy with colored icons */}
        <div className="mt-4 space-y-2.5">
          <div className="flex items-center gap-3 text-[13px]">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EEF2FF]">
              <Calendar className="h-4 w-4 text-[#4F46E5]" />
            </div>
            <div>
              <p className="font-bold text-[#111827]">
                {format(meetTime, "MMM d, yyyy")}
              </p>
              <p className="text-[11px] text-[#9CA3AF]">
                {format(meetTime, "h:mm a")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[13px]">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl ${isOnline ? "bg-[#F0FDFA]" : "bg-[#FFF7ED]"}`}
            >
              {isOnline ? (
                <Video className="h-4 w-4 text-[#0D9488]" />
              ) : (
                <MapPin className="h-4 w-4 text-[#EA580C]" />
              )}
            </div>
            <p
              className={`truncate font-semibold ${isOnline ? "text-[#0D9488]" : "text-[#111827]"}`}
            >
              {meeting.meet_place}
            </p>
          </div>
        </div>

        {/* Tags row */}
        <div className="mt-4 flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-semibold text-[#374151]">
            {meeting.ig_name}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2 py-1 text-[11px] font-semibold text-[#6B7280]">
            <Users className="h-3 w-3" />
            {meeting.attendees_count}
          </span>
        </div>

        {/* ─── Color bar + actions ─── */}
        <div className="mt-5 flex items-center justify-between">
          {/* Progress-style color bar */}
          <div className="flex items-center gap-2">
            <div className={`h-1.5 w-12 rounded-full ${status.barColor}`} />
            <span className="text-[11px] text-[#9CA3AF]">
              by{" "}
              <span className="font-semibold text-[#6B7280]">
                {meeting.created_by}
              </span>
            </span>
          </div>

          <div className="flex gap-2">
            {canRsvp && onRsvp && (
              <button
                type="button"
                onClick={() => onRsvp(meeting.id)}
                disabled={isRsvpLoading}
                className="h-8 rounded-xl border-[1.5px] border-[#4F46E5] px-4 text-[12px] font-bold text-[#4F46E5]
                  transition-all duration-150 hover:bg-[#4F46E5] hover:text-white active:scale-[0.97] disabled:opacity-50"
              >
                RSVP
              </button>
            )}

            <Link
              href={`/dashboard/learning-circle/${meeting.circle_id}/meeting/${meeting.id}`}
            >
              <button
                type="button"
                className="flex h-8 items-center gap-1.5 rounded-xl bg-[#111827] px-4 text-[12px] font-bold text-white
                  transition-all duration-150 hover:bg-[#1F2937] active:scale-[0.97]"
              >
                Details
                <ArrowRight className="h-3 w-3" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
