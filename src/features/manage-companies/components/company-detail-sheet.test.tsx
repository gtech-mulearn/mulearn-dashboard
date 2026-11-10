import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CompanyVerificationItem } from "../schemas";

const { useCompanyDetails } = vi.hoisted(() => ({
  useCompanyDetails: vi.fn(),
}));
vi.mock("../hooks/use-manage-companies", () => ({ useCompanyDetails }));

import { CompanyDetailSheet } from "./company-detail-sheet";

const company = {
  id: "c1",
  name: "Acme",
  slug: "acme",
  status: "pending",
} as CompanyVerificationItem;

function show(verification_document_url: string | null) {
  useCompanyDetails.mockReturnValue({
    data: { id: "c1", name: "Acme", slug: "acme", verification_document_url },
    isLoading: false,
  });
  render(
    <CompanyDetailSheet
      open
      onOpenChange={vi.fn()}
      company={company}
      onApprove={vi.fn()}
      onReject={vi.fn()}
    />,
  );
}

describe("CompanyDetailSheet — verification evidence", () => {
  beforeEach(() => vi.clearAllMocks());

  it("links to the submitted verification document", () => {
    show("https://drive.google.com/file/d/abc/view");
    const link = screen.getByRole("link", {
      name: /verification document/i,
    });
    expect(link).toHaveAttribute(
      "href",
      "https://drive.google.com/file/d/abc/view",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(
      screen.getByRole("button", { name: "Approve company" }),
    ).toBeEnabled();
  });

  it("blocks approval without a document", () => {
    show(null);
    expect(screen.getByText("No verification document")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Approve company" }),
    ).toBeDisabled();
  });
});
