import { ExternalLink, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildGoogleMapEmbedUrl } from "../hooks";
import type { EventVenue } from "../types";

interface EventVenueSectionProps {
  venue: EventVenue;
}

export function EventVenueSection({ venue }: EventVenueSectionProps) {
  if (venue.type !== "physical" && venue.type !== "hybrid") return null;

  const mapQuery = [venue.address, venue.city].filter(Boolean).join(", ");

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2.5 px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-rose-500/10">
          <MapPin className="size-4 text-rose-500" />
        </div>
        <h2 className="text-base font-bold text-foreground">Venue</h2>
      </div>
      <div className="space-y-4 px-5 pb-5 pt-0">
        {mapQuery && (
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

        {(mapQuery || venue.maps_url) && (
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
                <a href={venue.maps_url} target="_blank" rel="noreferrer">
                  Get Directions <ExternalLink className="ml-1.5 size-3" />
                </a>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
