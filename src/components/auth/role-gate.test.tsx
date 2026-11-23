import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ROLES } from "@/lib/auth/roles";

// Users hold several roles at once: RoleGate shows its content if ANY role allows it.

let roles: string[] = [];
vi.mock("@/lib/auth/use-user-info", () => ({
  useUserInfo: () => ({ data: { roles }, isLoading: false }),
}));

import { RoleGate } from "./role-gate";

function gate(
  userRoles: string[],
  props: Partial<Parameters<typeof RoleGate>[0]>,
) {
  roles = userRoles;
  return render(
    <RoleGate fallback={<span>denied</span>} {...props}>
      <span>allowed</span>
    </RoleGate>,
  );
}

describe("RoleGate with several roles", () => {
  it("shows the content when any one of the user's roles is allowed", () => {
    gate([ROLES.STUDENT, ROLES.MENTOR], {
      allowedRoles: [ROLES.ADMIN, ROLES.MENTOR],
    });
    expect(screen.getByText("allowed")).toBeInTheDocument();
  });

  it("shows the fallback when none of the user's roles is allowed", () => {
    gate([ROLES.STUDENT, ROLES.MENTOR], {
      allowedRoles: [ROLES.ADMIN, ROLES.COMPANY],
    });
    expect(screen.getByText("denied")).toBeInTheDocument();
  });

  it("grants a permission held through any one role", () => {
    gate([ROLES.STUDENT, ROLES.ENABLER], { permission: "campus:manage" });
    expect(screen.getByText("allowed")).toBeInTheDocument();
  });
});
