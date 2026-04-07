"use client";

import { ExternalLink, MapPin, Maximize2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { buildGoogleMapEmbedUrl } from "../hooks";

interface ExpandableMapDialogProps {
  mapQuery: string;
  mapsUrl: string | null;
  venueName: string | null;
}

function useIsMobileBreakpoint(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isMobile;
}

function MapContent({
  mapQuery,
  mapsUrl,
  venueName,
}: ExpandableMapDialogProps) {
  return (
    <div className="space-y-3">
      <div className="h-[52vh] min-h-[320px] w-full overflow-hidden rounded-xl border border-border md:h-[65vh]">
        <iframe
          title="Expanded event location map"
          src={buildGoogleMapEmbedUrl(mapQuery)}
          className="h-full w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="inline-flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {venueName ?? "Venue not set"}
        </p>
        {mapsUrl ? (
          <Button variant="outline" size="sm" asChild>
            <a href={mapsUrl} target="_blank" rel="noreferrer">
              Open in Maps
              <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function ExpandableMapDialog(props: ExpandableMapDialogProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobileBreakpoint();

  if (isMobile) {
    return (
      <>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setOpen(true)}
        >
          <Maximize2 className="mr-2 h-3.5 w-3.5" />
          Open Large Map
        </Button>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="bottom"
            className="h-[92vh] overflow-y-auto rounded-t-2xl"
          >
            <SheetHeader>
              <SheetTitle>Event Location</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <MapContent {...props} />
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => setOpen(true)}
      >
        <Maximize2 className="mr-2 h-3.5 w-3.5" />
        Open Large Map
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[min(98vw,1600px)] max-w-none border-border p-5">
          <DialogHeader>
            <DialogTitle>Event Location</DialogTitle>
          </DialogHeader>
          <MapContent {...props} />
        </DialogContent>
      </Dialog>
    </>
  );
}
