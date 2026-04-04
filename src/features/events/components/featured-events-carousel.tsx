"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveEventTypeValue, useFeaturedEvents } from "../hooks";
import { InterestButton } from "./interest-button";

export function FeaturedEventsCarousel() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { data, isLoading } = useFeaturedEvents({ pageIndex: 1, perPage: 10 });

  const featuredEvents = data?.data ?? [];

  const scrollByAmount = (direction: "left" | "right") => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollBy({
      left: direction === "right" ? 360 : -360,
      behavior: "smooth",
    });
  };

  if (isLoading) {
    return (
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (featuredEvents.length === 0) {
    return null;
  }

  return (
    <section className="group relative mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Featured Events</h2>
      </div>

      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 opacity-0 shadow transition-opacity group-hover:opacity-100"
        onClick={() => scrollByAmount("left")}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 opacity-0 shadow transition-opacity group-hover:opacity-100"
        onClick={() => scrollByAmount("right")}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-1"
      >
        {featuredEvents.map((event) => (
          <article
            key={event.id}
            className="w-[320px] shrink-0 overflow-hidden rounded-xl border bg-card"
          >
            <Link href={`/dashboard/events/${event.id}`} className="block">
              <div className="relative aspect-video">
                {event.cover_image ? (
                  <Image
                    src={event.cover_image}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-pink-500/80 via-orange-500/70 to-yellow-400/70" />
                )}
              </div>
            </Link>

            <div className="space-y-2 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {resolveEventTypeValue(
                  event.event_type,
                  event.category_name,
                )?.replace(/_/g, " ") ?? "Other"}
              </p>
              <h3 className="line-clamp-2 text-base font-semibold">
                {event.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {new Date(event.start_datetime).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <InterestButton
                eventId={event.id}
                status={event.viewer_interest_status}
                count={event.interest_count}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
