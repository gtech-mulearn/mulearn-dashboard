// ============================================================================
// Events Feature — Type Definitions
// API Specification: `/api/v1/dashboard/events/` (Full API)
// ============================================================================

// ─── PRIMITIVES ─────────────────────────────────────────────────────────────
export type UUID = string;
export type ISODateTime = string;
export type ISODate = string;

// ─── ENUMS ──────────────────────────────────────────────────────────────────

/**
 * IG Cluster identifier — fetched dynamically from `/api/v1/dashboard/ig/list/`.
 * Kept as `string` to avoid tight coupling to hardcoded values.
 * Use `useIGClusters()` hook to get the current list of available clusters.
 */
export type IGCluster = string;

export type EventScope = "global" | "campus" | "ig" | "campus_ig" | "company";

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

/** Event type - kept for component backward compatibility */
export type EventType =
  | "hackathon"
  | "workshop"
  | "webinar"
  | "seminar"
  | "bootcamp"
  | "meetup"
  | "conference"
  | "competition"
  | "ideathon"
  | "cultural_event"
  | "sports_event"
  | "community_event"
  | "expo"
  | "networking_event"
  | "tech_talk"
  | "others"; // API default — note: "others" (not "other")

/** Internal/component type without API prefix */
export type CollaboratorType = "ig" | "campus" | "campus_ig" | "company";

/** API request body entity type - has "collab_" prefix */
export type CollaboratorEntityType =
  | "collab_ig"
  | "collab_campus"
  | "collab_campus_ig"
  | "collab_company";

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
  pageSize?: number;
  perPage?: number;
  page_size?: number;
  per_page?: number;
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
  muid: string;
  profile_pic: string | null;
}

export interface MinimalIG {
  id: UUID;
  name: string;
  icon: string;
  code?: string;
  logo?: string; // Backward compatibility
  cluster?: IGCluster;
  category?: string;
}

export interface MinimalCampus {
  id: UUID;
  title: string;
  name?: string; // Backward compatibility
  org_type?: "College" | "School";
  logo?: string; // Backward compatibility
}

export interface MinimalCompany {
  id: UUID;
  title: string;
  name?: string; // Backward compatibility
  org_type?: "College" | "School";
  logo?: string; // Backward compatibility
}

// ─── ORGANIZER INFO ─────────────────────────────────────────────────────────

export interface OrganizerInfo {
  type?: OrganizerType;
  ig?: MinimalIG | null;
  campus?: MinimalCampus | null;
  company?: MinimalCompany | null;
  campus_ig_id?: UUID | null;
  // Backend API returns these fields instead
  organiser_type?: OrganizerType;
  organiser_ig?: MinimalIG | null;
  organiser_campus?: MinimalCampus | null;
  organiser_company?: MinimalCompany | null;
  organiser_ci_id?: UUID | null;
  // Backward compatibility for old component usage
  campus_ig?: { id: UUID; name: string; icon: string; code?: string } | null;
}

// ─── META / FORM OPTIONS ────────────────────────────────────────────────────

export interface OrganizerOptionsResponse {
  global_ig?: MinimalIG[];
  campus_ig?: MinimalIG[];
  campus?: MinimalCampus[];
  company?: MinimalCompany[];
  admin?: boolean;
  // Backward compatibility
  can_create_as_ig?: MinimalIG[];
  can_create_as_campus_ig?: MinimalIG[];
  can_create_as_campus?: MinimalCampus[];
  can_create_as_company?: MinimalCompany[];
  can_create_as_admin?: boolean;
  campus_context?: { id: string; title: string } | null;
}

// ─── COLLABORATION TARGET ───────────────────────────────────────────────────

export interface CollaborationTarget {
  id: UUID;
  name: string;
  icon?: string;
  logo?: string | null; // Backward compatibility
  code?: string;
  org_type?: "College" | "School";
  title?: string;
  collaborator_type?: CollaboratorType;
}

// ─── CO-OWNERS ──────────────────────────────────────────────────────────────

export interface EventCoOwner {
  id: UUID;
  entity_id: UUID;
  user: MinimalUser;
  added_by: MinimalUser;
  added_at: ISODateTime;
  role?: "co_owner" | "admin"; // Backward compatibility - may or may not be in API
}

export interface EventCoOwnerInput {
  user_id: UUID;
}

// ─── COLLABORATORS ──────────────────────────────────────────────────────────

