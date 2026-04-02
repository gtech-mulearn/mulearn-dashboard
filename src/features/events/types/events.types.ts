// ============================================================================
// Events Feature — Type Definitions
// Sourced from: event requirements (1).md & Postman collection
// ============================================================================

// ─── PRIMITIVES ─────────────────────────────────────────────────────────────
export type UUID = string;
export type ISODateTime = string;
export type ISODate = string;

// ─── ENUMS ──────────────────────────────────────────────────────────────────

export type EventType =
  | "workshop"
  | "webinar"
  | "hackathon"
  | "meetup"
  | "competition"
  | "social_gathering"
  | "other";

export type IGCluster = "coder" | "maker" | "manager" | "creative";

export type EventScope = "global" | "campus" | "ig" | "campus_ig";

export type VenueType = "physical" | "online" | "hybrid";

export type EventStatus =
  | "draft"
  | "pending_campus_approval"
  | "pending_approval"
  | "pending_mentor_approval"
  | "published"
  | "ongoing"
  | "completed"
  | "cancelled";

export type ViewerInterestStatus = "interested" | "none";

export type EventCoOwnerRole = "co_owner" | "admin";

export type CollaboratorType = "ig" | "campus" | "campus_ig" | "company";

export type OrganizerType =
  | "global_ig"
  | "campus_ig"
  | "campus"
  | "company"
  | "admin";

// ─── RESPONSE ENVELOPES ─────────────────────────────────────────────────────

export interface PaginationMeta {
  count: number;
  totalPages: number;
  isNext: boolean;
  isPrev: boolean;
  nextPage: number | null;
}

export interface PaginatedData<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface SuccessResponse<T = unknown> {
  hasError: false;
  statusCode: 200 | 201;
  message: {
    general: string[];
    [field: string]: string[];
  };
  response: T;
}

export interface FailureResponse {
  hasError: true;
  statusCode: number;
  message: {
    general: string[];
    [field: string]: string[];
  };
  response: Record<string, unknown>;
}

export type APIResponse<T = unknown> = SuccessResponse<T> | FailureResponse;

// ─── MINIMAL NESTED SHAPES ──────────────────────────────────────────────────

export interface MinimalUser {
  id: UUID;
  full_name: string;
  profile_pic: string | null;
  muid: string;
}

export interface MinimalIG {
  id: UUID;
  name: string;
  logo: string | null;
  cluster: IGCluster;
}

export interface MinimalCampus {
  id: UUID;
  name: string;
  logo: string | null;
}

export interface MinimalCompany {
  id: UUID;
  name: string;
  logo: string | null;
}

export interface MinimalCampusIG {
  id: UUID;
  ig: MinimalIG;
  campus: MinimalCampus;
}

export interface OrganizerInfo {
  type: OrganizerType;
  ig?: MinimalIG;
  campus_ig?: MinimalCampusIG;
  campus?: MinimalCampus;
  company?: MinimalCompany;
}

export interface OrganizerOptionsResponse {
  can_create_as_ig: MinimalIG[];
  can_create_as_campus_ig: MinimalCampusIG[];
  can_create_as_campus: MinimalCampus[];
  can_create_as_company: MinimalCompany[];
  can_create_as_admin: boolean;
}

export interface CollaborationTarget {
  collaborator_type: CollaboratorType;
  id: UUID;
  name: string;
  logo: string | null;
}

// ─── CO-OWNERS ──────────────────────────────────────────────────────────────

export interface EventCoOwner {
  id: UUID;
  user: MinimalUser;
  role: EventCoOwnerRole;
  added_at: ISODateTime;
  added_by: MinimalUser;
}

export interface EventCoOwnerInput {
  user_id: UUID;
  role?: EventCoOwnerRole;
}

// ─── COLLABORATORS ──────────────────────────────────────────────────────────

export interface EventCollaborator {
  id: UUID;
  collaborator_type: CollaboratorType;
  ig?: MinimalIG;
  campus?: MinimalCampus;
  campus_ig?: MinimalCampusIG;
  company?: MinimalCompany;
  role_label: string | null;
  invite_status: "pending" | "accepted" | "rejected";
  invited_at: ISODateTime;
  responded_at: ISODateTime | null;
  rejection_reason: string | null;
}

/**
 * Postman body uses "collab_" prefix for entity_type discriminator
 * This matches the actual API contract, not the spec
 */
export interface CollaboratorInviteBody {
  entity_type:
    | "collab_ig"
    | "collab_campus"
    | "collab_campus_ig"
    | "collab_company";
  entity_id: UUID;
  role_label?: string | null;
}

// ─── LINKED TASKS ───────────────────────────────────────────────────────────

export interface LinkedTask {
  id: UUID;
  title: string;
  description: string | null;
  hashtag: string;
  karma: number;
  bonus_time: ISODateTime | null;
  bonus_karma: number;
  active: boolean;
  ig: MinimalIG | null;
}

export interface LinkedTaskInput {
  task_id: UUID;
}

