import type { CreateEventSchema } from "../schemas";
import type {
  EventDetailManage,
  EventPatchBody,
  EventWriteBody,
} from "../types";
import { toISOWithOffset } from "./events.transforms";

export type ComparablePatchPayload = Omit<
  Partial<EventWriteBody>,
  "category" | "event_scope"
> & {
  category: string | null;
  event_scope: string | null;
};

export function eventEditSectionClassName(): string {
  return "space-y-4 rounded-2xl border border-border bg-card p-6 lc-card-shadow";
}

export function toEventFormData(
  payload: Record<string, unknown>,
  coverFile: File | null,
  bannerFile: File | null,
): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else if (typeof value === "boolean") {
      formData.append(key, value ? "true" : "false");
    } else if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  }

  if (coverFile) formData.append("cover_image", coverFile);
  if (bannerFile) formData.append("banner_image", bannerFile);
  return formData;
}

function normalizeTags(
  tags: string[] | Record<string, unknown> | null | undefined,
): string[] | null {
  if (!tags) return null;
  if (Array.isArray(tags)) {
    return tags.length > 0 ? [...tags].sort() : null;
  }
  const keys = Object.keys(tags);
  return keys.length > 0 ? keys.sort() : null;
}

function normalizeDateValue(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function valuesAreEqual(left: unknown, right: unknown): boolean {
  if (left === right) return true;

  const leftDate = normalizeDateValue(left);
  const rightDate = normalizeDateValue(right);
  if (leftDate !== null && rightDate !== null) {
    return leftDate === rightDate;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    return JSON.stringify(left) === JSON.stringify(right);
  }

  if (left && right && typeof left === "object" && typeof right === "object") {
    return JSON.stringify(left) === JSON.stringify(right);
  }

  return false;
}

export function buildComparableInitialPayload(
  currentEvent: EventDetailManage,
): ComparablePatchPayload {
  const organizer = currentEvent.organizer;
  const organizerType = organizer?.type ?? "admin";

  return {
    title: currentEvent.title,
    description: currentEvent.description,
    start_datetime: currentEvent.start_datetime,
    end_datetime: currentEvent.end_datetime,
    registration_url: currentEvent.registration_url,
    registration_deadline: currentEvent.registration_deadline,
    min_karma: currentEvent.min_karma,
    venue_type: currentEvent.venue.type,
    venue_address: currentEvent.venue.address,
    venue_city: currentEvent.venue.city,
    venue_maps_url: currentEvent.venue.maps_url,
    venue_online_link: currentEvent.venue.online_link,
    venue_platform: currentEvent.venue.platform,
    scope: currentEvent.scope,
    scope_org:
      currentEvent.scope === "campus"
        ? (currentEvent.scope_org?.id ?? null)
        : null,
    scope_ig:
      currentEvent.scope === "ig" ? (currentEvent.scope_ig?.id ?? null) : null,
    scope_ci_id:
      currentEvent.scope === "campus_ig"
        ? (currentEvent.scope_ci_id ?? null)
        : null,
    is_collaboration: currentEvent.is_collaboration,
    is_featured: currentEvent.is_featured,
    tags: normalizeTags(currentEvent.tags),
    organiser_type: organizerType,
    organiser_ig:
      organizerType === "global_ig" ? (organizer?.ig?.id ?? null) : null,
    organiser_org:
      organizerType === "campus"
        ? (organizer?.campus?.id ?? null)
        : organizerType === "company"
          ? (organizer?.company?.id ?? null)
          : null,
    organiser_ci_id:
      organizerType === "campus_ig"
        ? ((organizer?.campus_ig?.id ?? organizer?.campus_ig_id ?? null) as
            | string
            | null)
        : null,
    category: null, // Note: Omitted in detail response, resolved client-side
    event_type: currentEvent.event_type ?? null,
    event_scope: null, // Note: Omitted in detail response, resolved client-side
  } as ComparablePatchPayload;
}

export function buildChangedPatchPayload(
  nextPayload: ComparablePatchPayload,
  currentEvent: EventDetailManage,
): EventPatchBody {
  const previousPayload = buildComparableInitialPayload(currentEvent);
  const changedPayload: Record<string, unknown> = {};

  for (const [key, nextValue] of Object.entries(nextPayload)) {
    const previousValue = previousPayload[key as keyof ComparablePatchPayload];
    if (!valuesAreEqual(nextValue, previousValue)) {
      changedPayload[key] = nextValue;
    }
  }

  return changedPayload as EventPatchBody;
}

export function buildEventPatchPayload(values: CreateEventSchema) {
  const start = toISOWithOffset(values.start_datetime);
  const end = toISOWithOffset(values.end_datetime);
  const deadline = values.registration_deadline
    ? toISOWithOffset(values.registration_deadline as unknown as string)
    : null;

  const patchPayload: ComparablePatchPayload = {
    title: values.title,
    description: values.description,
    start_datetime: start ?? undefined,
    end_datetime: end ?? undefined,
    registration_url: values.registration_url,
    registration_deadline: deadline,
    min_karma: values.min_karma,
    venue_type: values.venue_type,
    venue_address: values.address,
    venue_city: values.city,
    venue_maps_url: values.maps_url,
    venue_online_link: values.online_link,
    venue_platform: values.platform,
    scope: values.scope,
    scope_org: values.scope === "campus" ? values.target_campus_id : null,
    scope_ig: values.scope === "ig" ? values.target_ig_id : null,
    scope_ci_id:
      values.scope === "campus_ig" ? values.target_campus_ig_id : null,
    is_collaboration: values.is_collaboration,
    is_featured: values.is_featured,
    tags: values.tags && values.tags.length > 0 ? values.tags : null,
    category: values.category || null,
    event_type: values.event_type || null,
    event_scope: values.event_scope || null,
  };

  return { start, end, deadline, patchPayload };
}
