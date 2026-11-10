import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NoCompanyAccessError } from "../api/jobs.api";

const { useCompanyProfile } = vi.hoisted(() => ({
  useCompanyProfile: vi.fn(),
}));
vi.mock("../hooks", () => ({ useCompanyProfile }));

import { CompanyStatusGuard } from "./company-status-guard";

const base = {
  profile: undefined,
  isActive: false,
  isLoading: false,
  isError: false,
  error: null,
};

describe("CompanyStatusGuard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("explains that the user has no company instead of a generic error", () => {
    useCompanyProfile.mockReturnValue({
      ...base,
      isError: true,
      error: new NoCompanyAccessError(),
    });
    render(<CompanyStatusGuard>child</CompanyStatusGuard>);
    expect(
      screen.getByText("You're not part of a company on muLearn"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Unable to load company profile"),
    ).not.toBeInTheDocument();
  });

  it("tells the owner their company was deactivated", () => {
    useCompanyProfile.mockReturnValue({
      ...base,
      profile: { status: "deactivated" },
    });
    render(<CompanyStatusGuard>child</CompanyStatusGuard>);
    expect(
      screen.getByText("This company has been deactivated."),
    ).toBeInTheDocument();
  });

  it("renders the page for an active company", () => {
    useCompanyProfile.mockReturnValue({
      ...base,
      isActive: true,
      profile: { status: "verified" },
    });
    render(<CompanyStatusGuard>child</CompanyStatusGuard>);
    expect(screen.getByText("child")).toBeInTheDocument();
  });
});