export type EntityDetail = MinimalIG | MinimalCampus | MinimalCompany | null;

export interface EventCollaborator {
  id: UUID;
  entity_type: CollaboratorEntityType;
  entity_id: UUID;
  entity_detail: EntityDetail;
  role_label: string | null;
  invite_status: "pending" | "accepted" | "rejected" | null;
  rejection_reason: string | null;
  responded_at: ISODateTime | null;
  created_at: ISODateTime;
  // Backward compatibility - components may use these nested properties
  ig?: MinimalIG | null;
  campus?: MinimalCampus | null;
  campus_ig?: { id: UUID; name: string; icon: string; code?: string } | null;
  company?: MinimalCompany | null;
  collaborator_type?: CollaboratorType;
  invited_at?: ISODateTime;
}

export interface PendingInviteItem extends EventCollaborator {
  event_id: UUID;
  event_title: string;
  event_start_datetime: ISODateTime | null;
  event_cover_image: string | null;
}

export type PendingInvitesData = PendingInviteItem[];

export interface CollaboratorInviteBody {
  entity_type: CollaboratorEntityType;
  entity_id: UUID;
  role_label?: string | null;
}

// ─── LINKED TASKS ───────────────────────────────────────────────────────────

export interface LinkedTask {
  id: UUID;
  title: string;
  description: string;
  hashtag: string | null;
  karma: number;
  bonus_time: number;
  bonus_karma: number;
  active: boolean;
  ig: MinimalIG;
}

export interface LinkedTaskInput {
  task_id: UUID;
}

// ─── EVENT LOG ──────────────────────────────────────────────────────────────

