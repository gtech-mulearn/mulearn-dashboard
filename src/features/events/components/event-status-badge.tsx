/**
 * Event Status Badge
 *
 * 📍 src/features/events/components/event-status-badge.tsx
 *
 * Renders a colour-coded badge for each event status.
 */

import { Badge } from "@/components/ui/badge";
import type { EventStatus } from "../schemas/events.schema";

const statusConfig: Record<EventStatus, { label: string; className: string }> =
  {
    draft: {
      label: "Draft",
      className:
        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    },
    pending_campus_approval: {
      label: "Campus Review",
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    },
    pending_approval: {
      label: "Pending Approval",
      className:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    pending_mentor_approval: {
      label: "Mentor Review",
      className:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    },
    published: {
      label: "Published",
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
    ongoing: {
      label: "Ongoing",
      className:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
    completed: {
      label: "Completed",
      className:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
  };

interface EventStatusBadgeProps {
  status: EventStatus;
  className?: string;
}

export function EventStatusBadge({ status, className }: EventStatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-700",
  };

  return (
    <Badge
      className={`${config.className} font-medium capitalize ${className ?? ""}`}
    >
      {config.label}
    </Badge>
  );
}
