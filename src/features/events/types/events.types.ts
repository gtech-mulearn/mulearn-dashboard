export type EventStatus =
  | "upcoming"
  | "active"
  | "request"
  | "past"
  | "draft"
  | "completed";
export type EventType = "online" | "offline" | "hybrid";
export type TicketType = "free" | "paid" | "karma";

export interface EventTags {
  topics?: string[];
  level?: string;
  tracks?: string[];
  featured?: boolean;
  [key: string]: unknown;
}

export interface Event {
  id: string;
  created_by: string;
  updated_by: string;
  name: string;
  description: string;
  slug: string;
  registration_start_date: string | null;
  registration_end_date: string | null;
  event_start_date: string | null;
  event_end_date: string | null;
  event_start_time: string;
  event_end_time: string;
  user_limit: number;
  status: EventStatus;
  event_type: EventType;
  ticket_type: TicketType;
  cover_image: string | null;
  location_name: string | null;
  location_address: string | null;
  ticket_value: string;
  link: string | null;
  tags: EventTags | null;
  updated_at: string;
  created_at: string;
  category: string | null;
}

export interface EventPagination {
  count: number;
  totalPages: number;
  isNext: boolean;
  isPrev: boolean;
  nextPage: number | null;
}

export interface EventListResponse {
  hasError: boolean;
  statusCode: number;
  message: { general: string[] };
  response: {
    data: Event[];
    pagination: EventPagination;
  };
}

export interface EventDetailResponse {
  hasError: boolean;
  statusCode: number;
  message: { general: string[] };
  response: Event;
}

export interface EventMutationResponse {
  hasError: boolean;
  statusCode: number;
  message: { general: string[] };
  response: Record<string, unknown>;
}

export interface CreateEventPayload {
  name: string;
  description: string;
  registration_start_date?: string;
  registration_end_date?: string;
  event_start_date?: string;
  event_end_date?: string;
  event_start_time?: string;
  event_end_time?: string;
  user_limit?: number;
  event_type: EventType;
  ticket_type: TicketType;
  cover_image?: string;
  location_name?: string;
  location_address?: string;
  ticket_value?: number;
  link?: string;
  tag?: EventTags;
  category?: string;
}

export type UpdateEventPayload = Partial<CreateEventPayload>;

export interface EventListParams {
  page?: number;
  page_size?: number;
  status?: EventStatus;
  event_type?: EventType;
  search?: string;
}