export interface EventLog {
  id: UUID;
  action?:
    | "event_updated"
    | "co_owner_added"
    | "co_owner_removed"
    | "collaborator_invited"
    | "collaborator_accepted"
    | "collaborator_rejected"
    | "collaborator_removed"
    | string;
  actor?: MinimalUser | null;
  performed_by?: MinimalUser | null;
  target_type?: string | null;
  target_id?: UUID | null;
  target_name?: string | null;
  timestamp?: ISODateTime | null;
  // History specifics
  edited_by?: MinimalUser;
  summary?: string | null;
  changes?: Record<string, { from?: unknown; to?: unknown }> | null;
  details?: string | null;
  // Backward compatibility with older edit_history payloads.
  changed_fields?: string[] | Record<string, unknown>;
  edited_at?: ISODateTime;
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

/** EventListItem - returned from public/manage/admin list endpoints */
export interface EventListItem {
  id: UUID;
  title: string;
  slug: string;
  cover_image: string | null;
  status: EventStatus;
  scope: EventScope;
  /** Direct cluster bucket returned by the cluster endpoint (e.g. "maker", "coder", "creative", "manager") */
  event_scope?: string | null;
  start_datetime: ISODateTime;
  end_datetime: ISODateTime;
  created_at?: ISODateTime;
  venue: EventVenue;
  organizer: OrganizerInfo;
  is_featured: boolean;
  is_collaboration: boolean;
  interest_count: number;
  min_karma: number;
  tags: string[] | null;
  user_limit: number;
  /** Human-readable category name from the categories API (e.g. "Workshop", "Sprint") */
  category_name: string | null;
  /** UUID of the category from the categories API */
  category_id?: string | null;
  viewer_interest_status: ViewerInterestStatus | null;
  // Backward compatibility properties
  event_type?: EventType;
  venue_type?: VenueType;
  venue_city?: string | null;
}

/** EventDetail - full event object from /manage/<id>/ and detail endpoints */
export interface EventDetail {
  id: UUID;
  title: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  banner_image: string | null;
  category_name: string | null;
  status: EventStatus;
  scope: EventScope;
  scope_org: MinimalCampus | null;
  scope_ig: MinimalIG | null;
  scope_ci_id: UUID | null;
  organizer: OrganizerInfo;
  venue: EventVenue;
  start_datetime: ISODateTime;
  end_datetime: ISODateTime;
  registration_url: string | null;
  registration_deadline: ISODateTime | null;
  min_karma: number;
  is_featured: boolean;
  is_collaboration: boolean;
  interest_count: number;
  tags: string[] | null;
  user_limit: number;
  linked_tasks: LinkedTask[];
  co_owners: EventCoOwner[];
  collaborators: EventCollaborator[];
  viewer_interest_status: ViewerInterestStatus | null;
  viewer_can_access_registration: boolean;
  viewer_access_blocked_reason: string | null;
  created_by: MinimalUser;
  updated_by: MinimalUser;
  created_at: ISODateTime;
  updated_at: ISODateTime;
  // Backward compatibility properties
  event_type?: EventType;
  target_campus?: MinimalCampus | null;
  target_ig?: MinimalIG | null;
  target_campus_ig?: {
    id: UUID;
    name: string;
    icon: string;
    code?: string;
  } | null;
  event_scope?: string | null;
  category_id?: string | null;
}

/** EventDetailManage - EventDetail with edit_history (only from manage endpoints) */
export interface EventDetailManage extends EventDetail {
  edit_history: EventLog[];
}

// ─── INTEREST SYSTEM ────────────────────────────────────────────────────────

export interface EventInterestResponse {
  event_id: UUID;
  user_id: UUID;
  status: "interested";
}

// ─── REQUEST BODIES (Write Inputs) ──────────────────────────────────────────

/**
 * EventWriteRequest - for creating/updating events
 * Matches API spec exactly
 */
export interface EventWriteBody {
  title: string;
  description: string | null;
  cover_image: string | null;
  banner_image: string | null;
  category: UUID | null;
  event_type?: string | null;
  start_datetime: ISODateTime;
  end_datetime: ISODateTime;
  registration_url: string | null;
  registration_deadline: ISODateTime | null;
  min_karma?: number | null;
  venue_type: VenueType;
  venue_address: string | null;
  venue_city: string | null;
  venue_maps_url: string | null;
  venue_online_link: string | null;
  venue_platform: string | null;
  scope: EventScope;
  scope_org: UUID | null;
  scope_ig: UUID | null;
  scope_ci_id: UUID | null;
  organiser_type: OrganizerType;
  organiser_ig: UUID | null;
  organiser_org: UUID | null;
  organiser_ci_id: UUID | null;
  is_collaboration?: boolean;
  is_featured?: boolean;
  tags: string[] | null;
  user_limit?: number;
  event_scope: IGCluster;
}

export type EventPatchBody = Partial<EventWriteBody>;

// ─── QUERY PARAMS ───────────────────────────────────────────────────────────

export interface EventListQueryParams {
  pageIndex?: number;
  perPage?: number;
  search?: string;
  event_type?: string;
  ig_id?: UUID;
  campus_id?: UUID;
  cluster?: string;
  event_scope?: string;
  is_featured?: string;
  start_date?: ISODate;
  end_date?: ISODate;
  tags?: string;
  eligible_only?: string;
  sortBy?: string;
  status?: EventStatus;
  organiser_type?: string;
  created_by?: UUID;
  scope?: EventScope;
}

// ─── UNWRAPPED DATA TYPES ───────────────────────────────────────────────────
// apiClient unwraps the Django envelope, so hooks receive these directly

export type EventListData = PaginatedData<EventListItem>;
export type EventDetailData = EventDetail;
export type EventDetailManageData = EventDetailManage;
export type EventMutationData = EventDetail;
export type EventDeleteData = Record<string, unknown>;
export type EventInterestData = EventInterestResponse;
export type CoOwnersListData = EventCoOwner[];
export type CollaboratorsListData = EventCollaborator[];

// ─── UI / COMPONENT PROPS ──────────────────────────────────────────────────

export interface EventAnalyticsPanelProps {
  interestCount: number;
  venueName: string | null;
  mapsUrl: string | null;
  mapQuery: string;
}

export interface EventDetailViewProps {
  eventId: string;
  showInterestButton?: boolean;
  layout?: "full" | "content-only";
  showVenue?: boolean;
  initialEvent?: EventDetail;
}

export interface ManageEventDetailViewProps {
  eventId: string;
  onBack?: () => void;
}

export interface HistoryLogEntryProps {
  entry: EventLog;
}

export interface EventInlineEditFormProps {
  event: EventDetailManage;
  onSave: () => void;
  onDiscard: () => void;
  onDirtyChange: (isDirty: boolean) => void;
}

export interface EventCreateWizardProps {
  open: boolean;
  onClose: () => void;
}

export interface CoOwnerDisplay {
  user_id: string;
  role?: "co_owner" | "admin";
  full_name: string;
  muid: string;
}

export interface SelectedOrganiser {
  label: string;
  type: OrganizerType;
  id: string;
}
