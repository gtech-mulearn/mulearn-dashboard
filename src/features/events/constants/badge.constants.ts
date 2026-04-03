import {
  BookOpen,
  Code,
  Gamepad2,
  Globe,
  Lightbulb,
  type LucideIcon,
  Trophy,
  Users,
} from "lucide-react";
import type { EventStatus, EventType } from "../types";

export const EVENT_STATUS_MAP: Record<
  EventStatus,
  { label: string; className: string }
> = {
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

export const EVENT_TYPE_BADGE_CONFIG: Record<
  EventType,
  { label: string; icon: LucideIcon; className: string }
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
