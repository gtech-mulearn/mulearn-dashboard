import { describe, expect, it } from "vitest";
import { endpoints } from "@/api";
import { eventPaths } from "./paths";

describe("eventPaths", () => {
  it("keeps every events URL exactly as it was in src/api/endpoints.ts", () => {
    expect(eventPaths).toMatchInlineSnapshot(`
      {
        "admin": "/api/v1/dashboard/events/admin/",
        "base": "/api/v1/dashboard/events/",
        "campus": "/api/v1/dashboard/events/campus/",
        "campusIg": "/api/v1/dashboard/events/campus-ig/",
        "company": "/api/v1/dashboard/events/company/",
        "eventTypeScope": "/api/v1/dashboard/events/meta/event-type-scope/",
        "featured": "/api/v1/dashboard/events/featured/",
        "ig": "/api/v1/dashboard/events/ig/",
        "manage": "/api/v1/dashboard/events/manage/",
        "mentor": "/api/v1/dashboard/events/mentor/",
        "meta": {
          "categories": "/api/v1/dashboard/events/meta/categories/",
          "collaborationTargets": "/api/v1/dashboard/events/meta/collaboration-targets/",
          "organizerOptions": "/api/v1/dashboard/events/meta/organizer-options/",
        },
        "myInvites": "/api/v1/dashboard/events/my-invites/",
        "public": {
          "base": "/api/v1/public/events/",
          "featured": "/api/v1/public/events/featured/",
        },
      }
    `);
  });

  it("leaves only the path other features use in src/api/endpoints.ts", () => {
    expect(endpoints.events).toEqual({
      admin: "/api/v1/dashboard/events/admin/",
    });
    expect(eventPaths.admin).toBe(endpoints.events.admin);
  });
});
