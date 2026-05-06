import { ChevronLeft, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { EventDetail } from "../types";

interface EventHeroBannerProps {
  event: EventDetail;
  organizerName: string;
  organizerLogo: string | null;
}

export function EventHeroBanner({
  event,
  organizerName,
  organizerLogo,
}: EventHeroBannerProps) {
  const router = useRouter();
  const now = Date.now();
  const startTs = new Date(event.start_datetime).getTime();
  const endTs = new Date(event.end_datetime).getTime();

  const isUpcoming = startTs > now;
  const isEnded = endTs < now;
  const isLive = !isUpcoming && !isEnded;

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-zinc-900 md:aspect-[21/8]">
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

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

      {/* Top Row Controls */}
      <button
        type="button"
        onClick={() => router.back()}
        className="absolute left-4 top-4 z-20 flex size-8 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white backdrop-blur-sm"
        aria-label="Go back"
      >
        <ChevronLeft className="size-4" />
      </button>

      {/* Top Right: Status Pill */}
      <div className="absolute right-4 top-4 z-20">
        {isUpcoming && (
          <span className="rounded-full bg-blue-500/90 px-3 py-1 text-xs font-bold text-white">
            Upcoming
          </span>
        )}
        {isLive && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold text-white">
            <span className="size-1.5 animate-pulse rounded-full bg-white" />
            Live Now
          </span>
        )}
        {isEnded && (
          <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white/70 backdrop-blur-sm">
            Ended
          </span>
        )}
      </div>

      {/* Bottom Content */}
      <div className="absolute inset-x-0 bottom-0 p-5 z-20">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {event.is_featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-bold text-amber-900">
                <Star className="size-3" /> Featured
              </span>
            )}
            {Array.isArray(event.tags) &&
              event.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag as string}
                  className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs text-white backdrop-blur-sm"
                >
                  {tag as string}
                </span>
              ))}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            {event.title}
          </h1>
        </div>
      </div>
    </div>
  );
}
