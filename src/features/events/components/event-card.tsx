"use client";

import { Lock, MapPin } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { resolveEventTypeValue } from "../hooks";
import type { EventListItem, OrganizerInfo } from "../types";
import { EventStatusBadge } from "./event-status-badge";
import { EventTypeBadge } from "./event-type-badge";
import { InterestButton } from "./interest-button";

interface EventCardProps {
  event: EventListItem;
  isManageView?: boolean;
  onDelete?: () => void;
  onEdit?: (event: EventListItem) => void;
  onView?: (event: EventListItem) => void;
}

function getOrganizerName(organizer: OrganizerInfo): string {
  if (organizer.type === "global_ig") {
    return organizer.ig?.name ?? "Global IG";
  }
  if (organizer.type === "campus_ig") {
    const igName = organizer.ig?.name;
    const campusName = organizer.campus?.title ?? organizer.campus?.name;
    if (igName && campusName) {
      return `${igName} @ ${campusName}`;
    }
    return organizer.campus_ig?.name ?? "Campus IG";
  }
  if (organizer.type === "campus") {
    return organizer.campus?.title ?? organizer.campus?.name ?? "Campus";
  }
  if (organizer.type === "company") {
    return organizer.company?.title ?? organizer.company?.name ?? "Company";
  }
  if (organizer.type === "admin") {
    return "MuLearn";
  }
  return "MuLearn";
}

export function EventCard({ event, isManageView, onView }: EventCardProps) {
  const formattedDate = new Date(event.start_datetime).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );

  const venueDisplay =
    event.venue_type === "online"
      ? "Online Event"
      : event.venue_city
        ? event.venue_city
        : "Venue TBA";

  const isEnded = new Date(event.end_datetime).getTime() < Date.now();

  return (
    <article className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card lc-card-shadow transition-all duration-300 hover:-translate-y-1 lc-card-shadow-hover cursor-pointer lc-slide-up">
      {onView ? (
        <button
          type="button"
          className="absolute inset-0 z-20 cursor-pointer"
          onClick={() => onView(event)}
          aria-label="View event details"
        />
      ) : null}

      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src={event.cover_image ?? "/images/fallback.webp"}
          alt={event.title}
          fill
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/45 to-transparent" />

        <div className="absolute inset-0 bg-foreground/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute left-3 top-3 z-30">
          <EventTypeBadge
            eventType={resolveEventTypeValue(
              event.event_type,
              event.category_name,
            )}
          />
        </div>

        {isManageView ? (
          <div className="absolute right-3 top-3 z-30">
            <EventStatusBadge status={event.status} />
          </div>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 z-30 p-4 text-primary-foreground">
          <p className="text-[11px] opacity-80">{formattedDate}</p>
          <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-tight">
            {event.title}
          </h3>
          <p className="mt-1 text-xs opacity-85">
            By {getOrganizerName(event.organizer)}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs opacity-85">
            <MapPin className="h-3.5 w-3.5" />
            <span>{venueDisplay}</span>
          </p>

          <div className="mt-3 flex items-center justify-between gap-2">
            {isManageView ? (
              <div className="flex items-center gap-2 text-xs opacity-90">
                <span>{event.interest_count} interested</span>
                {event.is_collaboration ? (
                  <Badge
                    variant="outline"
                    className="border-primary-foreground/35 bg-primary-foreground/10 text-primary-foreground"
                  >
                    Collab
                  </Badge>
                ) : null}
              </div>
            ) : isEnded ? (
              <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium text-primary-foreground/80 backdrop-blur-sm">
                Event Ended
              </span>
            ) : (
              <div className="relative z-40">
                <InterestButton
                  eventId={event.id}
                  status={event.viewer_interest_status}
                  count={event.interest_count}
                />
              </div>
            )}

            {event.min_karma != null && !isEnded ? (
              <div className="flex items-center gap-1 rounded-md bg-primary-foreground/15 px-2 py-1 text-xs backdrop-blur-sm">
                <Lock className="h-3 w-3" />
                <span>{event.min_karma.toLocaleString()}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
