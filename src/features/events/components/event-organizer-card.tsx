import { Building2 } from "lucide-react";
import Image from "next/image";
import { organizerTypeLabel } from "../hooks";
import type { EventDetail } from "../types";

interface EventOrganizerCardProps {
  event: EventDetail;
  organizerName: string;
  organizerLogo: string | null;
}

export function EventOrganizerCard({
  event,
  organizerName,
  organizerLogo,
}: EventOrganizerCardProps) {
  const initials = organizerName.slice(0, 2).toUpperCase();

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2.5 px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/10">
          <Building2 className="size-4 text-indigo-500" />
        </div>
        <h2 className="text-base font-bold text-foreground">Organizer</h2>
      </div>
      <div className="flex items-center gap-3 px-5 pb-5">
        {organizerLogo ? (
          <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-background">
            <Image
              src={organizerLogo}
              alt={organizerName}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
            <span className="text-sm font-black text-white">{initials}</span>
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-foreground">
            {organizerName}
          </p>
          <p className="text-xs capitalize text-muted-foreground">
            {organizerTypeLabel(event.organizer.type)}
          </p>
        </div>
      </div>
    </div>
  );
}
