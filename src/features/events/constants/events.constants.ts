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
} from "../types";

type LabelValueOption<T extends string> = {
  label: string;
  value: T;
};

export const EVENT_STATUS_MAP: Record<
  EventStatus,
  { label: string; className: string }
> = {
  draft: { label: "Draft", className: "ig-cat-others" },
  pending_campus_approval: {
    label: "Pending Campus Approval",
    className: "ig-status-requested",
  },
  pending_approval: {
    label: "Pending Approval",
    className: "ig-status-requested",
  },
  pending_mentor_approval: {
    label: "Pending Mentor Approval",
    className: "ig-status-requested",
  },
  published: {
    label: "Published",
    className: "ig-status-active",
  },
  ongoing: {
    label: "Ongoing",
    className: "ig-cat-coder",
  },
  completed: {
    label: "Completed",
    className: "ig-cat-others",
  },
  cancelled: {
    label: "Cancelled",
    className: "ig-status-cancelled",
  },
};

export const EVENT_STATUS_DOT_STYLES: Record<string, string> = {
  draft: "bg-muted-foreground",
  pending_campus_approval: "bg-[var(--chart-5)]",
  pending_approval: "bg-[var(--chart-5)]",
  pending_mentor_approval: "bg-[var(--chart-5)]",
  published: "bg-[var(--chart-2)]",
  ongoing: "bg-primary",
  completed: "bg-muted-foreground",
  cancelled: "bg-destructive",
};

export type { ManagePanelSectionValue } from "./events.ui.constants";
export {
  EVENT_CREATE_WIZARD_STEPS,
  FEATURED_SLIDE_INTERVAL,
  MANAGE_PANEL_SECTIONS,
} from "./events.ui.constants";

export const EVENT_TYPE_BADGE_CONFIG: Record<
  EventType,
  { label: string; icon: LucideIcon; className: string }
> = {
  hackathon: { label: "Hackathon", icon: Code, className: "ig-cat-creative" },
  workshop: { label: "Workshop", icon: BookOpen, className: "ig-cat-manager" },
  webinar: { label: "Webinar", icon: Globe, className: "ig-cat-coder" },
  seminar: { label: "Seminar", icon: BookOpen, className: "ig-cat-coder" },
  bootcamp: { label: "Bootcamp", icon: Code, className: "ig-cat-coder" },
  meetup: { label: "Meetup", icon: Users, className: "ig-cat-maker" },
  conference: { label: "Conference", icon: Users, className: "ig-cat-manager" },
  competition: {
    label: "Competition",
    icon: Trophy,
    className: "ig-cat-manager",
  },
  ideathon: {
    label: "Ideathon",
    icon: Lightbulb,
    className: "ig-cat-creative",
  },
  cultural_event: {
    label: "Cultural Event",
    icon: Gamepad2,
    className: "ig-cat-creative",
  },
  sports_event: {
    label: "Sports Event",
    icon: Trophy,
    className: "ig-cat-maker",
  },
  community_event: {
    label: "Community Event",
    icon: Users,
    className: "ig-cat-maker",
  },
  expo: { label: "Expo", icon: Globe, className: "ig-cat-manager" },
  networking_event: {
    label: "Networking",
    icon: Users,
    className: "ig-cat-coder",
  },
  tech_talk: { label: "Tech Talk", icon: Lightbulb, className: "ig-cat-coder" },
  others: { label: "Others", icon: Lightbulb, className: "ig-cat-others" },
};

export const EVENT_TYPE_OPTIONS: Array<LabelValueOption<EventType | "all">> = [
  { label: "All Types", value: "all" },
  { label: "Hackathon", value: "hackathon" },
  { label: "Workshop", value: "workshop" },
  { label: "Webinar", value: "webinar" },
  { label: "Seminar", value: "seminar" },
  { label: "Bootcamp", value: "bootcamp" },
  { label: "Meetup", value: "meetup" },
  { label: "Conference", value: "conference" },
  { label: "Competition", value: "competition" },
  { label: "Ideathon", value: "ideathon" },
  { label: "Cultural Event", value: "cultural_event" },
  { label: "Sports Event", value: "sports_event" },
  { label: "Community Event", value: "community_event" },
  { label: "Expo", value: "expo" },
  { label: "Networking", value: "networking_event" },
  { label: "Tech Talk", value: "tech_talk" },
  { label: "Others", value: "others" },
];

export const EVENT_TYPE_SELECT_OPTIONS: Array<LabelValueOption<EventType>> = [
  { label: "Hackathon", value: "hackathon" },
  { label: "Workshop", value: "workshop" },
  { label: "Webinar", value: "webinar" },
  { label: "Seminar", value: "seminar" },
  { label: "Bootcamp", value: "bootcamp" },
  { label: "Meetup", value: "meetup" },
  { label: "Conference", value: "conference" },
  { label: "Competition", value: "competition" },
  { label: "Ideathon", value: "ideathon" },
  { label: "Cultural Event", value: "cultural_event" },
  { label: "Sports Event", value: "sports_event" },
  { label: "Community Event", value: "community_event" },
  { label: "Expo", value: "expo" },
  { label: "Networking", value: "networking_event" },
  { label: "Tech Talk", value: "tech_talk" },
  { label: "Others", value: "others" },
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
  event_scope: "",
  category: "",
  event_type: "",

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

  is_collaboration: false,
  target_campus_id: null,
  target_ig_id: null,
  target_campus_ig_id: null,
  tags: [],
  is_featured: false,
};
