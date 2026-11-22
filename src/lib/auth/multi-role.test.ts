import { beforeEach, describe, expect, it, vi } from "vitest";

// Users hold several roles at once: access is the union of every role they hold.

const serverGet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === "refreshToken" ? { value: "r" } : undefined,
  }),
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));
vi.mock("@/api/server", () => ({
  serverApiClient: { get: (...args: unknown[]) => serverGet(...args) },
}));

import { hasAnyRole, hasPermission } from "./permissions";
import { ROLES } from "./roles";
import { requireRole } from "./server";

describe("hasAnyRole with several roles", () => {
  it("allows when any one of the user's roles is allowed", () => {
    expect(
      hasAnyRole(
        [ROLES.STUDENT, ROLES.MENTOR, ROLES.CAMPUS_LEAD],
        [ROLES.MENTOR],
      ),
    ).toBe(true);
    expect(
      hasAnyRole([ROLES.STUDENT, ROLES.MENTOR], [ROLES.ADMIN, ROLES.MENTOR]),
    ).toBe(true);
  });

  it("denies when none of the user's roles is allowed", () => {
    expect(
      hasAnyRole([ROLES.STUDENT, ROLES.MENTOR], [ROLES.ADMIN, ROLES.COMPANY]),
    ).toBe(false);
  });
});

describe("hasPermission with several roles", () => {
  it("grants a permission held through any one role", () => {
    expect(hasPermission([ROLES.STUDENT, ROLES.ENABLER], "campus:manage")).toBe(
      true,
    );
  });

  it("refuses a permission none of the roles holds", () => {
    expect(hasPermission([ROLES.STUDENT, ROLES.MENTOR], "campus:manage")).toBe(
      false,
    );
  });
});

describe("requireRole with several roles", () => {
  beforeEach(() => serverGet.mockReset());

  it("lets the page render when any one of the user's roles is allowed", async () => {
    serverGet.mockResolvedValue({ roles: [ROLES.STUDENT, ROLES.MENTOR] });
    await expect(
      requireRole([ROLES.ADMIN, ROLES.MENTOR]),
    ).resolves.toMatchObject({
      roles: [ROLES.STUDENT, ROLES.MENTOR],
    });
  });

  it("redirects to the dashboard when none of the user's roles is allowed", async () => {
    serverGet.mockResolvedValue({ roles: [ROLES.STUDENT, ROLES.ENABLER] });
    await expect(requireRole([ROLES.MENTOR, ROLES.COMPANY])).rejects.toThrow(
      "REDIRECT /dashboard?unauthorized=true",
    );
  });
});
