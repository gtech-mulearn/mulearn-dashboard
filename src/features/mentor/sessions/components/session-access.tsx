"use client";

import { MapPin, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

/**
 * Location URL for an offline venue. Mentors are asked to paste a Google Maps
 * link, so if the venue is already a URL we open it directly; otherwise we fall
 * back to a Maps search on the free-text value (older/plain-text venues).
 */
export function buildMapsUrl(venue: string): string {
  const v = venue.trim();
  return isHttpUrl(v)
    ? v
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v)}`;
}

/**
 * Human-readable venue label for cards. Hides raw URLs (a pasted Maps link) so
 * the card shows the "View location" button instead of a long link string.
 */
export function venueDisplay(venue?: string | null): string | null {
  const v = venue?.trim();
  if (!v) return null;
  return isHttpUrl(v) ? null : v;
}

/**
 * Resolve the "how do I attend" links for a session:
 * online/hybrid → meeting link, offline/hybrid → venue map link.
 */
export function getSessionAccess(
  mode?: string | null,
  meetingLink?: string | null,
  venue?: string | null,
): { meetingUrl: string | null; mapUrl: string | null } {
  const m = (mode ?? "").toUpperCase();
  const link = meetingLink?.trim();
  const v = venue?.trim();
  const isOnline = m === "ONLINE" || m === "HYBRID";
  const isOffline = m === "OFFLINE" || m === "HYBRID";
  return {
    meetingUrl: isOnline && link ? link : null,
    mapUrl: isOffline && v ? buildMapsUrl(v) : null,
  };
}

function openExternal(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Card-style access buttons: "Join meeting" for online sessions, "View
 * location" for offline ones (both can show for hybrid). Renders nothing when
 * neither a meeting link nor a venue is available.
 */
export function SessionAccessButtons({
  mode,
  meetingLink,
  venue,
  className,
}: {
  mode?: string | null;
  meetingLink?: string | null;
  venue?: string | null;
  className?: string;
}) {
  const { meetingUrl, mapUrl } = getSessionAccess(mode, meetingLink, venue);
  if (!meetingUrl && !mapUrl) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {meetingUrl && (
        <Button
          type="button"
          size="sm"
          className="flex-1"
          onClick={() => openExternal(meetingUrl)}
        >
          <Video className="mr-1.5 size-4" />
          Join meeting
        </Button>
      )}
      {mapUrl && (
        <Button
          type="button"
          size="sm"
          variant={meetingUrl ? "outline" : "default"}
          className="flex-1"
          onClick={() => openExternal(mapUrl)}
        >
          <MapPin className="mr-1.5 size-4" />
          View location
        </Button>
      )}
    </div>
  );
}
