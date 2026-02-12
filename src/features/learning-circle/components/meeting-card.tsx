/**
 * Meeting Card Component
 *
 * 📍 src/features/learning-circle/components/meeting-card.tsx
 *
 * Meeting card with status badges and actions.
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
import { Calendar, Clock, MapPin, Users, Video } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
    return { label: "Ended", color: "bg-muted text-muted-foreground" };
  }

  // Check if within join window (2 hours before to duration + 2 hours after)
  const joinStart = subHours(meetTime, 2);
  const _joinEnd = addHours(meetTime, (meeting.attendees_count || 2) + 2);

  if (
    meeting.is_started ||
    isWithinInterval(now, { start: joinStart, end: meetTime })
  ) {
    return { label: "Live Now", color: "bg-emerald-100 text-emerald-700" };
  }

  if (isFuture(meetTime)) {
    const distance = formatDistanceToNow(meetTime, { addSuffix: false });
    return { label: `In ${distance}`, color: "bg-blue-100 text-blue-700" };
  }

  return { label: "Scheduled", color: "bg-amber-100 text-amber-700" };
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
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Status Badge */}
      <div className="mb-4 flex items-center justify-between">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${status.color}`}
        >
          {status.label}
        </span>

        {meeting.is_rsvp && !meeting.is_joined && (
          <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700">
            RSVP'd
          </span>
        )}

        {meeting.is_joined && (
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
            Joined ✓
          </span>
        )}
      </div>

      {/* Title */}
      <Link href={`/dashboard/learning-circle/meetings/${meeting.id}`}>
        <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {meeting.title}
        </h3>
      </Link>

      {/* Description */}
      <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
        {meeting.description}
      </p>

      {/* Meta Info */}
      <div className="mb-4 space-y-2">
        {/* Date & Time */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{format(meetTime, "MMM d, yyyy")}</span>
          <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
          <span>{format(meetTime, "h:mm a")}</span>
        </div>

        {/* Location/Mode */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isOnline ? (
            <>
              <Video className="h-4 w-4 text-blue-500" />
              <span className="text-blue-600">{meeting.meet_place}</span>
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4 text-orange-500" />
              <span>{meeting.meet_place}</span>
            </>
          )}
        </div>

        {/* Interest Group */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {meeting.ig_name}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            {meeting.attendees_count}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <span className="text-xs text-muted-foreground">
          by {meeting.created_by}
        </span>

        <div className="flex gap-2">
          {canRsvp && onRsvp && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRsvp(meeting.id)}
              disabled={isRsvpLoading}
              className="text-xs"
            >
              RSVP
            </Button>
          )}

          <Link href={`/dashboard/learning-circle/meetings/${meeting.id}`}>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-xs"
            >
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