// ─── VENUE ──────────────────────────────────────────────────────────────────

export interface EventVenue {
  type: VenueType;
  address: string | null;
  city: string | null;
  maps_url: string | null;
  online_link: string | null;
  platform: string | null;
}

// ─── CORE EVENT MODELS ──────────────────────────────────────────────────────

export interface EventDetail {
  id: UUID;
  title: string;
  slug: string;
  description: string;
  cover_image: string | null;
  banner_image: string | null;
  event_type: EventType;
  scope: EventScope;
  status: EventStatus;
  organizer: OrganizerInfo;
  start_datetime: ISODateTime;
  end_datetime: ISODateTime;
  venue: EventVenue;
  registration_url: string | null;
  registration_deadline: ISODateTime | null;
  min_karma: number | null;
  linked_tasks: LinkedTask[];
  co_owners: EventCoOwner[];
  is_collaboration: boolean;
  collaborators: EventCollaborator[];
  target_campus: MinimalCampus | null;
  target_ig: MinimalIG | null;
  target_campus_ig: MinimalCampusIG | null;
  is_featured: boolean;
  tags: string[];
  interest_count: number;
  viewer_interest_status: ViewerInterestStatus | null;
  viewer_can_access_registration: boolean;
  viewer_access_blocked_reason: string | null;
  created_by: MinimalUser;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface EventDetailManage extends EventDetail {
  edit_history: Array<{
    edited_by: MinimalUser;
    edited_at: ISODateTime;
    changed_fields: string[];
  }>;
}

export interface EventListItem {
  id: UUID;
  title: string;
  slug: string;
  cover_image: string | null;
  event_type: EventType;
  scope: EventScope;
  status: EventStatus;
  start_datetime: ISODateTime;
  end_datetime: ISODateTime;
  venue_type: VenueType;
  venue_city: string | null;
  organizer: OrganizerInfo;
  min_karma: number | null;
  is_collaboration: boolean;
  is_featured: boolean;
  tags: string[];
  interest_count: number;
  viewer_interest_status: ViewerInterestStatus | null;
}

// ─── INTEREST SYSTEM ────────────────────────────────────────────────────────

export interface EventInterest {
  id: UUID;
  event: { id: UUID; title: string; slug: string };
  user: MinimalUser;
  expressed_at: ISODateTime;
}

// ─── REQUEST BODIES (Write Inputs) ──────────────────────────────────────────

/**
 * Main request body for creating or updating an event.
 * Field names use British "organiser_" spelling (from Postman collection).
 * Venue fields are TOP-LEVEL (not nested object).
 */
export interface EventWriteBody {
  title: string;
  description: string;
  event_type?: EventType;
  scope: EventScope;
  organiser_type: OrganizerType;
  organiser_ig_id?: UUID;
  organiser_campus_id?: UUID;
  organiser_campus_ig_id?: UUID;
  organiser_company_id?: UUID;
  start_datetime: ISODateTime;
  end_datetime: ISODateTime;
  venue_type: VenueType;
  address?: string | null;
  city?: string | null;
  maps_url?: string | null;
  online_link?: string | null;
  platform?: string | null;
  cover_image?: string | null;
  banner_image?: string | null;
  registration_url?: string | null;
  registration_deadline?: ISODateTime | null;
  min_karma?: number | null;
  linked_tasks?: LinkedTaskInput[];
  co_owners?: EventCoOwnerInput[];
  is_collaboration?: boolean;
  target_campus_id?: UUID | null;
  target_ig_id?: UUID | null;
  target_campus_ig_id?: UUID | null;
  tags?: string[];
  is_featured?: boolean;
}

export type EventPatchBody = Partial<EventWriteBody>;

// ─── QUERY PARAMS ───────────────────────────────────────────────────────────

export interface EventListQueryParams {
  page?: number;
  perPage?: number;
  search?: string;
  event_type?: EventType;
  scope?: EventScope;
  status?: EventStatus;
  ig_id?: UUID;
  campus_id?: UUID;
  company_id?: UUID;
  campus_ig_id?: UUID;
  cluster?: IGCluster;
  is_featured?: boolean;
  tags?: string;
  eligible_only?: boolean;
  start_date?: ISODate;
  end_date?: ISODate;
  sortBy?:
    | "start_datetime"
    | "-start_datetime"
    | "created_at"
    | "-created_at"
    | "interest_count"
    | "-interest_count";
}

// ─── UNWRAPPED DATA TYPES ───────────────────────────────────────────────────
// apiClient unwraps the Django envelope, so hooks receive these directly

export type EventListData = PaginatedData<EventListItem>;
export type EventDetailData = EventDetail;
export type EventDetailManageData = EventDetailManage;
export type EventMutationData = EventDetail;
export type EventDeleteData = { message: string };
export type EventInterestData = EventInterest;
export type CoOwnersListData = EventCoOwner[];
export type CollaboratorsListData = EventCollaborator[];
