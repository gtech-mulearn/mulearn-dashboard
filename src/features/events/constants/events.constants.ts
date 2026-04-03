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
