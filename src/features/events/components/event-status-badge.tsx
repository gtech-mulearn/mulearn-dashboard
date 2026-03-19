"use client";

import { Badge } from "@/components/ui/badge";
import type { EventStatus } from "../types";

interface EventStatusBadgeProps {
  status: EventStatus;
  className?: string;
}

const statusMap: Record<EventStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-gray-200 text-gray-800" },
  pending_campus_approval: {
    label: "Pending Campus Approval",
    className: "bg-amber-100 text-amber-800",
  },
  pending_approval: {
    label: "Pending Approval",
    className: "bg-amber-100 text-amber-800",
  },
  pending_mentor_approval: {
    label: "Pending Mentor Approval",
    className: "bg-amber-100 text-amber-800",
  },
  published: { label: "Published", className: "bg-green-100 text-green-800" },
  ongoing: { label: "Ongoing", className: "bg-blue-100 text-blue-800" },
  completed: { label: "Completed", className: "bg-gray-100 text-gray-700" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800" },
};

export function EventStatusBadge({ status, className }: EventStatusBadgeProps) {
  const config = statusMap[status];
  return (
    <Badge className={`${config.className} border-0 ${className ?? ""}`}>
      {config.label}
    </Badge>
  );
}
