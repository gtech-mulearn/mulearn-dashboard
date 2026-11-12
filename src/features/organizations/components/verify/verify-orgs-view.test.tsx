import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { UnverifiedOrgItem } from "../../schemas/verification.schema";

// vi.mock is hoisted above module-level consts, so the fixture has to be too.
const { org } = vi.hoisted(() => ({
  org: {
    id: "3f2504e0-4f89-41d3-9a0c-0305e82c3301",
    title: "Govt. Engineering College, Somewhere",
    org_type: "College",
    graduation_year: 2027,
    department: "Computer Science",
    created_by: "Ravi",
    created_by_muid: "ravi@mulearn",
    created_by_email: "ravi@example.com",
    created_at: "2026-09-24T12:00:00Z",
  } as UnverifiedOrgItem,
}));

// Data hooks are mocked so the test covers the row actions, not the network.
vi.mock("../../hooks/use-verification", () => {
  const list = {
    data: {
      data: [org],
      pagination: {
        count: 1,
        totalPages: 1,
        isNext: false,
        isPrev: false,
        nextPage: null,
      },
    },
    isLoading: false,
  };
  const mutation = { mutate: vi.fn(), isPending: false };
  return {
    useUnverifiedOrgs: () => list,
    useVerifyOrganization: () => mutation,
  };
});
vi.mock("../../hooks/use-organizations", () => {
  const orgs = { data: { data: [] }, isLoading: false };
  return { useOrgsList: () => orgs };
});

import VerifyOrgsView from "./verify-orgs-view";

describe("College tab — row actions", () => {
  it("View opens the request sheet", () => {
    render(<VerifyOrgsView />);
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    expect(screen.getByText("Organization request")).toBeInTheDocument();
  });

  it("Approve opens the approve dialog", () => {
    render(<VerifyOrgsView />);
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(
      screen.getByText("Approve Organization Request"),
    ).toBeInTheDocument();
  });

  it("Reject opens the reject dialog", () => {
    render(<VerifyOrgsView />);
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    expect(screen.getByText("Reject Organization Request")).toBeInTheDocument();
  });
});
