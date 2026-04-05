"use client";

import { CalendarDays, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveEventTypeValue, useFeaturedEvents } from "../hooks";
import { InterestButton } from "./interest-button";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getOrganizerName(organizer: {
  type: string;
  ig?: { name?: string } | null;
  campus?: { title?: string; name?: string } | null;
  company?: { title?: string; name?: string } | null;
  campus_ig?: { name?: string } | null;
}): string {
  if (organizer.type === "global_ig") return organizer.ig?.name ?? "Global IG";
  if (organizer.type === "campus_ig") {
    const ig = organizer.ig?.name;
    const campus = organizer.campus?.title ?? organizer.campus?.name;
    if (ig && campus) return `${ig} @ ${campus}`;
    return organizer.campus_ig?.name ?? "Campus IG";
  }
  if (organizer.type === "campus")
    return organizer.campus?.title ?? organizer.campus?.name ?? "Campus";
  if (organizer.type === "company")
    return organizer.company?.title ?? organizer.company?.name ?? "Company";
  return "MuLearn";
}

const SLIDE_INTERVAL = 5000;

export function FeaturedEventsCarousel() {
  const { data, isLoading } = useFeaturedEvents({ pageIndex: 1, perPage: 10 });
  const featuredEvents = data?.data ?? [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(
        ((index % featuredEvents.length) + featuredEvents.length) %
          featuredEvents.length,
      );
    },
    [featuredEvents.length],
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (paused || featuredEvents.length <= 1) return;
    timerRef.current = setTimeout(goNext, SLIDE_INTERVAL);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [paused, featuredEvents.length, goNext]);

  if (isLoading) {
    return <Skeleton className="mb-8 h-85 w-full rounded-2xl sm:h-100" />;
  }

  if (featuredEvents.length === 0) return null;

  const event = featuredEvents[activeIndex];
  const eventType = resolveEventTypeValue(
    event.event_type,
    event.category_name,
  );
  const organizerName = getOrganizerName(event.organizer);

  return (
    <section
      aria-label="Featured events carousel"
      className="group relative mb-8 w-full overflow-hidden rounded-2xl shadow-md"
      style={{ aspectRatio: "16/6" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {featuredEvents.map((ev, i) => (
        <div
          key={ev.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: i === activeIndex ? 1 : 0,
            zIndex: i === activeIndex ? 1 : 0,
          }}
          aria-hidden={i !== activeIndex}
        >
          <Image
            src={ev.cover_image ?? "/images/fallback.webp"}
            alt={ev.title}
            fill
            className="object-cover"
            priority={i === 0}
          />
        </div>
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-10 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

      {/* Content overlay */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-5 text-white sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-2">
            {eventType ? (
              <Badge className="bg-white/20 text-white capitalize backdrop-blur-sm">
                {eventType.replace(/_/g, " ")}
              </Badge>
            ) : null}

            <Link href={`/dashboard/events/${event.id}`}>
              <h2 className="line-clamp-2 text-xl font-bold tracking-tight drop-shadow sm:text-2xl hover:underline underline-offset-2">
                {event.title}
              </h2>
            </Link>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/85">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDate(event.start_datetime)}
              </span>
              {event.venue_city ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {event.venue_city}
                </span>
              ) : null}
              <span className="text-white/70">By {organizerName}</span>
            </div>
          </div>

          <div className="shrink-0">
            <InterestButton
              eventId={event.id}
              status={event.viewer_interest_status}
              count={event.interest_count}
            />
          </div>
        </div>

        {/* Dots */}
        {featuredEvents.length > 1 ? (
          <div className="mt-4 flex items-center gap-1.5">
            {featuredEvents.map((ev, i) => (
              <button
                key={ev.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? "w-6 bg-white"
                    : "w-1.5 bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Prev / Next arrows */}
      {featuredEvents.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={goPrev}
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={goNext}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      ) : null}
    </section>
  );
}
