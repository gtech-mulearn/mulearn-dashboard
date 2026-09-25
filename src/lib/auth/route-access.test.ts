import { describe, expect, it } from "vitest";
import { ADMIN_ROLES } from "./roles";
import { findRouteConfig } from "./route-access";

// The unified Role Verification page is Admin-only (spec D3). Every route
// that leads into it must be too, or Fellows land on a page whose APIs all
// refuse them.
describe.each([
  "/dashboard/management/verification",
  "/dashboard/management/role-verification",
  "/dashboard/management/mentor-verification",
  "/dashboard/management/organizations/verify",
  "/dashboard/management/manage-companies",
])("%s", (path) => {
  it("is Admin-only", () => {
    expect(findRouteConfig(path)?.roles).toEqual(ADMIN_ROLES);
  });
});
