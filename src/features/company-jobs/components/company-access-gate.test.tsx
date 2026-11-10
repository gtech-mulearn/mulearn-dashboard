import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  COMPANY_CAPABILITIES,
  type CompanyAccessRole,
  NO_COMPANY_CAPABILITIES,
} from "../lib/company-access";

const { useCompanyAccess, usePathname } = vi.hoisted(() => ({
  useCompanyAccess: vi.fn(),
  usePathname: vi.fn(),
}));
vi.mock("../hooks/use-company-access", () => ({ useCompanyAccess }));
vi.mock("next/navigation", () => ({ usePathname }));

import { CompanyAccessGate } from "./company-access-gate";

function visit(
  path: string,
  role: CompanyAccessRole | null,
  isLoading = false,
) {
  usePathname.mockReturnValue(path);
  useCompanyAccess.mockReturnValue({
    role,
    can: role ? COMPANY_CAPABILITIES[role] : NO_COMPANY_CAPABILITIES,
    isLoading,
  });
}

const NO_COMPANY = "You're not part of a company on muLearn";
const FORBIDDEN = "You don't have access to this page";

describe("CompanyAccessGate", () => {
  beforeEach(() => vi.clearAllMocks());

  it("waits for access to resolve before deciding", () => {
    visit("/dashboard/company/jobs", null, true);
    render(<CompanyAccessGate>page</CompanyAccessGate>);
    expect(screen.queryByText("page")).not.toBeInTheDocument();
    expect(screen.queryByText(NO_COMPANY)).not.toBeInTheDocument();
  });

  it("explains when the user is not part of any company", () => {
    visit("/dashboard/company/analytics", null);
    render(<CompanyAccessGate>page</CompanyAccessGate>);
    expect(screen.getByText(NO_COMPANY)).toBeInTheDocument();
    expect(screen.queryByText("page")).not.toBeInTheDocument();
  });

  it("keeps a company mentor out of admin-only pages, with a reason", () => {
    visit("/dashboard/company/collaborations", "company_mentor");
    render(<CompanyAccessGate>page</CompanyAccessGate>);
    expect(screen.getByText(FORBIDDEN)).toBeInTheDocument();
    expect(screen.getByText(/as a company mentor/i)).toBeInTheDocument();
    expect(screen.queryByText("page")).not.toBeInTheDocument();
  });

  it("renders pages the user's role can use", () => {
    visit("/dashboard/company/jobs/12", "company_mentor");
    render(<CompanyAccessGate>page</CompanyAccessGate>);
    expect(screen.getByText("page")).toBeInTheDocument();
  });

  it("checks an explicit capability for company pages elsewhere", () => {
    visit("/dashboard/talent-pool", null);
    const { rerender } = render(
      <CompanyAccessGate capability="viewTalentPool">page</CompanyAccessGate>,
    );
    expect(screen.getByText(NO_COMPANY)).toBeInTheDocument();

    visit("/dashboard/talent-pool", "company_mentor");
    rerender(
      <CompanyAccessGate capability="viewTalentPool">page</CompanyAccessGate>,
    );
    expect(screen.getByText("page")).toBeInTheDocument();
  });
});
