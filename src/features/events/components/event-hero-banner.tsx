import { ChevronLeft, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { EventDetail } from "../types";

interface EventHeroBannerProps {
  event: EventDetail;
  organizerName: string;
  organizerLogo: string | null;
}

export function EventHeroBanner({
  event,
  // organizerName,
  // organizerLogo,
}: EventHeroBannerProps) {
  const router = useRouter();
  const now = Date.now();
  const startTs = new Date(event.start_datetime).getTime();
  const endTs = new Date(event.end_datetime).getTime();

  const isUpcoming = startTs > now;
  const isEnded = endTs < now;
  const isLive = !isUpcoming && !isEnded;

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-foreground md:aspect-[21/8]">
      {event.banner_image || event.cover_image ? (
        <Image
          src={
            event.banner_image ?? event.cover_image ?? "/images/fallback.webp"
          }
          alt={event.title}
          fill
          className="object-cover"
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/30 to-transparent" />

      {/* Top Row Controls */}
      <Button
        variant="default"
        size="icon"
        onClick={() => router.back()}
        className="absolute left-4 top-4 z-20"
        aria-label="Go back"
      >
        <ChevronLeft className="size-4" />
      </Button>

      {/* Top Right: Status Pill */}
      <div className="absolute right-4 top-4 z-20">
        {isUpcoming && (
          <span className="rounded-full bg-brand-blue px-3 py-1 text-xs font-bold text-primary-foreground">
            Upcoming
          </span>
        )}
        {isLive && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success px-3 py-1 text-xs font-bold text-primary-foreground">
            <span className="size-1.5 animate-pulse rounded-full bg-primary-foreground" />
            Live Now
          </span>
        )}
        {isEnded && (
          <span className="rounded-full bg-foreground/40 px-3 py-1 text-xs font-semibold text-primary-foreground/70 backdrop-blur-sm">
            Ended
          </span>
        )}
      </div>

      {/* Bottom Content */}
      <div className="absolute inset-x-0 bottom-0 p-5 z-20">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {event.is_featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-warning px-3 py-1 text-xs font-bold text-foreground">
                <Star className="size-3" /> Featured
              </span>
            )}
            {Array.isArray(event.tags) &&
              event.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag as string}
                  className="rounded-full border border-primary-foreground/20 bg-primary-foreground/15 px-3 py-1 text-xs text-primary-foreground backdrop-blur-sm"
                >
                  {tag as string}
                </span>
              ))}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-primary-foreground sm:text-4xl">
            {event.title}
          </h1>
        </div>
      </div>
    </div>
  );
}
