import { describe, expect, it } from "vitest";
import { isPublicDashboardRoute } from "./public-routes";

describe("isPublicDashboardRoute", () => {
  it.each([
    "/dashboard/mujourney",
    "/dashboard/mujourney/MULEARN-1234",
    "/dashboard/search",
    "/dashboard/search/students",
    "/dashboard/search/mentors",
    "/dashboard/search/campuses",
    "/dashboard/interest-groups",
    "/dashboard/interest-groups/abc-123",
    "/dashboard/profile/some-slug",
  ])("returns true for public route %s", (path) => {
    expect(isPublicDashboardRoute(path)).toBe(true);
  });

  it.each([
    "/dashboard",
    "/dashboard/profile",
    "/dashboard/settings",
    "/dashboard/management/manage-interest-groups",
    "/dashboard/projects",
    "/login",
    "/dashboard/mujourneys",
  ])("returns false for non-public route %s", (path) => {
    expect(isPublicDashboardRoute(path)).toBe(false);
  });
});
