import { describe, expect, it } from "vitest";
import { ROLES } from "@/lib/auth/roles";
import { findRouteConfig } from "@/lib/auth/route-access";
import {
  COMPANY_CAPABILITIES,
  canOpenCompanyPage,
  resolveCompanyAccess,
} from "./company-access";

describe("resolveCompanyAccess", () => {
  it("treats the Company role holder as the owner", () => {
    expect(
      resolveCompanyAccess({
        hasCompanyRole: true,
        canListAdminLinks: true,
        hasCompanyProfile: true,
      }),
    ).toBe("owner");
  });

  it("recognises an accepted co-admin (no Company role)", () => {
    expect(
      resolveCompanyAccess({
        hasCompanyRole: false,
        canListAdminLinks: true,
        hasCompanyProfile: true,
      }),
    ).toBe("co_admin");
  });

  it("recognises a company mentor", () => {
    expect(
      resolveCompanyAccess({
        hasCompanyRole: false,
        canListAdminLinks: false,
        hasCompanyProfile: true,
      }),
    ).toBe("company_mentor");
  });

  it("returns null without profile access", () => {
    expect(
      resolveCompanyAccess({
        hasCompanyRole: false,
        canListAdminLinks: false,
        hasCompanyProfile: false,
      }),
    ).toBeNull();
  });
});

describe("COMPANY_CAPABILITIES (mirrors backend permission checks)", () => {
  it("gives the owner everything except leaving", () => {
    expect(COMPANY_CAPABILITIES.owner.editProfile).toBe(true);
    expect(COMPANY_CAPABILITIES.owner.manageAdmins).toBe(true);
    expect(COMPANY_CAPABILITIES.owner.leaveAsAdmin).toBe(false);
  });

  it("keeps owner-only actions away from co-admins", () => {
    const co = COMPANY_CAPABILITIES.co_admin;
    expect(co.manageAdmins).toBe(false);
    expect(co.editProfile).toBe(false);
    expect(co.deactivateCompany).toBe(false);
    expect(co.manageProblemStatements).toBe(false);
    expect(co.leaveAsAdmin).toBe(true);
    expect(co.approveJobs).toBe(true);
  });

  it("limits company mentors to creating and viewing", () => {
    const mentor = COMPANY_CAPABILITIES.company_mentor;
    expect(mentor.createJobs).toBe(true);
    expect(mentor.createTasks).toBe(true);
    expect(mentor.viewTalentPool).toBe(true);
    expect(mentor.approveJobs).toBe(false);
    expect(mentor.editTasks).toBe(false);
    expect(mentor.manageCollaborations).toBe(false);
  });
});

describe("company route gating", () => {
  it("lets any signed-in user reach company pages (checked client-side)", () => {
    expect(findRouteConfig("/dashboard/company/jobs")?.roles).toEqual([]);
    expect(findRouteConfig("/dashboard/company/admin")?.roles).toEqual([]);
  });

  it("keeps owner-only pages behind the Company role", () => {
    expect(findRouteConfig("/dashboard/company/profile/edit")?.roles).toEqual([
      ROLES.COMPANY,
    ]);
    expect(findRouteConfig("/dashboard/company/ig-requests")?.roles).toEqual([
      ROLES.COMPANY,
    ]);
    expect(
      findRouteConfig("/dashboard/manage-problem-statements")?.roles,
    ).toEqual([ROLES.ADMIN, ROLES.COMPANY]);
  });
});

describe("canOpenCompanyPage", () => {
  it("needs a company relationship", () => {
    expect(canOpenCompanyPage("/dashboard/company", null)).toBe(false);
    expect(canOpenCompanyPage("/dashboard/company/jobs", null)).toBe(false);
  });

  it("lets any company member open the overview", () => {
    expect(canOpenCompanyPage("/dashboard/company", "company_mentor")).toBe(
      true,
    );
  });

  it("checks nested pages against their section", () => {
    expect(
      canOpenCompanyPage("/dashboard/company/jobs/42/edit", "company_mentor"),
    ).toBe(true);
    expect(
      canOpenCompanyPage("/dashboard/company/collaborations", "company_mentor"),
    ).toBe(false);
    expect(
      canOpenCompanyPage("/dashboard/company/admin", "company_mentor"),
    ).toBe(false);
    expect(
      canOpenCompanyPage("/dashboard/company/mentors", "company_mentor"),
    ).toBe(false);
  });

  it("lets co-admins open the admin page (to leave) but not owner pages", () => {
    expect(canOpenCompanyPage("/dashboard/company/admin", "co_admin")).toBe(
      true,
    );
    expect(
      canOpenCompanyPage("/dashboard/company/profile/edit", "co_admin"),
    ).toBe(false);
    expect(
      canOpenCompanyPage("/dashboard/company/ig-requests", "co_admin"),
    ).toBe(false);
    expect(canOpenCompanyPage("/dashboard/company/ig-requests", "owner")).toBe(
      true,
    );
  });

  it("matches whole path segments only", () => {
    expect(
      canOpenCompanyPage("/dashboard/company/administrators", "company_mentor"),
    ).toBe(true);
  });
});
