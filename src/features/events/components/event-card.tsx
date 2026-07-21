"use client";

import {
  Award,
  BookOpen,
  Briefcase,
  Code,
  Compass,
  Dribbble,
  Gamepad2,
  Globe,
  Lightbulb,
  Lock,
  type LucideIcon,
  MapPin,
  Megaphone,
  MessagesSquare,
  Mic,
  Presentation,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { resolveEventTypeValue } from "../hooks";
import type { EventListItem, OrganizerInfo } from "../types";
import { EventStatusBadge } from "./event-status-badge";
import { InterestButton } from "./interest-button";

const BADGE_CONFIG: Record<
  string,
  { label: string; icon: LucideIcon; className: string }
> = {
  // Clusters
  coder: { label: "Coder", icon: Code, className: "ig-cat-coder" },
  maker: { label: "Maker", icon: Users, className: "ig-cat-maker" },
  creative: { label: "Creative", icon: Compass, className: "ig-cat-creative" },
  manager: { label: "Manager", icon: Trophy, className: "ig-cat-manager" },
};

const EVENT_TYPE_ICONS: Record<string, LucideIcon> = {
  workshop: BookOpen,
  webinar: Globe,
  hackathon: Code,
  meetup: Users,
  competition: Trophy,
  seminar: Presentation,
  bootcamp: Sparkles,
  conference: Award,
  ideathon: Lightbulb,
  cultural_event: Gamepad2,
  sports_event: Dribbble,
  community_event: Megaphone,
  expo: Briefcase,
  networking_event: MessagesSquare,
  tech_talk: Mic,
  others: Compass,
};

interface EventCardProps {
  event: EventListItem;
  isManageView?: boolean;
  onDelete?: () => void;
  onEdit?: (event: EventListItem) => void;
  onView?: (event: EventListItem) => void;
}

function getOrganizerName(organizer: OrganizerInfo): string {
  if (!organizer) return "µLearn";

  const type = organizer.type ?? organizer.organiser_type;

  if (type === "global_ig") {
    const igName = organizer.ig?.name ?? organizer.organiser_ig?.name;
    return igName ?? "Global IG";
  }
  if (type === "campus_ig") {
    const igName = organizer.ig?.name ?? organizer.organiser_ig?.name;
    const campusInfo = organizer.campus ?? organizer.organiser_campus;
    const campusName = campusInfo?.title ?? campusInfo?.name;

    if (igName && campusName) {
      return `${igName} @ ${campusName}`;
    }
    return organizer.campus_ig?.name ?? "Campus IG";
  }
  if (type === "campus") {
    const campusInfo = organizer.campus ?? organizer.organiser_campus;
    return campusInfo?.title ?? campusInfo?.name ?? "Campus";
  }
  if (type === "company") {
    const companyInfo = organizer.company ?? organizer.organiser_company;
    return companyInfo?.title ?? companyInfo?.name ?? "Company";
  }
  if (type === "admin") {
    return "µLearn";
  }
  return "µLearn";
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

  // ── Cluster / event_scope ────────────────────────────────────────────────
  // Priority: event.event_scope (direct API field) → organiser_ig cluster →
  // organiser_ig category (older fallback).
  const rawCluster =
    event.event_scope ||
    event.organizer?.ig?.cluster ||
    event.organizer?.organiser_ig?.cluster ||
    event.organizer?.ig?.category ||
    event.organizer?.organiser_ig?.category;

  const cluster = rawCluster?.toLowerCase() ?? null;
  const clusterBadge = cluster ? BADGE_CONFIG[cluster] : null;

  // ── Event type ────────────────────────────────────────────────────────────
  // category_name is the human-readable label (e.g. "Sprint", "Workshop").
  // event_type is the slug (e.g. "others", "hackathon").
  // resolveEventTypeValue normalises both into a canonical slug for icon lookup.
  const eventTypeSlug = resolveEventTypeValue(
    event.event_type,
    event.category_name,
  );
  const eventTypeLabel = event.category_name || event.event_type || null;
  const EventTypeIcon =
    eventTypeSlug && eventTypeSlug !== "others"
      ? (EVENT_TYPE_ICONS[eventTypeSlug] ?? Compass)
      : null;

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

        {/* Top-left stickers: event type + cluster */}
        <div className="absolute left-3 top-3 z-30 flex flex-col gap-1.5 pointer-events-none">
          {EventTypeIcon && eventTypeLabel && (
            <Badge className="bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue border border-brand-blue/20 dark:border-brand-blue/30 hover:bg-brand-blue/20 font-semibold gap-1 text-[11px] px-2.5 py-0.5 rounded-full shadow-sm w-fit">
              <EventTypeIcon className="h-3 w-3 shrink-0" />
              {eventTypeLabel}
            </Badge>
          )}
          {clusterBadge && (
            <Badge
              className={`${clusterBadge.className} font-medium gap-1 text-[11px] px-2.5 py-0.5 rounded-full shadow-sm w-fit`}
            >
              <clusterBadge.icon className="h-3 w-3 shrink-0" />
              {clusterBadge.label}
            </Badge>
          )}
        </div>

        {isManageView ? (
          <div className="absolute right-3 top-3 z-30 pointer-events-none">
            <EventStatusBadge status={event.status} />
          </div>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 z-30 p-4 text-primary-foreground pointer-events-none">
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
                  <Badge variant="outline">Collab</Badge>
                ) : null}
              </div>
            ) : isEnded ? (
              <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium text-primary-foreground/80 backdrop-blur-sm">
                Event Ended
              </span>
            ) : (
              <div className="relative z-40 pointer-events-auto">
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
