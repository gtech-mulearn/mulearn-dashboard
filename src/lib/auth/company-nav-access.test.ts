import { describe, expect, it } from "vitest";
import {
  type CompanyAccessRole,
  canOpenCompanyPage,
} from "@/features/company-jobs/lib/company-access";
import {
  type DynamicNavContext,
  isCompanyFeatureItem,
  NAV_ITEMS,
  type NavItem,
} from "../nav-config";
import { ROLES } from "./roles";

// Mirrors useFilteredNav's visibility rules for role and dynamic checks.
function isVisible(
  item: NavItem,
  roles: string[],
  context: DynamicNavContext,
): boolean {
  if (item.roles && item.roles.length > 0) {
    const hasRole = item.roles.some((r) => roles.includes(r));
    if (item.dynamicCheck) return item.dynamicCheck(roles, context);
    return hasRole;
  }
  if (item.dynamicCheck) return item.dynamicCheck(roles, context);
  return true;
}

const byId = (id: string) =>
  NAV_ITEMS.find((item) => item.id === id) as NavItem;

function visibleCompanyIds(
  roles: string[],
  companyAccess: CompanyAccessRole | null,
): string[] {
  return NAV_ITEMS.filter(isCompanyFeatureItem)
    .filter((item) => isVisible(item, roles, { companyAccess }))
    .map((item) => item.id)
    .sort();
}

describe("company navigation (release 1.91 access model)", () => {
  it("gives the owner every company entry", () => {
    expect(visibleCompanyIds([ROLES.COMPANY], "owner")).toEqual(
      [
        "company-admins",
        "company-analytics",
        "company-collaborations",
        "company-feedback",
        "company-ig-requests",
        "company-ig-sponsorship",
        "company-jobs",
        "company-mentors",
        "company-problem-statements",
        "company-tasks",
        "company-templates",
        "talent-pool",
      ].sort(),
    );
  });

  it("shows a co-admin (no Company role) everything except owner-only entries", () => {
    const ids = visibleCompanyIds([ROLES.STUDENT], "co_admin");
    expect(ids).toContain("company-admins");
    expect(ids).toContain("company-collaborations");
    expect(ids).toContain("company-jobs");
    expect(ids).not.toContain("company-ig-requests");
    expect(ids).not.toContain("company-problem-statements");
  });

  it("limits a company mentor to jobs, tasks, analytics, feedback and talent", () => {
    expect(visibleCompanyIds([ROLES.MENTOR], "company_mentor")).toEqual(
      [
        "company-analytics",
        "company-feedback",
        "company-jobs",
        "company-tasks",
        "talent-pool",
      ].sort(),
    );
  });

  it("hides company entries, including the talent pool, from everyone else", () => {
    expect(visibleCompanyIds([ROLES.MENTOR], null)).toEqual([]);
    expect(visibleCompanyIds([ROLES.STUDENT], null)).toEqual([]);
  });

  it("never links to a company page the page gate would refuse", () => {
    const roles: (CompanyAccessRole | null)[] = [
      "owner",
      "co_admin",
      "company_mentor",
      null,
    ];
    for (const item of NAV_ITEMS) {
      if (!item.href.startsWith("/dashboard/company")) continue;
      for (const role of roles) {
        const userRoles = role === "owner" ? [ROLES.COMPANY] : [ROLES.STUDENT];
        expect(
          isVisible(item, userRoles, { companyAccess: role }),
          `${item.id} as ${role}`,
        ).toBe(canOpenCompanyPage(item.href, role));
      }
    }
  });

  it("marks only company entries as lockable before verification", () => {
    expect(isCompanyFeatureItem(byId("company-jobs"))).toBe(true);
    expect(isCompanyFeatureItem(byId("talent-pool"))).toBe(true);
    expect(isCompanyFeatureItem(byId("mentor-sessions"))).toBe(false);
  });
});
