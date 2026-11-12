import { describe, expect, it } from "vitest";
import { ROLES } from "@/lib/auth/roles";
import { resolveTourKey } from "./resolve-tour-key";

describe("resolveTourKey", () => {
  it("returns null for Admin, even with other qualifying roles", () => {
    expect(resolveTourKey([ROLES.ADMIN])).toBeNull();
    expect(resolveTourKey([ROLES.ADMIN, ROLES.STUDENT])).toBeNull();
  });

  it("returns null for Associate", () => {
    expect(resolveTourKey([ROLES.ASSOCIATE])).toBeNull();
  });

  it("maps Zonal Campus Lead to zonal", () => {
    expect(resolveTourKey([ROLES.ZONAL_CAMPUS_LEAD])).toBe("zonal");
  });

  it("maps District Campus Lead to district", () => {
    expect(resolveTourKey([ROLES.DISTRICT_CAMPUS_LEAD])).toBe("district");
  });

  it("maps Campus Lead and Lead Enabler to campus", () => {
    expect(resolveTourKey([ROLES.CAMPUS_LEAD])).toBe("campus");
    expect(resolveTourKey([ROLES.LEAD_ENABLER])).toBe("campus");
  });

  it("maps Intern and Intern Lead to intern", () => {
    expect(resolveTourKey([ROLES.INTERN])).toBe("intern");
    expect(resolveTourKey([ROLES.INTERN_LEAD])).toBe("intern");
  });

  it("falls through Student, Pre Member, Fellow, IG Lead, Enabler to dashboard", () => {
    expect(resolveTourKey([ROLES.STUDENT])).toBe("dashboard");
    expect(resolveTourKey([ROLES.PRE_MEMBER])).toBe("dashboard");
    expect(resolveTourKey([ROLES.FELLOW])).toBe("dashboard");
    expect(resolveTourKey([ROLES.IG_LEAD])).toBe("dashboard");
    expect(resolveTourKey([ROLES.ENABLER])).toBe("dashboard");
  });

  it("maps Mentor to mentor", () => {
    expect(resolveTourKey([ROLES.MENTOR])).toBe("mentor");
  });

  it("maps Company to company", () => {
    expect(resolveTourKey([ROLES.COMPANY])).toBe("company");
  });

  it("prioritizes Mentor over Company when a user holds both", () => {
    expect(resolveTourKey([ROLES.MENTOR, ROLES.COMPANY])).toBe("mentor");
  });

  it("returns null for permission-scoped roles with no dashboard shell", () => {
    expect(resolveTourKey([ROLES.DISCORD_MODERATOR])).toBeNull();
    expect(resolveTourKey([ROLES.EX_OFFICIAL])).toBeNull();
    expect(resolveTourKey([ROLES.APPRAISER])).toBeNull();
    expect(resolveTourKey([ROLES.BOT_DEV])).toBeNull();
    expect(resolveTourKey([ROLES.TECH_TEAM])).toBeNull();
    expect(resolveTourKey([ROLES.CAMPUS_ACTIVATION_TEAM])).toBeNull();
    expect(resolveTourKey([ROLES.SUSPENDED])).toBeNull();
  });

  it("still resolves a tour when an unscoped role is combined with a member role", () => {
    expect(resolveTourKey([ROLES.DISCORD_MODERATOR, ROLES.STUDENT])).toBe(
      "dashboard",
    );
  });

  it("resolves dashboard for a dynamic per-IG lead role", () => {
    expect(resolveTourKey(["WEBDEV IGLead"])).toBe("dashboard");
  });

  it("prioritizes zonal/district/campus over intern when a user holds both", () => {
    expect(resolveTourKey([ROLES.INTERN, ROLES.ZONAL_CAMPUS_LEAD])).toBe(
      "zonal",
    );
    expect(resolveTourKey([ROLES.INTERN, ROLES.CAMPUS_LEAD])).toBe("campus");
  });
});
