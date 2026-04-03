/**
 * Event Type Badge
 *
 * 📍 src/features/events/components/event-type-badge.tsx
 *
 * Renders a colour-coded badge for each event type with an icon.
 */

import { Badge } from "@/components/ui/badge";
import { EVENT_TYPE_BADGE_CONFIG } from "../constants";
import type { EventType } from "../types";

interface EventTypeBadgeProps {
  eventType: EventType | undefined;
  className?: string;
}

export function EventTypeBadge({ eventType, className }: EventTypeBadgeProps) {
  const type = eventType ?? "other";
  const config = EVENT_TYPE_BADGE_CONFIG[type] ?? EVENT_TYPE_BADGE_CONFIG.other;
  const Icon = config.icon;

  return (
    <Badge
      className={`${config.className} font-medium gap-1 ${className ?? ""}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
