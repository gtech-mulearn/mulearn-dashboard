import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { replace, search } = vi.hoisted(() => ({
  replace: vi.fn(),
  search: { value: "" },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/dashboard/management/role-verification",
  useSearchParams: () => new URLSearchParams(search.value),
}));

// Queues are stubbed: this test covers tab selection, not the tables.
vi.mock("@/features/mentor/admin/components/mentor-verification-page", () => ({
  MentorVerificationPanel: () => <div>mentor-panel</div>,
}));
vi.mock("@/features/role-verification", () => ({
  RoleVerificationTable: ({ roleTitle }: { roleTitle: string }) => (
    <div>role-panel:{roleTitle}</div>
  ),
}));
vi.mock("@/features/organizations", () => ({
  VerifyOrgsView: () => <div>college-panel</div>,
}));
vi.mock("@/features/manage-companies", () => ({
  ManageCompaniesTable: () => <div>company-panel</div>,
}));

import { RoleVerificationClient } from "./role-verification-client";

describe("RoleVerificationClient", () => {
  beforeEach(() => {
    replace.mockReset();
    search.value = "";
  });

  it("opens the Mentor queue when no tab is given", () => {
    render(<RoleVerificationClient />);
    expect(screen.getByText("mentor-panel")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Mentor" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("opens the queue named in ?tab= and mounts only that one", () => {
    search.value = "tab=company";
    render(<RoleVerificationClient />);
    expect(screen.getByText("company-panel")).toBeInTheDocument();
    expect(screen.queryByText("mentor-panel")).not.toBeInTheDocument();
  });

  it("lists enablers only on the Enabler tab", () => {
    search.value = "tab=enabler";
    render(<RoleVerificationClient />);
    expect(screen.getByText("role-panel:Enabler")).toBeInTheDocument();
  });

  it("writes the chosen tab to the URL without scrolling", () => {
    render(<RoleVerificationClient />);
    fireEvent.click(screen.getByRole("tab", { name: "College" }));
    expect(replace).toHaveBeenCalledWith(
      "/dashboard/management/role-verification?tab=college",
      { scroll: false },
    );
  });
});
