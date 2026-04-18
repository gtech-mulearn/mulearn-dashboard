"use client";

import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatEventDate, useFeaturedEvents } from "@/features/events/hooks";
import { cn } from "@/lib/utils";

export function EventsSliderCard() {
  const { data, isLoading } = useFeaturedEvents({ pageIndex: 1, perPage: 10 });
  const events = data?.data ?? [];
  const eventsData = useMemo(() => {
    if (!events || events.length === 0) {
      return [];
    }
    return events.map((event) => ({
      ...event,
      cover_image: event.cover_image ?? "/images/fallback.webp",
      formattedDate: formatEventDate(event.start_datetime),
    }));
  }, [events]);

  const total = eventsData.length;
  const canSlide = total > 1;
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const currentEvent = eventsData[index];

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

  const goTo = (i: number) => {
    setIndex(((i % total) + total) % total);
  };
  const goNext = () => goTo(index + 1);
  const goPrev = () => goTo(index - 1);

  if (total === 0 || !currentEvent) {
    return null;
  }

  if (isLoading) {
    return <Skeleton className="mb-8 h-85 w-full rounded-2xl sm:h-100" />;
  }

  return (
    <Card
      className="group relative h-full min-h-[500px] w-full overflow-hidden rounded-[2rem] border-0 bg-muted/20 shadow-xl ring-1 ring-border/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {eventsData.map((event, slideIndex) => (
        <div
          key={event.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: slideIndex === index ? 1 : 0,
            zIndex: slideIndex === index ? 1 : 0,
          }}
          aria-hidden={slideIndex !== index}
        >
          <Image
            src={event.cover_image ?? "/images/fallback.webp"}
            alt={event.title}
            fill
            className="object-cover"
            priority={slideIndex === 0}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-foreground via-foreground/40 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-80" />
        </div>
      ))}

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
          <div className="flex transition-opacity duration-500" key={index}>
            <div className="space-y-3">
              <span className="inline-flex items-center rounded-full bg-primary-foreground/15 backdrop-blur-sm border border-primary-foreground/20 px-3 py-1 text-xs text-primary-foreground/90">
                {formatEventDate(currentEvent.start_datetime)}
              </span>

              <h2 className="text-3xl font-bold leading-none tracking-tight text-background drop-shadow-md md:text-4xl">
                {currentEvent.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              asChild
              size="lg"
              className="group/btn h-12 rounded-full bg-background px-6 text-base font-semibold text-foreground shadow-lg transition-all hover:bg-background/90 hover:shadow-xl hover:scale-105"
            >
              <Link
                href={`/dashboard/events/${currentEvent.id}`}
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
                  key={`${event.id}-${dotIndex}`}
                  type="button"
                  onClick={() => setIndex(dotIndex)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    dotIndex === index
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

      {/* Prev / Next arrows */}
      {total > 1 ? (
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
    </Card>
  );
}
