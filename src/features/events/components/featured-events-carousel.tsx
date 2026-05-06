"use client";

import { CalendarDays, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FEATURED_SLIDE_INTERVAL } from "../constants";
import { formatEventDate, useFeaturedEvents } from "../hooks";
import { InterestButton } from "./interest-button";

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
    timerRef.current = setTimeout(goNext, FEATURED_SLIDE_INTERVAL);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [paused, featuredEvents.length, goNext]);

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-2xl md:h-56" />;
  }

  if (featuredEvents.length === 0) return null;

  const event = featuredEvents[activeIndex];
  return (
    <section
      aria-label="Featured events carousel"
      className="group relative h-48 w-full overflow-hidden rounded-2xl shadow-sm md:h-56 lc-slide-up"
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
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

      <Link
        aria-label={`Open ${event.title}`}
        href={`/dashboard/events/${event.id}`}
        className="absolute inset-0 z-[15]"
      />

      {/* Content overlay */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-4 text-white sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-2">
            {/* Title */}
            <Link
              href={`/dashboard/events/${event.id}`}
              className="relative z-20"
            >
              <h2 className="line-clamp-1 text-lg font-bold tracking-tight drop-shadow sm:text-xl hover:underline underline-offset-2 text-white">
                {event.title}
              </h2>
            </Link>

            {/* Frosted glass info pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-3 py-1 text-xs text-white/90">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>{formatEventDate(event.start_datetime)}</span>
              <span>|</span>
              <MapPin className="h-3.5 w-3.5" />
              <span>{event.venue_city ?? "Venue TBA"}</span>
            </div>
          </div>

          <div className="relative z-20 shrink-0">
            <InterestButton
              eventId={event.id}
              status={event.viewer_interest_status}
              count={event.interest_count}
            />
          </div>
        </div>

        {/* Dots */}
        {featuredEvents.length > 1 ? (
          <div className="relative z-20 mt-4 flex items-center gap-1.5">
            {featuredEvents.map((ev, i) => (
              <button
                key={ev.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? "w-8 bg-primary-foreground"
                    : "w-2 bg-primary-foreground/40 hover:bg-primary-foreground/60"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Prev / Next arrows */}
      {featuredEvents.length > 1 ? (
        <>
          <Button
            type="button"
            variant={"default"}
            aria-label="Previous slide"
            onClick={goPrev}
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 hidden md:flex rounded-full backdrop-blur-sm p-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant={"default"}
            aria-label="Next slide"
            onClick={goNext}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 hidden md:flex rounded-full backdrop-blur-sm p-2"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      ) : null}
    </section>
  );
}
