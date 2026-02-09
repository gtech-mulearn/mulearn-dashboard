"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Event } from "../schemas";

type EventsSliderCardProps = {
  events?: Event[];
  isLoading?: boolean;
};

const placeholderEvents: Event[] = [
  {
    name: "30 Days Coding Challenge",
    description:
      "Complete daily challenges, track your progress, and earn karma points.",
    poster: "/images/dashboard/creative.webp",
    link: "/dashboard/courses",
    date: "Ongoing",
    status: "Active",
  },
  {
    name: "Build with AI Sprint",
    description:
      "Ship a project in 7 days using AI tools and showcase your work.",
    poster: "/images/dashboard/coder.webp",
    link: "/dashboard/courses",
    date: "Starts Soon",
    status: "Active",
  },
  {
    name: "Maker Week",
    description:
      "Hands-on sessions and mini builds focused on hardware and IoT.",
    poster: "/images/dashboard/maker.webp",
    link: "/dashboard/courses",
    date: "This Week",
    status: "Active",
  },
];

export function EventsSliderCard({ events, isLoading }: EventsSliderCardProps) {
  const eventsData = useMemo(() => {
    if (!events || events.length === 0) {
      return placeholderEvents;
    }
    return events.map((event, index) => ({
      ...event,
      poster:
        event.poster && event.poster.trim().length > 0
          ? event.poster
          : placeholderEvents[index % placeholderEvents.length].poster,
    }));
  }, [events]);

  const total = eventsData.length;
  const canSlide = total > 1;
  const [index, setIndex] = useState(0);
  const safeIndex = total === 0 ? 0 : index % total;
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  useEffect(() => {
    if (!canSlide || isPaused) {
      return;
    }
    const id = setInterval(() => {
      setIndex((prev) => {
        if (direction === "forward") {
          if (prev >= total - 1) {
            setDirection("backward");
            return total - 2;
          }
          return prev + 1;
        }
        if (prev <= 0) {
          setDirection("forward");
          return 1;
        }
        return prev - 1;
      });
    }, 2000);
    return () => clearInterval(id);
  }, [canSlide, total, isPaused, direction]);

  const goPrev = () => {
    if (!canSlide) return;
    setIndex((prev) => (prev - 1 + total) % total);
    setDirection("backward");
  };

  const goNext = () => {
    if (!canSlide) return;
    setIndex((prev) => (prev + 1) % total);
    setDirection("forward");
  };

  return (
    <Card className="overflow-hidden rounded-2xl border-none bg-card shadow-sm">
      <CardHeader className="flex-row items-center justify-between border-b border-border/40 px-6 py-4">
        <CardTitle className="text-lg font-bold">Happening Now</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            onClick={goPrev}
            disabled={!canSlide}
            aria-label="Previous event"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            onClick={goNext}
            disabled={!canSlide}
            aria-label="Next event"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <section
          className="relative overflow-hidden rounded-2xl border border-border/40 bg-muted/20"
          aria-label="Events slider"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${safeIndex * 100}%)` }}
          >
            {eventsData.map((event, slideIndex) => (
              <div key={`${event.name}-${slideIndex}`} className="min-w-full">
                <div className="relative h-64 w-full">
                  <Image
                    src={
                      event.poster.startsWith("/")
                        ? event.poster
                        : placeholderEvents[
                            slideIndex % placeholderEvents.length
                          ].poster
                    }
                    alt={event.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    priority={slideIndex === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 space-y-2 p-4 text-white">
                    <p className="text-xs uppercase tracking-wide text-white/80">
                      {event.date}
                    </p>
                    <h3 className="text-lg font-semibold leading-tight">
                      {event.name}
                    </h3>
                    <p className="line-clamp-2 text-sm text-white/90">
                      {event.description}
                    </p>
                    <Button
                      asChild
                      size="sm"
                      className="mt-2 h-8 rounded-full bg-white text-black hover:bg-white/90"
                    >
                      <Link href="/dashboard/courses">Know More</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2">
            {eventsData.map((event, dotIndex) => (
              <button
                key={`${event.name}-${dotIndex}-dot`}
                type="button"
                aria-label={`Go to event ${dotIndex + 1}`}
                className={`h-2 w-2 rounded-full transition-all ${
                  dotIndex === safeIndex ? "bg-white shadow-sm" : "bg-white/40"
                }`}
                onClick={() => setIndex(dotIndex)}
              />
            ))}
          </div>
        </section>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex gap-1">
              <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:-0.3s]" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:-0.15s]" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" />
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
