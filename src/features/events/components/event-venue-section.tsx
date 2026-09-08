import { ExternalLink, Globe, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildGoogleMapEmbedUrl } from "../hooks";
import type { EventVenue } from "../types";

interface EventVenueSectionProps {
  venue: EventVenue;
}

export function EventVenueSection({ venue }: EventVenueSectionProps) {
  const isPhysical = venue.type === "physical" || venue.type === "hybrid";
  const isOnline = venue.type === "online" || venue.type === "hybrid";

  const mapQuery = [venue.address, venue.city].filter(Boolean).join(", ");
  const hasPhysicalInfo = Boolean(mapQuery || venue.maps_url);
  const hasOnlineInfo = Boolean(venue.online_link || venue.platform);

  if (!hasPhysicalInfo && !hasOnlineInfo) return null;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2.5 px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-rose-500/10">
          {venue.type === "online" ? (
            <Globe className="size-4 text-rose-500" />
          ) : (
            <MapPin className="size-4 text-rose-500" />
          )}
        </div>
        <h2 className="text-base font-bold text-foreground">
          {venue.type === "online"
            ? "Online Venue"
            : venue.type === "hybrid"
              ? "Venue (Hybrid)"
              : "Venue"}
        </h2>
      </div>

      <div className="space-y-4 px-5 pb-5 pt-0">
        {/* Physical Map */}
        {isPhysical && mapQuery && (
          <div className="overflow-hidden rounded-xl border border-border">
            <iframe
              className="h-52 w-full"
              src={buildGoogleMapEmbedUrl(mapQuery)}
              title="Event location map"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}

        {/* Physical Address & Directions */}
        {isPhysical && hasPhysicalInfo && (
          <div className="flex items-center justify-between gap-4">
            {mapQuery && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                {mapQuery}
              </p>
            )}

            {venue.maps_url && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="shrink-0 rounded-full ml-auto"
              >
                <a
                  href={venue.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get Directions <ExternalLink className="ml-1.5 size-3" />
                </a>
              </Button>
            )}
          </div>
        )}

        {/* Online / Virtual link */}
        {isOnline && hasOnlineInfo && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/30 p-3.5">
            <div className="flex items-center gap-2">
              <Globe className="size-4 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {venue.platform || "Online Meeting"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Virtual session link
                </p>
              </div>
            </div>

            {venue.online_link ? (
              <Button size="sm" asChild className="rounded-full">
                <a
                  href={venue.online_link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join Meeting <ExternalLink className="ml-1.5 size-3" />
                </a>
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground italic">
                Link provided to registered participants
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
