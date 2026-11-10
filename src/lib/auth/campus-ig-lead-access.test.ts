import { describe, expect, it } from "vitest";
import { DYNAMIC_PERMISSION_CHECKS } from "./permissions";
import {
  hasIgCampusLeadRole,
  igCampusLeadRole,
  isIgCampusLeadRole,
  ROLES,
} from "./roles";
import { findRouteConfig } from "./route-access";

/** Mirrors the middleware's rule in proxy.ts (static OR dynamic). */
function routeAllowed(pathname: string, roles: string[]): boolean {
  const config = findRouteConfig(pathname);
  if (!config || config.roles.length === 0) return true;
  return (
    config.roles.some((role) => roles.includes(role)) ||
    (config.dynamicCheck?.(roles) ?? false)
  );
}

const MANAGE_EVENTS = "/dashboard/manage-events";

describe("IG campus lead role (renamed in release 1.91)", () => {
  it("lets a {code} CampusIGLead open Manage Events", () => {
    expect(routeAllowed(MANAGE_EVENTS, ["WEBDEV CampusIGLead"])).toBe(true);
  });

  it("still accepts the pre-1.91 {code} CampusLead title from older tokens", () => {
    expect(routeAllowed(MANAGE_EVENTS, ["WEBDEV CampusLead"])).toBe(true);
  });

  it("does not treat the co-lead as an event manager (backend parity)", () => {
    expect(routeAllowed(MANAGE_EVENTS, ["WEBDEV CampusIGCoLead"])).toBe(false);
  });

  it("keeps Manage Events closed to ordinary learners", () => {
    expect(routeAllowed(MANAGE_EVENTS, [ROLES.STUDENT])).toBe(false);
  });

  it.each([
    "events:manage",
    "events:manage_co_owners",
    "events:accept_collaboration",
    "events:reject_collaboration",
  ] as const)("grants %s to a CampusIGLead", (permission) => {
    expect(DYNAMIC_PERMISSION_CHECKS[permission]?.(["AI CampusIGLead"])).toBe(
      true,
    );
  });

  it("builds the role title the backend now creates", () => {
    expect(igCampusLeadRole("WEBDEV")).toBe("WEBDEV CampusIGLead");
  });

  it("does not confuse the core 'Campus Lead' role (with a space)", () => {
    expect(isIgCampusLeadRole("Campus Lead")).toBe(false);
    expect(hasIgCampusLeadRole([ROLES.CAMPUS_LEAD])).toBe(false);
  });

  it("detects an IG campus lead among other roles", () => {
    expect(hasIgCampusLeadRole([ROLES.STUDENT, "AI CampusIGLead"])).toBe(true);
  });
});
