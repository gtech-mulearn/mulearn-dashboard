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
import { Check, CheckCircle2, Loader2, X } from "lucide-react";
import Link from "next/link";
import type { Meeting } from "../schemas";

interface MeetingCardProps {
  meeting: Meeting;
  showCircleLink?: boolean;
  onRsvp?: (meetingId: string) => void;
  onRemoveRsvp?: (meetingId: string) => void;
  onCancelRsvp?: (meetingId: string) => void;
  isRsvpLoading?: boolean;
}

export function MeetingCard({
  meeting,
  onRsvp,
  onRemoveRsvp,
  onCancelRsvp,
  isRsvpLoading,
}: MeetingCardProps) {
  const meetTime = new Date(meeting.meet_time);
  const isExpired = meeting.is_ended || !isFuture(meetTime);
  // can_remove_rsvp is provided by CircleMeetupMinSerializer after backend update.
  // undefined means not yet cached / old backend — default to showing the button
  // (backend enforces the 30-min cutoff on DELETE).
  const canRemove = meeting.can_remove_rsvp !== false;

  // Choose pill colors based on state
  let pillColor = "bg-primary";
  if (meeting.is_started) pillColor = "bg-success";
  else if (isExpired) pillColor = "bg-muted-foreground/30";
  else if (meeting.is_rsvp) pillColor = "bg-warning";

  return (
    <div className="group relative w-full rounded-2xl bg-card p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-border flex flex-col gap-3.5 transition-all hover:border-primary/30 hover:shadow-sm">
      {/* ─── Status Pill ─── */}
      <div className="flex items-center justify-between">
        <div className={`h-1.5 w-10 rounded-full ${pillColor}`} />
        {meeting.is_started && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
        )}
      </div>

      {/* ─── Title with Checkmark ─── */}
      <div className="flex items-start gap-2.5 mt-1">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
        <Link
          href={`/dashboard/learning-circle/${meeting.circle_id}/meeting/${meeting.id}`}
          className="text-[14px] font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2 before:absolute before:inset-0"
        >
          {meeting.title}
        </Link>
      </div>

      {/* ─── Footer (Avatar + Date + RSVP Actions) ─── */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-brand-purple/10 text-[10px] font-bold text-brand-purple overflow-hidden shrink-0">
            {meeting.meet_place?.charAt(0) || "M"}
          </div>
          <span className="text-[12px] font-semibold text-muted-foreground">
            {format(meetTime, "dd MMM - yyyy")}
          </span>
        </div>

        {/* RSVP / Change RSVP Actions */}
        {!isExpired &&
          !meeting.is_joined &&
          (meeting.is_rsvp ? (
            canRemove ? (
              <button
                type="button"
                onClick={() =>
                  onRemoveRsvp
                    ? onRemoveRsvp(meeting.id)
                    : onCancelRsvp
                      ? onCancelRsvp(meeting.id)
                      : onRsvp?.(meeting.id)
                }
                disabled={isRsvpLoading}
                className="relative z-10 text-[11px] font-bold text-success bg-success/15 border border-success/30 hover:bg-destructive/15 hover:text-destructive hover:border-destructive/30 transition-all uppercase tracking-wide px-2.5 py-1 rounded flex items-center gap-1 group/rsvp cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Click to remove RSVP"
              >
                {isRsvpLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <Check className="h-3 w-3 group-hover/rsvp:hidden text-success" />
                    <X className="h-3 w-3 hidden group-hover/rsvp:inline text-destructive" />
                  </>
                )}
                <span className="group-hover/rsvp:hidden">RSVP'd</span>
                <span className="hidden group-hover/rsvp:inline">
                  Remove RSVP
                </span>
              </button>
            ) : (
              <span className="relative z-10 text-[11px] font-bold text-success bg-success/15 border border-success/30 px-2.5 py-1 rounded flex items-center gap-1">
                <Check className="h-3 w-3 text-success" />
                <span>RSVP'd</span>
              </span>
            )
          ) : onRsvp ? (
            <button
              type="button"
              onClick={() => onRsvp(meeting.id)}
              disabled={isRsvpLoading}
              className="relative z-10 text-[11px] font-bold text-foreground bg-muted hover:bg-primary hover:text-primary-foreground border border-border hover:border-primary transition-all uppercase tracking-wide px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="RSVP to meeting"
            >
              {isRsvpLoading && <Loader2 className="h-3 w-3 animate-spin" />}
              <span>RSVP</span>
            </button>
          ) : null)}
      </div>
    </div>
  );
}
