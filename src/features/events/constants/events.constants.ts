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
import type { CreateEventSchema } from "../schemas";
import type {
  CollaboratorEntityType,
  CollaboratorType,
  EventScope,
  EventStatus,
  EventType,
  IGCluster,
} from "../types";

type LabelValueOption<T extends string> = {
  label: string;
  value: T;
};

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

export const EVENT_CLUSTER_OPTIONS: Array<LabelValueOption<IGCluster | "all">> =
  [
    { label: "All", value: "all" },
    { label: "Coder", value: "coder" },
    { label: "Maker", value: "maker" },
    { label: "Manager", value: "manager" },
    { label: "Creative", value: "creative" },
  ];

export const EVENT_TYPE_OPTIONS: Array<LabelValueOption<EventType | "all">> = [
  { label: "All Types", value: "all" },
  { label: "Workshop", value: "workshop" },
  { label: "Webinar", value: "webinar" },
  { label: "Hackathon", value: "hackathon" },
  { label: "Meetup", value: "meetup" },
  { label: "Competition", value: "competition" },
  { label: "Social Gathering", value: "social_gathering" },
  { label: "Other", value: "other" },
];

export const EVENT_TYPE_SELECT_OPTIONS: Array<LabelValueOption<EventType>> = [
  { label: "Workshop", value: "workshop" },
  { label: "Webinar", value: "webinar" },
  { label: "Hackathon", value: "hackathon" },
  { label: "Meetup", value: "meetup" },
  { label: "Competition", value: "competition" },
  { label: "Social Gathering", value: "social_gathering" },
  { label: "Other", value: "other" },
];

export const EVENT_SCOPE_OPTIONS: Array<LabelValueOption<EventScope>> = [
  { label: "Global", value: "global" },
  { label: "Campus", value: "campus" },
  { label: "IG", value: "ig" },
  { label: "Campus IG", value: "campus_ig" },
];

export const COLLABORATOR_TYPE_OPTIONS: Array<
  LabelValueOption<CollaboratorType | "all">
> = [
  { label: "All", value: "all" },
  { label: "IG", value: "ig" },
  { label: "Campus", value: "campus" },
  { label: "Campus IG", value: "campus_ig" },
  { label: "Company", value: "company" },
];

export const COLLABORATOR_INVITE_TYPE_MAP: Record<
  CollaboratorType,
  CollaboratorEntityType
> = {
  ig: "collab_ig",
  campus: "collab_campus",
  campus_ig: "collab_campus_ig",
  company: "collab_company",
};

export const MANAGE_EVENT_STATUS_PILLS: Array<
  LabelValueOption<EventStatus | "all">
> = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Pending", value: "pending_approval" },
  { label: "Published", value: "published" },
  { label: "Ongoing", value: "ongoing" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export const EVENT_FORM_DEFAULT_VALUES: CreateEventSchema = {
  title: "",
  description: "",
  event_type: "other",
  scope: "global",
  start_datetime: "",
  end_datetime: "",
  venue_type: "online",
  address: "",
  city: "",
  maps_url: "",
  online_link: "",
  platform: "",
  cover_image: "",
  banner_image: "",
  registration_url: "",
  registration_deadline: null,
  min_karma: null,
  linked_tasks: [],
  co_owners: [],
  is_collaboration: false,
  target_campus_id: null,
  target_ig_id: null,
  target_campus_ig_id: null,
  tags: [],
  is_featured: false,
};
