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
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  pending_campus_approval: {
    label: "Pending Campus Approval",
    className:
      "bg-[color-mix(in_srgb,var(--chart-4)_18%,var(--background))] text-[var(--chart-5)]",
  },
  pending_approval: {
    label: "Pending Approval",
    className:
      "bg-[color-mix(in_srgb,var(--chart-4)_18%,var(--background))] text-[var(--chart-5)]",
  },
  pending_mentor_approval: {
    label: "Pending Mentor Approval",
    className:
      "bg-[color-mix(in_srgb,var(--chart-4)_18%,var(--background))] text-[var(--chart-5)]",
  },
  published: {
    label: "Published",
    className:
      "bg-[color-mix(in_srgb,var(--chart-2)_18%,var(--background))] text-[var(--chart-2)]",
  },
  ongoing: {
    label: "Ongoing",
    className:
      "bg-[color-mix(in_srgb,var(--primary)_16%,var(--background))] text-primary",
  },
  completed: {
    label: "Completed",
    className: "bg-muted text-muted-foreground",
  },
  cancelled: {
    label: "Cancelled",
    className:
      "bg-[color-mix(in_srgb,var(--destructive)_12%,var(--background))] text-destructive",
  },
};

export const EVENT_TYPE_BADGE_CONFIG: Record<
  EventType,
  { label: string; icon: LucideIcon; className: string }
> = {
  workshop: {
    label: "Workshop",
    icon: BookOpen,
    className: "ig-cat-manager",
  },
  webinar: {
    label: "Webinar",
    icon: Globe,
    className: "ig-cat-coder",
  },
  hackathon: {
    label: "Hackathon",
    icon: Code,
    className: "ig-cat-creative",
  },
  meetup: {
    label: "Meetup",
    icon: Users,
    className: "ig-cat-maker",
  },
  competition: {
    label: "Competition",
    icon: Trophy,
    className:
      "bg-[color-mix(in_srgb,var(--chart-1)_18%,var(--background))] text-[var(--chart-1)]",
  },
  social_gathering: {
    label: "Social",
    icon: Gamepad2,
    className:
      "bg-[color-mix(in_srgb,var(--chart-5)_18%,var(--background))] text-[var(--chart-5)]",
  },
  other: {
    label: "Other",
    icon: Lightbulb,
    className: "ig-cat-others",
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
