"use client";

import { Badge } from "@/components/ui/badge";
import { EVENT_STATUS_MAP } from "../constants/events.constants";
import type { EventStatus } from "../types";

interface EventStatusBadgeProps {
  status: EventStatus;
  className?: string;
}

export function EventStatusBadge({ status, className }: EventStatusBadgeProps) {
  const config = EVENT_STATUS_MAP[status];
  return (
    <Badge className={`${config.className} border-0 ${className ?? ""}`}>
      {config.label}
    </Badge>
  );
}
