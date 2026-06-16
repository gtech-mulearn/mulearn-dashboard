"use client";

import { Badge } from "@/components/ui/badge";
import { EVENT_STATUS_MAP } from "../constants/events.constants";
import type { EventStatus } from "../types";

interface EventStatusBadgeProps {
  status: EventStatus;
  className?: string;
}

const STATUS_VARIANTS: Record<
  EventStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  draft: "secondary",
  pending_campus_approval: "outline",
  pending_approval: "outline",
  pending_mentor_approval: "outline",
  published: "default",
  ongoing: "default",
  completed: "outline",
  cancelled: "destructive",
};

export function EventStatusBadge({ status, className }: EventStatusBadgeProps) {
  const config = EVENT_STATUS_MAP[status];
  const variant = STATUS_VARIANTS[status] || "outline";
  return (
    <Badge variant={variant} className={className}>
      {config?.label || status}
    </Badge>
  );
}
