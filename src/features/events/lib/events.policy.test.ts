import { describe, expect, it } from "vitest";
import { ROLES } from "@/lib/auth/roles";
import {
  approvalContextFor,
  canApproveStatus,
  resolveApprovalTier,
} from "./events.policy";

describe("resolveApprovalTier", () => {
  it("routes a company event awaiting its first approval to the company tier", () => {
    expect(resolveApprovalTier("pending_mentor_approval", "company")).toBe(
      "company",
    );
  });

  it("keeps IG events at the mentor tier", () => {
    expect(resolveApprovalTier("pending_mentor_approval", "global_ig")).toBe(
      "mentor",
    );
  });

  it("maps campus and admin stages regardless of organiser", () => {
    expect(resolveApprovalTier("pending_campus_approval")).toBe("campus");
    expect(resolveApprovalTier("pending_approval", "company")).toBe("admin");
  });

  it("has no tier once an event is past approval", () => {
    expect(resolveApprovalTier("published")).toBeNull();
  });
});

describe("approvalContextFor", () => {
  it("reads the organiser from either field shape the API sends", () => {
    expect(
      approvalContextFor({ type: "company", company: { id: "org1" } }, [
        "org1",
      ]),
    ).toEqual({
      organiserType: "company",
      organiserOrgId: "org1",
      manageableCompanyOrgIds: ["org1"],
    });
    expect(
      approvalContextFor(
        { organiser_type: "company", organiser_company: { id: "org2" } },
        [],
      ),
    ).toMatchObject({ organiserType: "company", organiserOrgId: "org2" });
  });

  it("copes with a missing organiser", () => {
    expect(approvalContextFor(undefined, [])).toMatchObject({
      organiserType: null,
      organiserOrgId: null,
    });
  });
});

describe("canApproveStatus", () => {
  const companyCtx = {
    organiserType: "company",
    organiserOrgId: "org1",
    manageableCompanyOrgIds: ["org1"],
  };

  it("lets the company's owner or co-admin approve its event", () => {
    expect(
      canApproveStatus(
        "pending_mentor_approval",
        [ROLES.COMPANY],
        false,
        companyCtx,
      ),
    ).toBe(true);
  });

  it("does not let a platform admin act at the company tier", () => {
    expect(
      canApproveStatus("pending_mentor_approval", [ROLES.ADMIN], true, {
        ...companyCtx,
        manageableCompanyOrgIds: [],
      }),
    ).toBe(false);
  });

  it("does not let an unrelated mentor approve a company event", () => {
    expect(
      canApproveStatus("pending_mentor_approval", [ROLES.MENTOR], false, {
        ...companyCtx,
        manageableCompanyOrgIds: [],
      }),
    ).toBe(false);
  });

  it("still lets mentors act on IG events", () => {
    expect(
      canApproveStatus("pending_mentor_approval", [ROLES.MENTOR], false, {
        organiserType: "global_ig",
      }),
    ).toBe(true);
  });

  it("keeps the admin stage for admins", () => {
    expect(canApproveStatus("pending_approval", [ROLES.ADMIN], false)).toBe(
      true,
    );
  });
});
