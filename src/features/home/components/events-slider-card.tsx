"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
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
    }, 4000);
    return () => clearInterval(id);
  }, [canSlide, total, isPaused, direction]);

  return (
    <Card
      className="group relative h-full min-h-[400px] w-full overflow-hidden rounded-[2rem] border-0 bg-muted/20 shadow-xl ring-1 ring-border/50 transition-all hover:shadow-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Slider */}
      <div className="absolute inset-0 z-0">
        <div
          className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{ transform: `translateX(-${safeIndex * 100}%)` }}
        >
          {eventsData.map((event, slideIndex) => (
            <div
              key={`${event.name}-${slideIndex}`}
              className="h-full min-w-full relative"
            >
              <Image
                src={
                  event.poster.startsWith("/")
                    ? event.poster
                    : placeholderEvents[slideIndex % placeholderEvents.length]
                        .poster
                }
                alt={event.name}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 33vw"
                priority={slideIndex === 0}
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-foreground via-foreground/40 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-80" />
            </div>
          ))}
        </div>
      </div>

      {/* Top Header & Controls */}
      <div className="absolute left-0 top-0 z-10 flex w-full items-center justify-between p-6">
        <div className="rounded-full bg-background/10 px-4 py-1.5 backdrop-blur-md ring-1 ring-background/20">
          <span className="text-xs font-bold uppercase tracking-wider text-background drop-shadow-sm">
            Happening Now
          </span>
        </div>
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 z-10 w-full p-8 text-background">
        <div className="flex flex-col gap-4 transition-transform duration-500 group-hover:-translate-y-2">
          <div className="flex transition-opacity duration-500" key={safeIndex}>
            <div className="space-y-3">
              <span className="inline-flex items-center rounded-lg bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm backdrop-blur-sm">
                {eventsData[safeIndex].date}
              </span>

              <h2 className="text-3xl font-bold leading-none tracking-tight text-background drop-shadow-md md:text-4xl">
                {eventsData[safeIndex].name}
              </h2>

              <p className="line-clamp-2 max-w-[90%] text-sm font-medium leading-relaxed text-background/80 drop-shadow-sm md:text-base">
                {eventsData[safeIndex].description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              asChild
              size="lg"
              className="group/btn h-12 rounded-full bg-background px-6 text-base font-semibold text-foreground shadow-lg transition-all hover:bg-background/90 hover:shadow-xl hover:scale-105"
            >
              <Link
                href={eventsData[safeIndex].link}
                className="flex items-center gap-2"
              >
                Explore Event
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              </Link>
            </Button>

            {/* Pagination Dots */}
            <div className="flex gap-1.5">
              {eventsData.map((event, dotIndex) => (
                <button
                  key={`${event.name}-${event.date}-${event.link}`}
                  type="button"
                  onClick={() => setIndex(dotIndex)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    dotIndex === safeIndex
                      ? "w-8 bg-background shadow-[0_0_10px_color-mix(in_oklab,var(--background)_50%,transparent)]"
                      : "w-1.5 bg-background/30 hover:bg-background/50",
                  )}
                  aria-label={`Go to slide ${dotIndex + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="flex gap-1">
            <div className="h-2 w-2 animate-bounce rounded-full bg-foreground [animation-delay:-0.3s]" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-foreground [animation-delay:-0.15s]" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-foreground" />
          </div>
        </div>
      )}
    </Card>
  );
}
