/**
 * Backend paths the events feature calls.
 *
 * 📍 src/features/events/api/paths.ts
 *
 * Moved here from src/api/endpoints.ts. Paths that code outside the feature also
 * uses stay in src/api/endpoints.ts and are referenced from there.
 */
import { endpoints } from "@/api";

export const eventPaths = {
  base: "/api/v1/dashboard/events/",
  featured: "/api/v1/dashboard/events/featured/",
  public: {
    base: "/api/v1/public/events/",
    featured: "/api/v1/public/events/featured/",
  },
  manage: "/api/v1/dashboard/events/manage/",
  myInvites: "/api/v1/dashboard/events/my-invites/",
  // The notification feature uses this path too, so it stays in src/api/endpoints.ts.
  admin: endpoints.events.admin,
  // admin, mentor, campus and company are also reached as eventPaths[tier]
  // (ApprovalTier in ../lib/events.policy.ts), so keep these key names.
  mentor: "/api/v1/dashboard/events/mentor/",
  ig: "/api/v1/dashboard/events/ig/",
  campus: "/api/v1/dashboard/events/campus/",
  campusIg: "/api/v1/dashboard/events/campus-ig/",
  company: "/api/v1/dashboard/events/company/",
  eventTypeScope: "/api/v1/dashboard/events/meta/event-type-scope/",
  meta: {
    organizerOptions: "/api/v1/dashboard/events/meta/organizer-options/",
    collaborationTargets:
      "/api/v1/dashboard/events/meta/collaboration-targets/",
    categories: "/api/v1/dashboard/events/meta/categories/",
  },
} as const;
