import { describe, expect, it } from "vitest";
import { NAV_ITEMS, type NavItem } from "../nav-config";
import { hasIgLeadRole, ROLES } from "./roles";
import { findRouteConfig } from "./route-access";

const EDIT_IG = "/dashboard/edit-ig";

const igNavItem = NAV_ITEMS.find((item) => item.href === EDIT_IG) as NavItem;

/**
 * Mirrors the role branch of use-filtered-nav, which returns `dynamicCheck`
 * whenever it is set — regardless of whether `roles` matched.
 */
function navVisible(item: NavItem, roles: string[]): boolean {
  if (item.dynamicCheck) return item.dynamicCheck(roles, {});
  if (item.roles && item.roles.length > 0) {
    return item.roles.some((role) => roles.includes(role));
  }
  return true;
}

/** Mirrors the middleware's rule in proxy.ts (static OR dynamic). */
function routeAllowed(pathname: string, roles: string[]): boolean {
  const config = findRouteConfig(pathname);
  if (!config || config.roles.length === 0) return true;

  return (
    config.roles.some((role) => roles.includes(role)) ||
    (config.dynamicCheck?.(roles) ?? false)
  );
}

const ADMIN = [ROLES.ADMIN];
const STATIC_IG_LEAD = [ROLES.IG_LEAD];
const DYNAMIC_IG_LEAD = ["WEBDEV IGLead"];
const MEMBER = [ROLES.STUDENT];

describe("interest group access", () => {
  it("treats the static IG Lead role as distinct from per-IG lead roles", () => {
    // "IG Lead" does not end with " IGLead" — they are different strings.
    expect(hasIgLeadRole(STATIC_IG_LEAD)).toBe(false);
    expect(hasIgLeadRole(DYNAMIC_IG_LEAD)).toBe(true);
  });

  it.each([
    ["admin", ADMIN],
    ["static IG Lead", STATIC_IG_LEAD],
    ["per-IG lead", DYNAMIC_IG_LEAD],
  ])("shows the sidebar entry to %s", (_who, roles) => {
    expect(navVisible(igNavItem, roles as string[])).toBe(true);
  });

  it.each([
    ["admin", ADMIN],
    ["static IG Lead", STATIC_IG_LEAD],
    ["per-IG lead", DYNAMIC_IG_LEAD],
  ])("grants route access to %s", (_who, roles) => {
    expect(routeAllowed(EDIT_IG, roles as string[])).toBe(true);
  });

  it("hides it from an ordinary member", () => {
    expect(navVisible(igNavItem, MEMBER)).toBe(false);
    expect(routeAllowed(EDIT_IG, MEMBER)).toBe(false);
  });

  it("never shows a nav entry the middleware would redirect away from", () => {
    for (const roles of [
      ADMIN,
      STATIC_IG_LEAD,
      DYNAMIC_IG_LEAD,
      MEMBER,
      [],
    ] as string[][]) {
      expect(navVisible(igNavItem, roles)).toBe(routeAllowed(EDIT_IG, roles));
    }
  });
});
