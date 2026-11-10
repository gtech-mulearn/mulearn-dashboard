import { isSafeRedirectUrl } from "../schemas/notification.schema";

export interface NotificationLinkInput {
  type: string;
  entity_type: string | null;
  entity_id: string | null;
  redirect_url?: string | null;
}

export interface NotificationLink {
  href: string;
  /** Opens in a new tab: an https URL on another origin. */
  external: boolean;
}

// Approval and collaboration notices land on the organiser's manage view.
const MANAGE_EVENT_TYPES = new Set([
  "ADMIN_EVENT_PENDING",
  "CAMPUS_EVENT_PENDING",
  "MENTOR_EVENT_PENDING",
  "EVENT_APPROVAL_STAGE",
  "EVENT_REJECTED",
  "EVENT_PUBLISHED",
]);

/** Only relative or https URLs; same-origin absolute URLs become paths. */
function fromRedirectUrl(url: string, origin: string): NotificationLink | null {
  if (!isSafeRedirectUrl(url)) return null;
  if (url.startsWith("/")) return { href: url, external: false };
  const parsed = new URL(url);
  if (parsed.origin === origin) {
    return {
      href: `${parsed.pathname}${parsed.search}${parsed.hash}`,
      external: false,
    };
  }
  return { href: url, external: true };
}

/**
 * Typed notifications (release 1.91) carry entity_type/entity_id and no
 * redirect_url; this maps them to the page that acts on them.
 */
function fromType({
  type,
  entity_type,
  entity_id,
}: NotificationLinkInput): string | null {
  const id = entity_id ? encodeURIComponent(entity_id) : null;
  const withId = (base: string) => (id ? `${base}/${id}` : base);

  if (type === "ADMIN_COMPANY_PENDING") {
    return "/dashboard/management/manage-companies";
  }
  if (
    MANAGE_EVENT_TYPES.has(type) ||
    type.startsWith("EVENT_CO_OWNER_") ||
    type.startsWith("EVENT_COLLAB_")
  ) {
    return withId("/dashboard/manage-events");
  }
  if (type === "EVENT_CANCELLED") return withId("/dashboard/events");
  // The revoked co-admin no longer has company access.
  if (type === "COMPANY_DELEGATE_REVOKED") return "/dashboard";
  // A rejected registration is fixed and resubmitted from the profile form.
  if (type === "COMPANY_REJECTED") return "/dashboard/company/profile/edit";
  if (type === "JOB_APPLICATION_STATUS") return "/dashboard/jobs";
  if (type === "COMPANY_MENTOR_APPLICATION_SUBMITTED") {
    return "/dashboard/company/mentors";
  }

  switch (entity_type) {
    case "learning_circle":
      return withId("/dashboard/learning-circle");
    case "company_admin_link":
      return "/dashboard/company/admin";
    case "company":
      return type.startsWith("COMPANY_DELEGATE_")
        ? "/dashboard/company/admin"
        : "/dashboard/company";
    case "mentor_application":
      return "/dashboard";
    case "job":
      return withId("/dashboard/company/jobs");
    case "job_application":
      return "/dashboard/jobs";
    case "karma_activity_log":
      return "/dashboard/profile";
    case "media_content":
      return "/dashboard/weekly-twitches";
    default:
      return null;
  }
}

/**
 * Where a notification's "View" link goes. A safe redirect_url wins; an
 * unsafe one is never rendered and the typed link is used instead. Unknown
 * types without a URL get no link.
 */
export function resolveNotificationHref(
  item: NotificationLinkInput,
  origin: string,
): NotificationLink | null {
  const url = item.redirect_url?.trim();
  if (url) {
    const link = fromRedirectUrl(url, origin);
    if (link) return link;
  }
  const href = fromType(item);
  return href ? { href, external: false } : null;
}
