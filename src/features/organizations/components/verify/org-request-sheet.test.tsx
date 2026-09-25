import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { UnverifiedOrgItem } from "../../schemas/verification.schema";
import { OrgRequestSheet } from "./org-request-sheet";

const org: UnverifiedOrgItem = {
  id: "3f2504e0-4f89-41d3-9a0c-0305e82c3301",
  title: "Govt. Engineering College, Somewhere",
  org_type: "College",
  graduation_year: 2027,
  department: null,
  created_by: "Ravi",
  created_by_muid: "ravi@mulearn",
  created_by_email: "ravi@example.com",
  created_at: "2026-09-24T12:00:00Z",
};

const renderSheet = (handlers: Partial<Record<string, () => void>> = {}) => {
  const props = {
    onOpenChange: vi.fn(),
    onApprove: vi.fn(),
    onReject: vi.fn(),
    ...handlers,
  };
  render(<OrgRequestSheet org={org} open {...props} />);
  return props;
};

describe("OrgRequestSheet", () => {
  it("shows the request and who submitted it", () => {
    renderSheet();
    expect(
      screen.getByText("Govt. Engineering College, Somewhere"),
    ).toBeInTheDocument();
    expect(screen.getByText("ravi@mulearn")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "ravi@example.com" }),
    ).toHaveAttribute("href", "mailto:ravi@example.com");
  });

  it("shows an em dash for a field the submitter left out", () => {
    renderSheet();
    expect(screen.getByText("Department").nextElementSibling).toHaveTextContent(
      "—",
    );
  });

  it("hands the request to the approve flow and closes itself", () => {
    const props = renderSheet();
    fireEvent.click(screen.getByRole("button", { name: /approve/i }));
    expect(props.onApprove).toHaveBeenCalledWith(org);
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("hands the request to the reject flow and closes itself", () => {
    const props = renderSheet();
    fireEvent.click(screen.getByRole("button", { name: /reject/i }));
    expect(props.onReject).toHaveBeenCalledWith(org);
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });
});
