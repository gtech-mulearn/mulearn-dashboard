import { describe, expect, it } from "vitest";
import { resolveNotificationHref } from "./notification-href";

const O = "https://app.mulearn.org";
const item = (
  type: string,
  entity_type: string | null = null,
  entity_id: string | null = null,
  redirect_url: string | null = null,
) => ({ type, entity_type, entity_id, redirect_url });

describe("resolveNotificationHref", () => {
  it("deep-links typed notifications by entity", () => {
    expect(
      resolveNotificationHref(
        item("LC_JOIN_APPROVED", "learning_circle", "c1"),
        O,
      ),
    ).toEqual({ href: "/dashboard/learning-circle/c1", external: false });
    expect(
      resolveNotificationHref(item("EVENT_REJECTED", "event", "e1"), O)?.href,
    ).toBe("/dashboard/manage-events/e1");
    expect(
      resolveNotificationHref(item("EVENT_CANCELLED", "event", "e1"), O)?.href,
    ).toBe("/dashboard/events/e1");
    expect(
      resolveNotificationHref(item("JOB_NEEDS_REVISION", "job", "j1"), O)?.href,
    ).toBe("/dashboard/company/jobs/j1");
    expect(
      resolveNotificationHref(
        item("JOB_APPLICATION_STATUS", "job_application", "a1"),
        O,
      )?.href,
    ).toBe("/dashboard/jobs");
    expect(
      resolveNotificationHref(
        item("KARMA_AWARDED", "karma_activity_log", "k1"),
        O,
      )?.href,
    ).toBe("/dashboard/profile");
    expect(
      resolveNotificationHref(
        item("OFFICE_HOURS_ANNOUNCED", "media_content", "m1"),
        O,
      )?.href,
    ).toBe("/dashboard/weekly-twitches");
    expect(
      resolveNotificationHref(
        item("ADMIN_COMPANY_PENDING", "company", "co1"),
        O,
      )?.href,
    ).toBe("/dashboard/management/manage-companies");
    expect(
      resolveNotificationHref(
        item("COMPANY_MENTOR_APPLICATION_SUBMITTED", "mentor_application", "x"),
        O,
      )?.href,
    ).toBe("/dashboard/company/mentors");
  });

  it("sends company delegate notices to the co-admin page", () => {
    expect(
      resolveNotificationHref(
        item("COMPANY_DELEGATE_INVITED", "company_admin_link", "co1"),
        O,
      )?.href,
    ).toBe("/dashboard/company/admin");
  });

  it("returns null for an unknown type with no URL", () => {
    expect(resolveNotificationHref(item("X"), O)).toBeNull();
  });

  it("prefers a redirect_url and keeps same-origin links internal", () => {
    expect(
      resolveNotificationHref(
        item("LEGACY", null, null, `${O}/dashboard/jobs`),
        O,
      ),
    ).toEqual({ href: "/dashboard/jobs", external: false });
    expect(
      resolveNotificationHref(
        item("LC_INVITE", "learning_circle", "c1", "/dashboard/jobs?x=1"),
        O,
      ),
    ).toEqual({ href: "/dashboard/jobs?x=1", external: false });
    expect(
      resolveNotificationHref(
        item("LEGACY", null, null, "https://mulearn.org/x"),
        O,
      ),
    ).toEqual({ href: "https://mulearn.org/x", external: true });
  });

  it("refuses unsafe URLs", () => {
    expect(
      resolveNotificationHref(
        item("LEGACY", null, null, "javascript:alert(1)"),
        O,
      ),
    ).toBeNull();
    expect(
      resolveNotificationHref(item("LEGACY", null, null, "//evil.com"), O),
    ).toBeNull();
    expect(
      resolveNotificationHref(item("LEGACY", null, null, "http://evil.com"), O),
    ).toBeNull();
  });
});

describe("resolveNotificationHref — action-specific targets", () => {
  it("sends a rejected company to its registration form", () => {
    expect(
      resolveNotificationHref(item("COMPANY_REJECTED", "company", "co1"), O)
        ?.href,
    ).toBe("/dashboard/company/profile/edit");
  });

  it("sends a revoked co-admin home, not to a page they can't open", () => {
    expect(
      resolveNotificationHref(
        item("COMPANY_DELEGATE_REVOKED", "company_admin_link", "co1"),
        O,
      )?.href,
    ).toBe("/dashboard");
  });

  it("falls back to the typed link when redirect_url is unsafe", () => {
    expect(
      resolveNotificationHref(
        item("LC_INVITE", "learning_circle", "c1", "javascript:alert(1)"),
        O,
      ),
    ).toEqual({ href: "/dashboard/learning-circle/c1", external: false });
  });
});
