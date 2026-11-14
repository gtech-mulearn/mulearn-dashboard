import { describe, expect, it } from "vitest";
import { ROLES } from "@/lib/auth/roles";
import type { TourStep, TourStepContext } from "../types";
import { buildSteps } from "./build-steps";

function ctx(overrides: Partial<TourStepContext> = {}): TourStepContext {
  return {
    roles: [],
    can: () => false,
    isMentorVerified: false,
    isCompanyVerified: false,
    ...overrides,
  };
}

const steps: TourStep[] = [
  { id: "open", navId: "home", title: "Home", description: "" },
  {
    id: "mentor-only",
    navId: "mentor-mentees",
    title: "Mentees",
    description: "",
    requiresRole: [ROLES.MENTOR],
  },
  {
    id: "mentor-verified-only",
    navId: "mentor-sessions",
    title: "Sessions",
    description: "",
    requiresRole: [ROLES.MENTOR],
    requiresFlag: (c) => c.isMentorVerified,
  },
  {
    id: "events",
    navId: "manage-events",
    title: "Manage Events",
    description: "",
    requiresFlag: (c) => c.can("events:manage"),
  },
  {
    id: "talent-pool",
    navId: "talent-pool",
    title: "Talent Pool",
    description: "",
    requiresRole: [ROLES.MENTOR, ROLES.COMPANY],
  },
  {
    id: "company-jobs",
    navId: "company-jobs",
    title: "Job Management",
    description: "",
    requiresRole: [ROLES.COMPANY],
  },
];

describe("buildSteps", () => {
  it("keeps steps with no gate", () => {
    const result = buildSteps(steps, ctx());
    expect(result.map((s) => s.id)).toEqual(["open"]);
  });

  it("filters by requiresRole", () => {
    const result = buildSteps(steps, ctx({ roles: [ROLES.MENTOR] }));
    expect(result.map((s) => s.id)).toEqual([
      "open",
      "mentor-only",
      "talent-pool",
    ]);
  });

  it("filters by requiresRole AND requiresFlag combined", () => {
    const result = buildSteps(
      steps,
      ctx({ roles: [ROLES.MENTOR], isMentorVerified: true }),
    );
    expect(result.map((s) => s.id)).toContain("mentor-verified-only");

    const unverified = buildSteps(steps, ctx({ roles: [ROLES.MENTOR] }));
    expect(unverified.map((s) => s.id)).not.toContain("mentor-verified-only");
  });

  it("filters requiresFlag-only steps via the permission predicate", () => {
    const result = buildSteps(
      steps,
      ctx({ roles: [ROLES.CAMPUS_LEAD], can: () => true }),
    );
    expect(result.map((s) => s.id)).toContain("events");
  });

  it("skips company-restricted steps for an unverified company account", () => {
    const result = buildSteps(
      steps,
      ctx({ roles: [ROLES.COMPANY], isCompanyVerified: false }),
    );
    expect(result.map((s) => s.id)).not.toContain("talent-pool");
    expect(result.map((s) => s.id)).not.toContain("company-jobs");
  });

  it("includes company-restricted steps once verified", () => {
    const result = buildSteps(
      steps,
      ctx({ roles: [ROLES.COMPANY], isCompanyVerified: true }),
    );
    expect(result.map((s) => s.id)).toContain("talent-pool");
    expect(result.map((s) => s.id)).toContain("company-jobs");
  });
});
