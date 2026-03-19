/**
 * Event Type Badge
 *
 * 📍 src/features/events/components/event-type-badge.tsx
 *
 * Renders a colour-coded badge for each event type with an icon.
 */

import {
  BookOpen,
  Code,
  Gamepad2,
  Globe,
  Lightbulb,
  Trophy,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { EventType } from "../types";

const typeConfig: Record<
  EventType,
  { label: string; icon: React.ElementType; className: string }
> = {
  workshop: {
    label: "Workshop",
    icon: BookOpen,
    className:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  },
  webinar: {
    label: "Webinar",
    icon: Globe,
    className: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  },
  hackathon: {
    label: "Hackathon",
    icon: Code,
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  meetup: {
    label: "Meetup",
    icon: Users,
    className:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  },
  competition: {
    label: "Competition",
    icon: Trophy,
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  social_gathering: {
    label: "Social",
    icon: Gamepad2,
    className:
      "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  },
  other: {
    label: "Other",
    icon: Lightbulb,
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
};

interface EventTypeBadgeProps {
  eventType: EventType;
  className?: string;
}

export function EventTypeBadge({ eventType, className }: EventTypeBadgeProps) {
  const config = typeConfig[eventType] ?? typeConfig.other;
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
